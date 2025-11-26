import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const restaurantId = searchParams.get("restaurantId")

        if (!restaurantId) {
            return NextResponse.json({ error: "Restaurant ID required" }, { status: 400 })
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: {
                addresses: true,
            },
        })

        const restaurant = await prisma.restaurant.findUnique({
            where: { id: restaurantId },
            include: {
                paymentMethods: {
                    include: {
                        paymentMethod: true,
                    },
                },
            },
        })

        if (!user || !restaurant) {
            return NextResponse.json({ error: "Data not found" }, { status: 404 })
        }

        return NextResponse.json({
            addresses: user.addresses,
            paymentMethods: restaurant.paymentMethods,
        })
    } catch (error) {
        console.error("Checkout Data API Error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
