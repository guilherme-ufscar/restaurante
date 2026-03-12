import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import OrdersContent from '@/components/features/restaurant/OrdersContent'

export default async function RestaurantOrdersPage() {
    const session = await auth()

    if (!session?.user || session.user.role !== 'RESTAURANT') {
        redirect('/auth/signin')
    }

    const restaurant = await prisma.restaurant.findUnique({
        where: { ownerId: session.user.id },
    })

    if (!restaurant) {
        redirect('/restaurant/dashboard')
    }

    const orders = await prisma.order.findMany({
        where: {
            restaurantId: restaurant.id,
        },
        include: {
            user: {
                select: {
                    name: true,
                    email: true,
                    image: true,
                },
            },
            address: true,
            items: {
                include: {
                    product: {
                        select: {
                            id: true,
                            name: true,
                            image: true,
                            price: true,
                        },
                    },
                },
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
    })

    const serializedOrders = orders.map(order => ({
        ...order,
        totalAmount: Number(order.totalAmount),
        deliveryFee: Number(order.deliveryFee),
        discount: order.discount ? Number(order.discount) : null,
        finalAmount: Number(order.finalAmount),
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString(),
        estimatedDeliveryTime: order.estimatedDeliveryTime?.toISOString() || null,
        cancelledAt: order.cancelledAt?.toISOString() || null,
        items: order.items.map(item => ({
            ...item,
            unitPrice: Number(item.unitPrice),
            totalPrice: Number(item.totalPrice),
            product: item.product ? {
                ...item.product,
                price: Number(item.product.price),
            } : null,
        })),
    }))

    return (
        <OrdersContent
            orders={serializedOrders}
            restaurantId={restaurant.id}
            restaurantName={restaurant.name}
        />
    )
}
