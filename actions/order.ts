"use server"

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

// --- Restaurant Actions ---

export async function confirmOrder(orderId: string) {
    try {
        const session = await auth()

        if (!session?.user || session.user.role !== 'RESTAURANT') {
            return { success: false, message: 'Não autorizado' }
        }

        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { restaurant: true },
        })

        if (!order) {
            return { success: false, message: 'Pedido não encontrado' }
        }

        if (order.restaurant.ownerId !== session.user.id) {
            return { success: false, message: 'Você não tem permissão para gerenciar este pedido' }
        }

        await prisma.order.update({
            where: { id: orderId },
            data: { status: 'CONFIRMED' },
        })

        revalidatePath('/restaurant/dashboard/orders')

        return { success: true, message: 'Pedido confirmado com sucesso' }
    } catch (error) {
        console.error('Erro ao confirmar pedido:', error)
        return { success: false, message: 'Erro ao confirmar pedido' }
    }
}

export async function startPreparingOrder(orderId: string) {
    try {
        const session = await auth()

        if (!session?.user || session.user.role !== 'RESTAURANT') {
            return { success: false, message: 'Não autorizado' }
        }

        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { restaurant: true },
        })

        if (!order) {
            return { success: false, message: 'Pedido não encontrado' }
        }

        if (order.restaurant.ownerId !== session.user.id) {
            return { success: false, message: 'Não autorizado' }
        }

        await prisma.order.update({
            where: { id: orderId },
            data: { status: 'PREPARING' },
        })

        revalidatePath('/restaurant/dashboard/orders')

        return { success: true, message: 'Pedido em preparo' }
    } catch (error) {
        console.error('Erro ao iniciar preparo:', error)
        return { success: false, message: 'Erro ao iniciar preparo' }
    }
}

export async function markOrderAsReady(orderId: string) {
    try {
        const session = await auth()

        if (!session?.user || session.user.role !== 'RESTAURANT') {
            return { success: false, message: 'Não autorizado' }
        }

        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { restaurant: true },
        })

        if (!order) {
            return { success: false, message: 'Pedido não encontrado' }
        }

        if (order.restaurant.ownerId !== session.user.id) {
            return { success: false, message: 'Não autorizado' }
        }

        await prisma.order.update({
            where: { id: orderId },
            data: { status: 'READY' },
        })

        revalidatePath('/restaurant/dashboard/orders')

        return { success: true, message: 'Pedido marcado como pronto' }
    } catch (error) {
        console.error('Erro ao marcar pedido como pronto:', error)
        return { success: false, message: 'Erro ao marcar pedido como pronto' }
    }
}

export async function startDelivery(orderId: string) {
    try {
        const session = await auth()

        if (!session?.user || session.user.role !== 'RESTAURANT') {
            return { success: false, message: 'Não autorizado' }
        }

        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { restaurant: true },
        })

        if (!order) {
            return { success: false, message: 'Pedido não encontrado' }
        }

        if (order.restaurant.ownerId !== session.user.id) {
            return { success: false, message: 'Não autorizado' }
        }

        await prisma.order.update({
            where: { id: orderId },
            data: { status: 'DELIVERING' },
        })

        revalidatePath('/restaurant/dashboard/orders')

        return { success: true, message: 'Pedido saiu para entrega' }
    } catch (error) {
        console.error('Erro ao iniciar entrega:', error)
        return { success: false, message: 'Erro ao iniciar entrega' }
    }
}

export async function completeOrder(orderId: string) {
    try {
        const session = await auth()

        if (!session?.user || session.user.role !== 'RESTAURANT') {
            return { success: false, message: 'Não autorizado' }
        }

        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { restaurant: true },
        })

        if (!order) {
            return { success: false, message: 'Pedido não encontrado' }
        }

        if (order.restaurant.ownerId !== session.user.id) {
            return { success: false, message: 'Não autorizado' }
        }

        await prisma.order.update({
            where: { id: orderId },
            data: {
                status: 'COMPLETED',
                paymentStatus: 'PAID',
            },
        })

        revalidatePath('/restaurant/dashboard/orders')

        return { success: true, message: 'Pedido concluído' }
    } catch (error) {
        console.error('Erro ao completar pedido:', error)
        return { success: false, message: 'Erro ao completar pedido' }
    }
}

export async function cancelOrder(orderId: string, cancelReason: string) {
    try {
        const schema = z.object({
            orderId: z.string().min(1),
            cancelReason: z.string().min(10, 'O motivo deve ter pelo menos 10 caracteres'),
        })

        schema.parse({ orderId, cancelReason })

        const session = await auth()

        if (!session?.user || session.user.role !== 'RESTAURANT') {
            return { success: false, message: 'Não autorizado' }
        }

        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { restaurant: true },
        })

        if (!order) {
            return { success: false, message: 'Pedido não encontrado' }
        }

        if (order.restaurant.ownerId !== session.user.id) {
            return { success: false, message: 'Não autorizado' }
        }

        await prisma.order.update({
            where: { id: orderId },
            data: {
                status: 'CANCELLED',
                cancelReason,
                cancelledAt: new Date(),
            },
        })

        revalidatePath('/restaurant/dashboard/orders')

        return { success: true, message: 'Pedido cancelado' }
    } catch (error) {
        console.error('Erro ao cancelar pedido:', error)
        return { success: false, message: 'Erro ao cancelar pedido' }
    }
}

// --- Customer Actions ---

export async function createOrder(data: {
    items: any[]
    restaurantId: string
    totalAmount: number
    deliveryFee: number
    finalAmount: number
    deliveryType: 'DELIVERY' | 'PICKUP'
    paymentMethodId: string
    addressId: string | null
    deliveryAddress: string | null
    notes?: string
}) {
    try {
        const session = await auth()

        if (!session?.user) {
            return { success: false, message: 'Você precisa estar logado para fazer um pedido' }
        }

        // Gerar número do pedido (simples timestamp + random para exemplo)
        const orderNumber = `#${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 100)}`

        const order = await prisma.order.create({
            data: {
                orderNumber,
                userId: session.user.id,
                restaurantId: data.restaurantId,
                status: 'PENDING',
                totalAmount: data.totalAmount,
                deliveryFee: data.deliveryFee,
                finalAmount: data.finalAmount,
                deliveryType: data.deliveryType,
                paymentMethodId: data.paymentMethodId,
                paymentStatus: 'PENDING',
                addressId: data.addressId,
                deliveryAddress: data.deliveryAddress,
                notes: data.notes,
                items: {
                    create: data.items.map((item) => ({
                        productId: item.productId,
                        quantity: item.quantity,
                        unitPrice: item.unitPrice,
                        totalPrice: item.totalPrice,
                        notes: item.notes,
                    })),
                },
            },
        })

        return { success: true, orderNumber: order.orderNumber, orderId: order.id }
    } catch (error) {
        console.error('Erro ao criar pedido:', error)
        return { success: false, message: 'Erro ao criar pedido. Tente novamente.' }
    }
}
