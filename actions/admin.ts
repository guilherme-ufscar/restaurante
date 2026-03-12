"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

// --- RESTAURANTS ---

const approveRestaurantSchema = z.object({
    restaurantId: z.string().min(1)
})

export async function approveRestaurant(restaurantId: string) {
    try {
        const session = await getServerSession(authOptions)
        if (session?.user.role !== "ADMIN") {
            return { success: false, message: "Unauthorized" }
        }

        await prisma.restaurant.update({
            where: { id: restaurantId },
            data: {
                isApproved: true,
                approvedAt: new Date(),
                rejectedAt: null,
                rejectionReason: null,
                isActive: true
            }
        })

        revalidatePath("/admin/restaurants")
        revalidatePath(`/admin/restaurants/${restaurantId}`)
        return { success: true }
    } catch (error) {
        console.error("Error approving restaurant:", error)
        return { success: false, message: "Failed to approve restaurant" }
    }
}

const rejectRestaurantSchema = z.object({
    restaurantId: z.string().min(1),
    rejectionReason: z.string().min(20, "O motivo deve ter pelo menos 20 caracteres")
})

export async function rejectRestaurant(restaurantId: string, rejectionReason: string) {
    try {
        const session = await getServerSession(authOptions)
        if (session?.user.role !== "ADMIN") {
            return { success: false, message: "Unauthorized" }
        }

        const validation = rejectRestaurantSchema.safeParse({ restaurantId, rejectionReason })
        if (!validation.success) {
            return { success: false, message: validation.error.issues[0].message }
        }

        await prisma.restaurant.update({
            where: { id: restaurantId },
            data: {
                isApproved: false,
                rejectedAt: new Date(),
                rejectionReason,
                isActive: false
            }
        })

        revalidatePath("/admin/restaurants")
        revalidatePath(`/admin/restaurants/${restaurantId}`)
        return { success: true }
    } catch (error) {
        console.error("Error rejecting restaurant:", error)
        return { success: false, message: "Failed to reject restaurant" }
    }
}

export async function suspendRestaurant(restaurantId: string) {
    try {
        const session = await getServerSession(authOptions)
        if (session?.user.role !== "ADMIN") {
            return { success: false, message: "Unauthorized" }
        }

        await prisma.restaurant.update({
            where: { id: restaurantId },
            data: { isActive: false }
        })

        revalidatePath("/admin/restaurants")
        revalidatePath(`/admin/restaurants/${restaurantId}`)
        return { success: true }
    } catch (error) {
        console.error("Error suspending restaurant:", error)
        return { success: false, message: "Failed to suspend restaurant" }
    }
}

export async function activateRestaurant(restaurantId: string) {
    try {
        const session = await getServerSession(authOptions)
        if (session?.user.role !== "ADMIN") {
            return { success: false, message: "Unauthorized" }
        }

        const schema = z.object({ restaurantId: z.string().min(1) })
        const validation = schema.safeParse({ restaurantId })

        if (!validation.success) {
            return { success: false, message: "Invalid ID" }
        }

        const restaurant = await prisma.restaurant.findUnique({ where: { id: restaurantId } })
        if (!restaurant) {
            return { success: false, message: "Restaurant not found" }
        }

        await prisma.restaurant.update({
            where: { id: restaurantId },
            data: { isActive: true }
        })

        revalidatePath("/admin/restaurants")
        revalidatePath(`/admin/restaurants/${restaurantId}`)
        return { success: true, message: "Restaurante ativado com sucesso" }
    } catch (error) {
        console.error("Error activating restaurant:", error)
        return { success: false, message: "Erro ao ativar restaurante" }
    }
}

// --- CATEGORIES ---

const categorySchema = z.object({
    name: z.string().min(3).max(50),
    description: z.string().max(200).optional(),
    image: z.string().optional(),
    isActive: z.boolean()
})

export async function createCategory(data: z.infer<typeof categorySchema>) {
    try {
        const session = await getServerSession(authOptions)
        if (session?.user.role !== "ADMIN") {
            return { success: false, message: "Unauthorized" }
        }

        const validation = categorySchema.safeParse(data)
        if (!validation.success) {
            return { success: false, message: validation.error.issues[0].message }
        }

        let slug = data.name
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "")

        let slugExists = await prisma.category.findUnique({ where: { slug } })
        let count = 1
        const originalSlug = slug
        while (slugExists) {
            slug = `${originalSlug}-${count}`
            slugExists = await prisma.category.findUnique({ where: { slug } })
            count++
        }

        const category = await prisma.category.create({
            data: {
                name: data.name,
                slug,
                description: data.description,
                image: data.image,
                isActive: data.isActive
            }
        })

        revalidatePath("/admin/categories")
        revalidatePath("/categories")
        return { success: true, category }
    } catch (error) {
        console.error("Error creating category:", error)
        return { success: false, message: "Failed to create category" }
    }
}

export async function updateCategory(id: string, data: z.infer<typeof categorySchema>) {
    try {
        const session = await getServerSession(authOptions)
        if (session?.user.role !== "ADMIN") {
            return { success: false, message: "Unauthorized" }
        }

        const validation = categorySchema.safeParse(data)
        if (!validation.success) {
            return { success: false, message: validation.error.issues[0].message }
        }

        const currentCategory = await prisma.category.findUnique({ where: { id } })
        if (!currentCategory) return { success: false, message: "Category not found" }

        let slug = currentCategory.slug
        if (currentCategory.name !== data.name) {
            slug = data.name
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-|-$/g, "")

            let slugExists = await prisma.category.findFirst({ where: { slug, NOT: { id } } })
            let count = 1
            const originalSlug = slug
            while (slugExists) {
                slug = `${originalSlug}-${count}`
                slugExists = await prisma.category.findFirst({ where: { slug, NOT: { id } } })
                count++
            }
        }

        await prisma.category.update({
            where: { id },
            data: {
                name: data.name,
                slug,
                description: data.description,
                image: data.image,
                isActive: data.isActive
            }
        })

        revalidatePath("/admin/categories")
        revalidatePath("/categories")
        return { success: true }
    } catch (error) {
        console.error("Error updating category:", error)
        return { success: false, message: "Failed to update category" }
    }
}

export async function deleteCategory(id: string) {
    try {
        const session = await getServerSession(authOptions)
        if (session?.user.role !== "ADMIN") {
            return { success: false, message: "Unauthorized" }
        }

        const restaurantCount = await prisma.restaurant.count({ where: { categoryId: id } })
        if (restaurantCount > 0) {
            return { success: false, message: "Cannot delete category with associated restaurants" }
        }

        await prisma.category.delete({ where: { id } })

        revalidatePath("/admin/categories")
        revalidatePath("/categories")
        return { success: true }
    } catch (error) {
        console.error("Error deleting category:", error)
        return { success: false, message: "Failed to delete category" }
    }
}

export async function toggleCategoryStatus(id: string) {
    try {
        const session = await getServerSession(authOptions)
        if (session?.user.role !== "ADMIN") {
            return { success: false, message: "Unauthorized" }
        }

        const category = await prisma.category.findUnique({ where: { id } })
        if (!category) return { success: false, message: "Category not found" }

        await prisma.category.update({
            where: { id },
            data: { isActive: !category.isActive }
        })

        revalidatePath("/admin/categories")
        revalidatePath("/categories")
        return { success: true }
    } catch (error) {
        console.error("Error toggling category status:", error)
        return { success: false, message: "Failed to toggle status" }
    }
}

// --- PAYMENT METHODS ---

const paymentMethodSchema = z.object({
    name: z.string().min(3).max(50),
    isActive: z.boolean()
})

export async function createPaymentMethod(data: z.infer<typeof paymentMethodSchema>) {
    try {
        const session = await getServerSession(authOptions)
        if (session?.user.role !== "ADMIN") {
            return { success: false, message: "Unauthorized" }
        }

        const validation = paymentMethodSchema.safeParse(data)
        if (!validation.success) {
            return { success: false, message: validation.error.issues[0].message }
        }

        const existing = await prisma.paymentMethod.findUnique({ where: { name: data.name } })
        if (existing) {
            return { success: false, message: "Payment method already exists" }
        }

        await prisma.paymentMethod.create({
            data: {
                name: data.name,
                isActive: data.isActive
            }
        })

        revalidatePath("/admin/payment-methods")
        return { success: true }
    } catch (error) {
        console.error("Error creating payment method:", error)
        return { success: false, message: "Failed to create payment method" }
    }
}

export async function updatePaymentMethod(id: string, data: z.infer<typeof paymentMethodSchema>) {
    try {
        const session = await getServerSession(authOptions)
        if (session?.user.role !== "ADMIN") {
            return { success: false, message: "Unauthorized" }
        }

        const validation = paymentMethodSchema.safeParse(data)
        if (!validation.success) {
            return { success: false, message: validation.error.issues[0].message }
        }

        const existing = await prisma.paymentMethod.findFirst({ where: { name: data.name, NOT: { id } } })
        if (existing) {
            return { success: false, message: "Payment method name already taken" }
        }

        await prisma.paymentMethod.update({
            where: { id },
            data: {
                name: data.name,
                isActive: data.isActive
            }
        })

        revalidatePath("/admin/payment-methods")
        return { success: true }
    } catch (error) {
        console.error("Error updating payment method:", error)
        return { success: false, message: "Failed to update payment method" }
    }
}

export async function deletePaymentMethod(id: string) {
    try {
        const session = await getServerSession(authOptions)
        if (session?.user.role !== "ADMIN") {
            return { success: false, message: "Unauthorized" }
        }

        const usageCount = await prisma.restaurantPaymentMethod.count({ where: { paymentMethodId: id } })
        if (usageCount > 0) {
            return { success: false, message: "Cannot delete payment method used by restaurants" }
        }

        await prisma.paymentMethod.delete({ where: { id } })

        revalidatePath("/admin/payment-methods")
        return { success: true }
    } catch (error) {
        console.error("Error deleting payment method:", error)
        return { success: false, message: "Failed to delete payment method" }
    }
}

export async function togglePaymentMethodStatus(id: string) {
    try {
        const session = await getServerSession(authOptions)
        if (session?.user.role !== "ADMIN") {
            return { success: false, message: "Unauthorized" }
        }

        const method = await prisma.paymentMethod.findUnique({ where: { id } })
        if (!method) return { success: false, message: "Payment method not found" }

        await prisma.paymentMethod.update({
            where: { id },
            data: { isActive: !method.isActive }
        })

        revalidatePath("/admin/payment-methods")
        return { success: true }
    } catch (error) {
        console.error("Error toggling payment method status:", error)
        return { success: false, message: "Failed to toggle status" }
    }
}

// --- SUBSCRIPTION PLANS ---

const planSchema = z.object({
    name: z.string().min(3),
    description: z.string().optional(),
    price: z.number().positive(),
    interval: z.enum(["MONTHLY", "QUARTERLY", "SEMIANNUAL", "ANNUAL"]),
    features: z.array(z.string().min(3)).min(1),
    maxProducts: z.number().positive().optional().nullable(),
    maxOrders: z.number().positive().optional().nullable(),
    isActive: z.boolean()
})

export async function createSubscriptionPlan(data: z.infer<typeof planSchema>) {
    try {
        const session = await getServerSession(authOptions)
        if (session?.user.role !== "ADMIN") {
            return { success: false, message: "Unauthorized" }
        }

        const validation = planSchema.safeParse(data)
        if (!validation.success) {
            return { success: false, message: validation.error.issues[0].message }
        }

        await prisma.subscriptionPlan.create({
            data: {
                ...data,
                price: data.price, // Prisma handles Decimal conversion from number usually, but explicit Decimal might be needed if strict
                features: data.features
            }
        })

        revalidatePath("/admin/plans")
        return { success: true }
    } catch (error) {
        console.error("Error creating plan:", error)
        return { success: false, message: "Failed to create plan" }
    }
}

export async function updateSubscriptionPlan(id: string, data: z.infer<typeof planSchema>) {
    try {
        const session = await getServerSession(authOptions)
        if (session?.user.role !== "ADMIN") {
            return { success: false, message: "Unauthorized" }
        }

        const validation = planSchema.safeParse(data)
        if (!validation.success) {
            return { success: false, message: validation.error.issues[0].message }
        }

        if (!data.isActive) {
            const activeSubscribers = await prisma.restaurant.count({
                where: { subscriptionPlanId: id, subscriptionStatus: "ACTIVE" }
            })
            // Warning handled in client, here we just allow it
        }

        await prisma.subscriptionPlan.update({
            where: { id },
            data: {
                ...data,
                price: data.price
            }
        })

        revalidatePath("/admin/plans")
        return { success: true }
    } catch (error) {
        console.error("Error updating plan:", error)
        return { success: false, message: "Failed to update plan" }
    }
}

export async function toggleSubscriptionPlanStatus(id: string) {
    try {
        const session = await getServerSession(authOptions)
        if (session?.user.role !== "ADMIN") {
            return { success: false, message: "Unauthorized" }
        }

        const plan = await prisma.subscriptionPlan.findUnique({ where: { id } })
        if (!plan) return { success: false, message: "Plan not found" }

        await prisma.subscriptionPlan.update({
            where: { id },
            data: { isActive: !plan.isActive }
        })

        revalidatePath("/admin/plans")
        return { success: true }
    } catch (error) {
        console.error("Error toggling plan status:", error)
        return { success: false, message: "Failed to toggle status" }
    }
}

// --- USERS ---

export async function changeUserRole(userId: string, newRole: "USER" | "RESTAURANT" | "ADMIN") {
    try {
        const session = await getServerSession(authOptions)
        if (session?.user.role !== "ADMIN") {
            return { success: false, message: "Unauthorized" }
        }

        if (userId === session.user.id && newRole !== "ADMIN") {
            return { success: false, message: "Cannot remove your own admin privileges" }
        }

        await prisma.user.update({
            where: { id: userId },
            data: { role: newRole }
        })

        revalidatePath("/admin/users")
        return { success: true }
    } catch (error) {
        console.error("Error changing user role:", error)
        return { success: false, message: "Failed to change user role" }
    }
}

// --- SITE SETTINGS ---

const siteSettingsSchema = z.object({
    siteName: z.string().min(1),
    logo: z.string().optional().nullable(),
    favicon: z.string().optional().nullable(),
    primaryColor: z.string().regex(/^#([0-9A-F]{3}){1,2}$/i),
    secondaryColor: z.string().regex(/^#([0-9A-F]{3}){1,2}$/i),
    footerEmail: z.string().email().optional().nullable().or(z.literal("")),
    footerPhone: z.string().optional().nullable(),
    footerAddress: z.string().optional().nullable(),
    footerFacebook: z.string().optional().nullable(),
    footerInstagram: z.string().optional().nullable(),
    footerTwitter: z.string().optional().nullable(),
    footerLinkedin: z.string().optional().nullable(),
    stripeProdSecretKey: z.string().optional().nullable(),
    stripeProdPublishableKey: z.string().optional().nullable(),
    stripeTestSecretKey: z.string().optional().nullable(),
    stripeTestPublishableKey: z.string().optional().nullable(),
    isStripeSandbox: z.boolean().default(true),
})

export async function getSiteSettings() {
    try {
        const settings = await prisma.siteSettings.findFirst()
        return settings
    } catch (error) {
        console.error("Error fetching site settings:", error)
        return null
    }
}

export async function updateSiteSettings(data: z.infer<typeof siteSettingsSchema>) {
    try {
        const session = await getServerSession(authOptions)
        if (session?.user.role !== "ADMIN") {
            return { success: false, message: "Unauthorized" }
        }

        const validation = siteSettingsSchema.safeParse(data)
        if (!validation.success) {
            return { success: false, message: validation.error.issues[0].message }
        }

        const existing = await prisma.siteSettings.findFirst()

        if (existing) {
            await prisma.siteSettings.update({
                where: { id: existing.id },
                data
            })
        } else {
            await prisma.siteSettings.create({
                data
            })
        }

        revalidatePath("/")
        return { success: true }
    } catch (error) {
        console.error("Error updating site settings:", error)
        return { success: false, message: "Failed to update site settings" }
    }
}
