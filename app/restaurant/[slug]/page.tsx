import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import RestaurantClient from "@/components/features/restaurant/RestaurantClient"

interface PageProps {
    params: Promise<{ slug: string }>
}

export default async function RestaurantPage(props: PageProps) {
    const params = await props.params
    const { slug } = params

    const restaurant = await prisma.restaurant.findUnique({
        where: { slug },
        include: {
            category: true,
            owner: {
                select: {
                    name: true,
                    email: true,
                },
            },
            products: {
                where: {
                    isAvailable: true,
                },
                orderBy: [
                    { category: "asc" },
                    { name: "asc" },
                ],
            },
            paymentMethods: {
                include: {
                    paymentMethod: true,
                },
            },
        },
    })

    if (!restaurant) {
        notFound()
    }

    // utilitários de serialização
    function serializeDecimal(value: any) {
        if (value == null) return null
        if (typeof value === "object" && typeof value.toNumber === "function") {
            return value.toNumber()
        }
        return Number(value)
    }

    function serializeProduct(p: any) {
        return {
            ...p,
            price: serializeDecimal(p.price),
            discountPrice: p.discountPrice ? serializeDecimal(p.discountPrice) : null,
            createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : null,
            updatedAt: p.updatedAt ? new Date(p.updatedAt).toISOString() : null,
        }
    }

    // serializa restaurant (sem objetos complexos)
    const serializedRestaurant = {
        ...restaurant,
        createdAt: restaurant.createdAt ? restaurant.createdAt.toISOString() : null,
        updatedAt: restaurant.updatedAt ? restaurant.updatedAt.toISOString() : null,
        // se existirem campos Decimal no restaurant (ex: rating), convertê-los:
        rating: restaurant.rating ? Number(restaurant.rating) : restaurant.rating,
        deliveryFee: restaurant.deliveryFee ? serializeDecimal(restaurant.deliveryFee) : null,
        minOrderValue: restaurant.minOrderValue ? serializeDecimal(restaurant.minOrderValue) : null,
        estimatedDeliveryTime: Number(restaurant.estimatedDeliveryTime),
    }

    // agrupar e serializar produtos por categoria
    const productsByCategory: Record<string, any[]> = {}
        ; (restaurant.products || []).forEach((p: any) => {
            const cat = p.category || "Sem categoria"
            if (!productsByCategory[cat]) productsByCategory[cat] = []
            productsByCategory[cat].push(serializeProduct(p))
        })

    // opcional: passar também array simples de products serializados
    // const serializedProducts = (restaurant.products || []).map(serializeProduct)

    return (
        <RestaurantClient
            restaurant={serializedRestaurant}
            productsByCategory={productsByCategory}
        />
    )
}
