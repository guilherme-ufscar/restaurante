import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

type OrderItemInput = {
    productId: string
    quantity: number
    price?: number // optional client-side price, but we will validate using DB price
    notes?: string | null
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.email) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
        }

        // Buscar ID do usuário pelo email da sessão
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true }
        })

        if (!user) {
            return NextResponse.json({ error: "Usuário não encontrado" }, { status: 401 })
        }

        const body = await request.json()

        const {
            items,
            deliveryType,
            addressId,
            paymentMethodId,
            notes,
            restaurantId,
        } = body as {
            items: OrderItemInput[]
            deliveryType: "DELIVERY" | "PICKUP"
            addressId?: string | null
            paymentMethodId?: string | null
            notes?: string | null
            restaurantId: string
        }

        // Validações básicas
        if (!items || !Array.isArray(items) || items.length === 0) {
            return NextResponse.json({ error: "Carrinho vazio" }, { status: 400 })
        }

        if (deliveryType === "DELIVERY" && !addressId) {
            return NextResponse.json({ error: "Endereço obrigatório para entrega" }, { status: 400 })
        }

        if (!paymentMethodId) {
            return NextResponse.json({ error: "Forma de pagamento obrigatória" }, { status: 400 })
        }

        // Validar restaurante
        const restaurant = await prisma.restaurant.findUnique({
            where: { id: restaurantId },
            select: { id: true, deliveryFee: true, isActive: true, isApproved: true, name: true },
        })

        if (!restaurant) {
            return NextResponse.json({ error: "Restaurante não encontrado" }, { status: 404 })
        }

        // Buscar produtos atuais e validar disponibilidade / preços
        const productIds = items.map((i) => i.productId)
        const products = await prisma.product.findMany({
            where: { id: { in: productIds } },
            select: {
                id: true,
                name: true,
                price: true,
                discountPrice: true,
                isAvailable: true,
                restaurantId: true,
            },
        })

        // Mapear products por id para consulta rápida
        const productsMap = new Map<string, typeof products[0]>()
        products.forEach((p) => productsMap.set(p.id, p))

        let itemsTotal = 0
        const orderItemsData: {
            productId: string
            quantity: number
            unitPrice: number
            totalPrice: number
            notes?: string | null
        }[] = []

        for (const item of items) {
            const product = productsMap.get(item.productId)
            if (!product) {
                return NextResponse.json({ error: `Produto não encontrado: ${item.productId}` }, { status: 400 })
            }

            if (!product.isAvailable) {
                return NextResponse.json({ error: `Produto indisponível: ${product.name}` }, { status: 400 })
            }

            // Garantir que o produto pertence ao mesmo restaurante do pedido
            if (product.restaurantId !== restaurantId) {
                return NextResponse.json({ error: `Produto ${product.name} não pertence ao restaurante selecionado` }, { status: 400 })
            }

            // Converte Decimal para number (Prisma Decimal tem toNumber)
            const unitPrice =
                product.discountPrice && (product.discountPrice as any).toNumber
                    ? (product.discountPrice as any).toNumber()
                    : (product.price as any).toNumber
                        ? (product.price as any).toNumber()
                        : Number(product.discountPrice ?? product.price)

            const quantity = Number(item.quantity) || 1
            const totalPrice = unitPrice * quantity

            itemsTotal += totalPrice

            orderItemsData.push({
                productId: product.id,
                quantity,
                unitPrice,
                totalPrice,
                notes: item.notes || null,
            })
        }

        // Delivery fee
        const deliveryFeeValue =
            deliveryType === "DELIVERY" ? ((restaurant.deliveryFee as any)?.toNumber ? (restaurant.deliveryFee as any).toNumber() : Number(restaurant.deliveryFee || 0)) : 0

        const finalAmount = itemsTotal + deliveryFeeValue

        // Snapshot do endereço (se DELIVERY)
        let deliveryAddressSnapshot: string | null = null
        if (deliveryType === "DELIVERY" && addressId) {
            const address = await prisma.address.findUnique({ where: { id: addressId } })
            if (!address) {
                return NextResponse.json({ error: "Endereço não encontrado" }, { status: 400 })
            }
            deliveryAddressSnapshot = `${address.street} ${address.number} ${address.complement ?? ""} - ${address.neighborhood}, ${address.city} - ${address.state} CEP ${address.zipCode}`
        }

        // Gerar orderNumber simples e único
        const orderNumber = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 9000 + 1000)}`

        // Criar pedido em transação
        const createdOrder = await prisma.$transaction(async (prismaTxn) => {
            const order = await prismaTxn.order.create({
                data: {
                    orderNumber,
                    userId: user.id,
                    restaurantId,
                    totalAmount: itemsTotal,
                    deliveryFee: deliveryFeeValue,
                    finalAmount,
                    deliveryType,
                    addressId: deliveryType === "DELIVERY" ? addressId : null,
                    paymentMethodId,
                    paymentStatus: "PENDING",
                    status: "PENDING",
                    notes: notes || null,
                    deliveryAddress: deliveryAddressSnapshot || undefined, // undefined se null para o Prisma aceitar se for opcional
                    // Criar orderItems
                    items: {
                        create: orderItemsData.map((oi) => ({
                            productId: oi.productId,
                            quantity: oi.quantity,
                            unitPrice: oi.unitPrice,
                            totalPrice: oi.totalPrice,
                            notes: oi.notes,
                        })),
                    },
                },
                select: {
                    id: true,
                },
            })

            return order
        })

        return NextResponse.json({ success: true, orderId: createdOrder.id }, { status: 201 })
    } catch (err: any) {
        console.error("Erro ao criar pedido:", err)
        // Se for erro de validação do Prisma ou outro, devolver JSON
        return NextResponse.json({ error: err?.message || "Erro interno" }, { status: 500 })
    }
}
