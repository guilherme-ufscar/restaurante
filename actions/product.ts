"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { revalidatePath } from "next/cache"

const productSchema = z.object({
    name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
    description: z.string().optional(),
    category: z.string().min(3, "Categoria é obrigatória"),
    price: z.number().positive("Preço deve ser positivo"),
    discountPrice: z.number().positive("Preço com desconto deve ser positivo").optional().nullable(),
    image: z.string().optional().nullable(),
    preparationTime: z.number().int().positive().optional().nullable(),

    isAvailable: z.boolean().default(true),
    variations: z.array(z.object({
        name: z.string().min(1),
        required: z.boolean(),
        multiSelect: z.boolean(),
        options: z.array(z.object({
            name: z.string().min(1),
            price: z.number().min(0),
        })).min(1),
    })).optional(),
}).refine((data) => {
    if (data.discountPrice && data.discountPrice >= data.price) {
        return false
    }
    return true
}, {
    message: "Preço com desconto deve ser menor que o preço original",
    path: ["discountPrice"],
})

export async function createProduct(data: z.infer<typeof productSchema>, restaurantId: string) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user || session.user.role !== "RESTAURANT") {
            return { success: false, message: "Acesso negado" }
        }

        // Verificar se o restaurante pertence ao usuário
        let targetRestaurantId = restaurantId

        if (restaurantId === "me") {
            const userRestaurant = await prisma.restaurant.findUnique({
                where: { ownerId: session.user.id },
            })
            if (!userRestaurant) {
                return { success: false, message: "Restaurante não encontrado" }
            }
            targetRestaurantId = userRestaurant.id
        }

        const restaurant = await prisma.restaurant.findUnique({
            where: { id: targetRestaurantId },
            include: { subscriptionPlan: true }
        })

        if (!restaurant || restaurant.ownerId !== session.user.id) {
            return { success: false, message: "Restaurante não encontrado ou acesso negado" }
        }

        // Verificar limites do plano
        if (restaurant.subscriptionPlan?.maxProducts) {
            const productCount = await prisma.product.count({
                where: { restaurantId: targetRestaurantId }
            })

            if (productCount >= restaurant.subscriptionPlan.maxProducts) {
                return {
                    success: false,
                    message: `Seu plano atual permite apenas ${restaurant.subscriptionPlan.maxProducts} produtos. Faça upgrade para adicionar mais.`
                }
            }
        }

        const validatedData = productSchema.parse(data)

        const { variations, ...productData } = validatedData

        await prisma.product.create({
            data: {
                ...productData,
                restaurantId: targetRestaurantId,
                price: productData.price,
                discountPrice: productData.discountPrice || null,
                variations: variations ? {
                    create: variations.map(v => ({
                        name: v.name,
                        required: v.required,
                        multiSelect: v.multiSelect,
                        options: {
                            create: v.options.map(o => ({
                                name: o.name,
                                price: o.price
                            }))
                        }
                    }))
                } : undefined
            },
        })

        revalidatePath("/restaurant/dashboard/products")
        return { success: true }

    } catch (error) {
        console.error("Erro ao criar produto:", error)
        if (error instanceof z.ZodError) {
            return { success: false, message: (error as any).errors?.[0]?.message || "Erro de validação" }
        }
        return { success: false, message: "Erro ao criar produto" }
    }
}

export async function updateProduct(id: string, data: z.infer<typeof productSchema>) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user || session.user.role !== "RESTAURANT") {
            return { success: false, message: "Acesso negado" }
        }

        const product = await prisma.product.findUnique({
            where: { id },
            include: { restaurant: true },
        })

        if (!product || product.restaurant.ownerId !== session.user.id) {
            return { success: false, message: "Produto não encontrado ou acesso negado" }
        }

        const validatedData = productSchema.parse(data)

        const { variations, ...productData } = validatedData

        await prisma.$transaction(async (tx) => {
            await tx.product.update({
                where: { id },
                data: {
                    ...productData,
                    price: productData.price,
                    discountPrice: productData.discountPrice || null,
                },
            })

            if (variations) {
                // Delete existing variations (cascade deletes options)
                await tx.productVariation.deleteMany({
                    where: { productId: id }
                })

                // Create new variations
                for (const v of variations) {
                    await tx.productVariation.create({
                        data: {
                            productId: id,
                            name: v.name,
                            required: v.required,
                            multiSelect: v.multiSelect,
                            options: {
                                create: v.options.map(o => ({
                                    name: o.name,
                                    price: o.price
                                }))
                            }
                        }
                    })
                }
            }
        })

        revalidatePath("/restaurant/dashboard/products")
        return { success: true }

    } catch (error) {
        console.error("Erro ao atualizar produto:", error)
        if (error instanceof z.ZodError) {
            return { success: false, message: (error as any).errors?.[0]?.message || "Erro de validação" }
        }
        return { success: false, message: "Erro ao atualizar produto" }
    }
}

export async function deleteProduct(id: string) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user || session.user.role !== "RESTAURANT") {
            return { success: false, message: "Acesso negado" }
        }

        const product = await prisma.product.findUnique({
            where: { id },
            include: { restaurant: true },
        })

        if (!product || product.restaurant.ownerId !== session.user.id) {
            return { success: false, message: "Produto não encontrado ou acesso negado" }
        }

        // Verificar se existem pedidos com este produto
        const orderItemsCount = await prisma.orderItem.count({
            where: { productId: id },
        })

        if (orderItemsCount > 0) {
            return {
                success: false,
                message: "Não é possível excluir um produto que já foi pedido. Recomendamos desativá-lo."
            }
        }

        await prisma.product.delete({
            where: { id },
        })

        revalidatePath("/restaurant/dashboard/products")
        return { success: true }

    } catch (error) {
        console.error("Erro ao excluir produto:", error)
        return { success: false, message: "Erro ao excluir produto" }
    }
}

export async function toggleProductAvailability(id: string) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user || session.user.role !== "RESTAURANT") {
            return { success: false, message: "Acesso negado" }
        }

        const product = await prisma.product.findUnique({
            where: { id },
            include: { restaurant: true },
        })

        if (!product || product.restaurant.ownerId !== session.user.id) {
            return { success: false, message: "Produto não encontrado ou acesso negado" }
        }

        await prisma.product.update({
            where: { id },
            data: { isAvailable: !product.isAvailable },
        })

        revalidatePath("/restaurant/dashboard/products")
        return { success: true }

    } catch (error) {
        console.error("Erro ao alterar disponibilidade:", error)
        return { success: false, message: "Erro ao alterar disponibilidade" }
    }
}
