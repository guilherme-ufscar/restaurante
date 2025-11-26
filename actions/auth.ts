"use server"

import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { UserRole } from "@prisma/client"

export async function signUp(
    name: string,
    email: string,
    password: string,
    role: UserRole = UserRole.USER
) {
    try {
        // Verifica se o usuário já existe
        const existingUser = await prisma.user.findUnique({
            where: { email }
        })

        if (existingUser) {
            return {
                success: false,
                error: "Usuário já existe com este email"
            }
        }

        // Hash da senha
        const hashedPassword = await bcrypt.hash(password, 10)

        // Cria o usuário
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role
            }
        })

        return {
            success: true,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        }
    } catch (error) {
        console.error("Erro ao criar usuário:", error)
        return {
            success: false,
            error: "Erro ao criar usuário. Tente novamente."
        }
    }
}

export async function createRestaurantUser(
    name: string,
    email: string,
    password: string,
    restaurantData: {
        name: string
        slug: string
        categoryId: string
        phone: string
        email: string
        minOrderValue: number
        deliveryFee: number
        estimatedDeliveryTime: number
        opensAt: string
        closesAt: string
    }
) {
    try {
        // Verifica se o usuário já existe
        const existingUser = await prisma.user.findUnique({
            where: { email }
        })

        if (existingUser) {
            return {
                success: false,
                error: "Usuário já existe com este email"
            }
        }

        // Verifica se o slug do restaurante já existe
        const existingRestaurant = await prisma.restaurant.findUnique({
            where: { slug: restaurantData.slug }
        })

        if (existingRestaurant) {
            return {
                success: false,
                error: "Slug do restaurante já está em uso"
            }
        }

        // Hash da senha
        const hashedPassword = await bcrypt.hash(password, 10)

        // Cria usuário e restaurante em uma transação
        const result = await prisma.$transaction(async (tx) => {
            // Cria o usuário
            const user = await tx.user.create({
                data: {
                    name,
                    email,
                    password: hashedPassword,
                    role: UserRole.RESTAURANT
                }
            })

            // Cria o restaurante
            const restaurant = await tx.restaurant.create({
                data: {
                    name: restaurantData.name,
                    slug: restaurantData.slug,
                    email: restaurantData.email,
                    phone: restaurantData.phone,
                    ownerId: user.id,
                    categoryId: restaurantData.categoryId,
                    minOrderValue: restaurantData.minOrderValue,
                    deliveryFee: restaurantData.deliveryFee,
                    estimatedDeliveryTime: restaurantData.estimatedDeliveryTime,
                    opensAt: restaurantData.opensAt,
                    closesAt: restaurantData.closesAt
                }
            })

            return { user, restaurant }
        })

        return {
            success: true,
            user: {
                id: result.user.id,
                email: result.user.email,
                name: result.user.name,
                role: result.user.role
            },
            restaurant: {
                id: result.restaurant.id,
                name: result.restaurant.name,
                slug: result.restaurant.slug
            }
        }
    } catch (error) {
        console.error("Erro ao criar usuário do restaurante:", error)
        return {
            success: false,
            error: "Erro ao criar usuário do restaurante. Tente novamente."
        }
    }
}
