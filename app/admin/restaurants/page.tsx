import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import RestaurantsClient from "@/components/features/admin/RestaurantsClient"

export default async function RestaurantsPage({
    searchParams
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== "ADMIN") {
        redirect("/")
    }

    const resolvedSearchParams = await searchParams
    const status = typeof resolvedSearchParams.status === "string" ? resolvedSearchParams.status : undefined
    const search = typeof resolvedSearchParams.search === "string" ? resolvedSearchParams.search : undefined
    const page = typeof resolvedSearchParams.page === "string" ? resolvedSearchParams.page : undefined

    const where: any = {}

    if (status) {
        if (status === "pending") {
            where.isApproved = false
            where.rejectedAt = null
        } else if (status === "approved") {
            where.isApproved = true
        } else if (status === "rejected") {
            where.rejectedAt = { not: null }
        }
    }

    if (search) {
        where.OR = [
            { name: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } }
        ]
    }

    const restaurants = await prisma.restaurant.findMany({
        where,
        include: {
            owner: {
                select: { name: true, email: true }
            },
            category: {
                select: { name: true }
            },
            subscriptionPlan: {
                select: { name: true }
            }
        },
        orderBy: { createdAt: "desc" }
    })

    const pendingCount = await prisma.restaurant.count({
        where: {
            isApproved: false,
            rejectedAt: null
        }
    })

    // Serialize Decimal and Date objects to plain JS objects/strings if needed for Client Components
    // But here we pass to Client Component, Next.js handles serialization of basic types.
    // However, Decimal types from Prisma need to be converted to number or string.
    const serializedRestaurants = restaurants.map(r => ({
        ...r,
        minOrderValue: Number(r.minOrderValue),
        deliveryFee: Number(r.deliveryFee),
        rating: r.rating ? Number(r.rating) : null,
        subscriptionPlan: r.subscriptionPlan ? { ...r.subscriptionPlan } : null
    }))

    return (
        <RestaurantsClient
            restaurants={serializedRestaurants}
            pendingCount={pendingCount}
        />
    )
}
