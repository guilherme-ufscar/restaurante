"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const createReviewSchema = z.object({
    orderId: z.string(),
    rating: z.number().min(1).max(5),
    comment: z.string().max(500).optional()
})

export async function createReview(data: z.infer<typeof createReviewSchema>) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            return { success: false, message: "Você precisa estar logado para avaliar." }
        }

        const validation = createReviewSchema.safeParse(data)
        if (!validation.success) {
            return { success: false, message: "Dados inválidos." }
        }

        const { orderId, rating, comment } = validation.data

        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { restaurant: true }
        })

        if (!order) {
            return { success: false, message: "Pedido não encontrado." }
        }

        if (order.userId !== session.user.id) {
            return { success: false, message: "Você só pode avaliar seus próprios pedidos." }
        }

        if (order.status !== "COMPLETED") {
            return { success: false, message: "Apenas pedidos concluídos podem ser avaliados." }
        }

        const existingReview = await prisma.review.findUnique({
            where: { orderId }
        })

        if (existingReview) {
            return { success: false, message: "Este pedido já foi avaliado." }
        }

        await prisma.review.create({
            data: {
                orderId,
                userId: session.user.id,
                restaurantId: order.restaurantId,
                rating,
                comment
            }
        })

        // Atualizar média do restaurante
        const aggregations = await prisma.review.aggregate({
            where: { restaurantId: order.restaurantId },
            _avg: { rating: true },
            _count: true
        })

        await prisma.restaurant.update({
            where: { id: order.restaurantId },
            data: {
                rating: aggregations._avg.rating || 0,
                totalReviews: aggregations._count
            }
        })

        revalidatePath(`/orders`)
        revalidatePath(`/restaurant/${order.restaurant.slug}`)

        return { success: true }
    } catch (error: any) {
        console.error("Erro ao criar avaliação:", error)
        return { success: false, message: "Erro ao enviar avaliação." }
    }
}
