"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { revalidatePath } from "next/cache"

const restaurantInfoSchema = z.object({
    name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
    description: z.string().max(500, "Descrição muito longa").optional().nullable(),
    categoryId: z.string().min(1, "Categoria é obrigatória"),
    phone: z.string().min(10, "Telefone inválido"),
    email: z.string().email("Email inválido"),
    opensAt: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Horário inválido"),
    closesAt: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Horário inválido"),
    minOrderValue: z.number().min(0),
    deliveryFee: z.number().min(0),
    estimatedDeliveryTime: z.number().int().positive(),
    acceptsDelivery: z.boolean(),
    acceptsPickup: z.boolean(),
}).refine(data => data.acceptsDelivery || data.acceptsPickup, {
    message: "Selecione pelo menos um método de entrega",
    path: ["acceptsDelivery"]
})

export async function updateRestaurantInfo(data: z.infer<typeof restaurantInfoSchema>) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user || session.user.role !== "RESTAURANT") {
            return { success: false, message: "Acesso negado" }
        }

        const restaurant = await prisma.restaurant.findUnique({
            where: { ownerId: session.user.id }
        })

        if (!restaurant) {
            return { success: false, message: "Restaurante não encontrado" }
        }

        const validation = restaurantInfoSchema.safeParse(data)
        if (!validation.success) {
            return { success: false, message: "Dados inválidos" }
        }

        const {
            name, description, categoryId, phone, email,
            opensAt, closesAt, minOrderValue, deliveryFee,
            estimatedDeliveryTime, acceptsDelivery, acceptsPickup
        } = validation.data

        await prisma.restaurant.update({
            where: { id: restaurant.id },
            data: {
                name, description, categoryId, phone, email,
                opensAt, closesAt, minOrderValue, deliveryFee,
                estimatedDeliveryTime, acceptsDelivery, acceptsPickup
            }
        })

        revalidatePath("/restaurant/dashboard/settings")
        return { success: true }
    } catch (error) {
        console.error("Erro ao atualizar informações:", error)
        return { success: false, message: "Erro ao atualizar informações" }
    }
}

export async function updateRestaurantImages(logo: string | null, banner: string | null) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user || session.user.role !== "RESTAURANT") {
            return { success: false, message: "Acesso negado" }
        }

        const restaurant = await prisma.restaurant.findUnique({
            where: { ownerId: session.user.id }
        })

        if (!restaurant) {
            return { success: false, message: "Restaurante não encontrado" }
        }

        // Validação básica de tamanho (ex: 5MB aprox em base64)
        if (logo && logo.length > 7000000) return { success: false, message: "Logo muito grande" }
        if (banner && banner.length > 7000000) return { success: false, message: "Banner muito grande" }

        await prisma.restaurant.update({
            where: { id: restaurant.id },
            data: { logo, banner }
        })

        revalidatePath("/restaurant/dashboard/settings")
        return { success: true }
    } catch (error) {
        console.error("Erro ao atualizar imagens:", error)
        return { success: false, message: "Erro ao atualizar imagens" }
    }
}

export async function togglePaymentMethod(paymentMethodId: string, currentState: boolean) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user || session.user.role !== "RESTAURANT") {
            return { success: false, message: "Acesso negado" }
        }

        const restaurant = await prisma.restaurant.findUnique({
            where: { ownerId: session.user.id },
            include: { paymentMethods: true }
        })

        if (!restaurant) {
            return { success: false, message: "Restaurante não encontrado" }
        }

        if (currentState) {
            // Desativar (remover)
            // Verificar se é o último
            if (restaurant.paymentMethods.length <= 1) {
                return { success: false, message: "Deve haver pelo menos um método de pagamento ativo" }
            }

            await prisma.restaurantPaymentMethod.delete({
                where: {
                    restaurantId_paymentMethodId: {
                        restaurantId: restaurant.id,
                        paymentMethodId
                    }
                }
            })
        } else {
            // Ativar (criar)
            await prisma.restaurantPaymentMethod.create({
                data: {
                    restaurantId: restaurant.id,
                    paymentMethodId,
                    isActive: true
                }
            })
        }

        revalidatePath("/restaurant/dashboard/settings")
        return { success: true }
    } catch (error) {
        console.error("Erro ao alterar método de pagamento:", error)
        return { success: false, message: "Erro ao alterar método de pagamento" }
    }
}
