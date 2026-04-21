import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        const { searchParams } = new URL(req.url)
        const restaurantId = searchParams.get("restaurantId")

        if (!restaurantId) {
            return new NextResponse("Restaurant ID required", { status: 400 })
        }

        // Fetch restaurant details
        const restaurant = await prisma.restaurant.findUnique({
            where: { id: restaurantId },
            select: {
                deliveryFee: true,
                estimatedDeliveryTime: true,
                acceptsDelivery: true,
                acceptsPickup: true
            }
        })

        // Fetch payment methods
        const paymentMethods = await prisma.restaurantPaymentMethod.findMany({
            where: {
                restaurantId: restaurantId,
                isActive: true,
                paymentMethod: { isActive: true }
            },
            include: {
                paymentMethod: true
            }
        })

        const formattedMethods = paymentMethods.map(pm => ({
            id: pm.paymentMethod.id,
            name: pm.paymentMethod.name
        }))

        // Fetch user addresses if logged in
        let addresses: any[] = []
        if (session?.user?.id) {
            const userAddresses = await prisma.address.findMany({
                where: { userId: session.user.id },
                orderBy: [
                    { isDefault: "desc" },
                    { createdAt: "desc" }
                ]
            })

            addresses = userAddresses.map(addr => ({
                ...addr,
                latitude: addr.latitude ? Number(addr.latitude) : null,
                longitude: addr.longitude ? Number(addr.longitude) : null
            }))
        }

        return NextResponse.json({
            restaurant: restaurant ? {
                ...restaurant,
                deliveryFee: Number(restaurant.deliveryFee)
            } : null,
            paymentMethods: formattedMethods,
            addresses
        })

    } catch (error) {
        console.error("Error fetching checkout data:", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
