import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
    try {
        const session = await auth()

        if (!session?.user || session.user.role !== 'RESTAURANT') {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const restaurantId = searchParams.get('restaurantId')
        const since = searchParams.get('since')

        if (!restaurantId || !since) {
            return NextResponse.json({ error: 'Parâmetros inválidos' }, { status: 400 })
        }

        // Verificar que o restaurante pertence ao usuário
        const restaurant = await prisma.restaurant.findUnique({
            where: { id: restaurantId },
            select: { ownerId: true },
        })

        if (!restaurant || restaurant.ownerId !== session.user.id) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
        }

        const sinceDate = new Date(since)

        // Buscar pedidos PENDING criados após a última verificação
        const newOrders = await prisma.order.findMany({
            where: {
                restaurantId,
                status: 'PENDING',
                createdAt: {
                    gt: sinceDate,
                },
            },
            select: {
                id: true,
                orderNumber: true,
                createdAt: true,
                user: {
                    select: {
                        name: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        })

        console.log(`[API] Verificando pedidos desde ${sinceDate.toISOString()}: ${newOrders.length} novos`)

        return NextResponse.json({
            hasNewOrders: newOrders.length > 0,
            count: newOrders.length,
            newOrders: newOrders.map(order => ({
                id: order.id,
                orderNumber: order.orderNumber,
                createdAt: order.createdAt.toISOString(),
                customerName: order.user?.name,
            })),
        }, {
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0',
            },
        })

    } catch (error) {
        console.error('[API] Erro ao verificar novos pedidos:', error)
        return NextResponse.json({
            error: 'Erro interno do servidor',
            hasNewOrders: false,
            count: 0,
            newOrders: [],
        }, { status: 500 })
    }
}
