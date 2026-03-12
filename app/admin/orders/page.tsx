import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import OrdersClient from "@/components/features/admin/OrdersClient"

export default async function OrdersPage({
    searchParams
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== "ADMIN") {
        redirect("/")
    }

    const resolvedSearchParams = await searchParams
    const page = typeof resolvedSearchParams.page === "string" ? parseInt(resolvedSearchParams.page) : 1
    const status = typeof resolvedSearchParams.status === "string" ? resolvedSearchParams.status : undefined
    const restaurantId = typeof resolvedSearchParams.restaurant === "string" ? resolvedSearchParams.restaurant : undefined
    const dateFilter = typeof resolvedSearchParams.date === "string" ? resolvedSearchParams.date : undefined

    const perPage = 20
    const skip = (page - 1) * perPage

    const where: any = {}

    if (status && status !== "all") {
        where.status = status
    }

    if (restaurantId && restaurantId !== "all") {
        where.restaurantId = restaurantId
    }

    if (dateFilter) {
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        if (dateFilter === "today") {
            where.createdAt = { gte: today }
        } else if (dateFilter === "yesterday") {
            const yesterday = new Date(today)
            yesterday.setDate(yesterday.getDate() - 1)
            const todayEnd = new Date(today)
            where.createdAt = { gte: yesterday, lt: todayEnd }
        } else if (dateFilter === "week") {
            const weekAgo = new Date(today)
            weekAgo.setDate(weekAgo.getDate() - 7)
            where.createdAt = { gte: weekAgo }
        } else if (dateFilter === "month") {
            const monthAgo = new Date(today)
            monthAgo.setMonth(monthAgo.getMonth() - 1)
            where.createdAt = { gte: monthAgo }
        }
    }

    const orders = await prisma.order.findMany({
        where,
        take: perPage,
        skip,
        orderBy: { createdAt: "desc" },
        include: {
            user: {
                select: { name: true, email: true }
            },
            restaurant: {
                select: { name: true }
            },
            items: {
                include: {
                    product: {
                        select: { name: true }
                    }
                }
            }
        }
    })

    const totalOrders = await prisma.order.count({ where })
    const totalPages = Math.ceil(totalOrders / perPage)

    // Metrics for the top of the page
    const metricsWhere = { ...where }
    delete metricsWhere.createdAt

    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    const monthStart = new Date()
    monthStart.setDate(1)
    monthStart.setHours(0, 0, 0, 0)

    const [
        globalTotalOrders,
        ordersToday,
        revenueData,
        monthRevenueData,
        restaurantsList
    ] = await Promise.all([
        prisma.order.count(),
        prisma.order.count({ where: { createdAt: { gte: todayStart } } }),
        prisma.order.aggregate({ where: { status: "COMPLETED" }, _sum: { finalAmount: true } }),
        prisma.order.aggregate({ where: { status: "COMPLETED", createdAt: { gte: monthStart } }, _sum: { finalAmount: true } }),
        prisma.restaurant.findMany({ where: { isActive: true }, select: { id: true, name: true }, orderBy: { name: "asc" } })
    ])

    const totalRevenue = revenueData._sum.finalAmount ? Number(revenueData._sum.finalAmount) : 0
    const monthRevenue = monthRevenueData._sum.finalAmount ? Number(monthRevenueData._sum.finalAmount) : 0

    // Serialize Decimal
    const serializedOrders = orders.map(o => ({
        ...o,
        totalAmount: Number(o.totalAmount),
        deliveryFee: Number(o.deliveryFee),
        discount: Number(o.discount),
        finalAmount: Number(o.finalAmount),
        deliveryMethod: o.deliveryType === "DELIVERY" ? "Entrega" : "Retirada",
        paymentMethod: o.paymentMethodId || "Não informado",
        items: o.items.map(i => ({
            ...i,
            unitPrice: Number(i.unitPrice),
            totalPrice: Number(i.totalPrice)
        }))
    }))

    return (
        <OrdersClient
            orders={serializedOrders}
            totalPages={totalPages}
            currentPage={page}
            totalOrders={totalOrders}
            metrics={{
                totalOrders: globalTotalOrders,
                ordersToday,
                totalRevenue,
                monthRevenue
            }}
            restaurants={restaurantsList}
        />
    )
}
