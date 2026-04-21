import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "RESTAURANT") {
        return new NextResponse("Unauthorized", { status: 401 })
    }

    const restaurant = await prisma.restaurant.findUnique({
        where: { ownerId: session.user.id }
    })

    if (!restaurant) {
        return new NextResponse("Restaurant not found", { status: 404 })
    }

    // Check for pending orders created in the last 30 seconds (matching polling interval)
    // Ideally we would track "last checked" timestamp, but for simplicity we check recent pending orders
    const thirtySecondsAgo = new Date(Date.now() - 30 * 1000)

    const newOrders = await prisma.order.count({
        where: {
            restaurantId: restaurant.id,
            status: "PENDING",
            createdAt: {
                gte: thirtySecondsAgo
            }
        }
    })

    return NextResponse.json({ hasNewOrders: newOrders > 0, count: newOrders })
}
