import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import RestaurantSettingsClient from "@/components/features/restaurant/RestaurantSettingsClient"

export default async function SettingsPage() {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== "RESTAURANT") {
        redirect("/auth/signin")
    }

    const restaurant = await prisma.restaurant.findUnique({
        where: { ownerId: session.user.id },
        include: {
            subscriptionPlan: true,
            paymentMethods: true,
        }
    })

    if (!restaurant) {
        redirect("/restaurant/new")
    }

    const categories = await prisma.category.findMany({
        where: { isActive: true }
    })

    const allPaymentMethods = await prisma.paymentMethod.findMany({
        where: { isActive: true }
    })

    // Serialização
    const serializedRestaurant = {
        ...restaurant,
        minOrderValue: Number(restaurant.minOrderValue),
        deliveryFee: Number(restaurant.deliveryFee),
        rating: restaurant.rating ? Number(restaurant.rating) : null,
        createdAt: restaurant.createdAt.toISOString(),
        updatedAt: restaurant.updatedAt.toISOString(),
        subscriptionExpiresAt: restaurant.subscriptionExpiresAt ? restaurant.subscriptionExpiresAt.toISOString() : null,
        approvedAt: restaurant.approvedAt ? restaurant.approvedAt.toISOString() : null,
        rejectedAt: restaurant.rejectedAt ? restaurant.rejectedAt.toISOString() : null,
        subscriptionPlan: restaurant.subscriptionPlan ? {
            ...restaurant.subscriptionPlan,
            price: Number(restaurant.subscriptionPlan.price),
            createdAt: restaurant.subscriptionPlan.createdAt.toISOString(),
            updatedAt: restaurant.subscriptionPlan.updatedAt.toISOString(),
        } : null,
        paymentMethods: restaurant.paymentMethods.map(pm => ({
            ...pm,
            // paymentMethod: pm.paymentMethod // Se precisar dos detalhes
        }))
    }

    return (
        <RestaurantSettingsClient
            restaurant={serializedRestaurant}
            categories={categories}
            allPaymentMethods={allPaymentMethods}
        />
    )
}
