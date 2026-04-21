"use client"

import { useState, useEffect } from 'react'
import { useRealtimeOrders } from '@/hooks/useRealtimeOrders'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import OrderCard from './OrderCard'
import { ShoppingCart, Bell } from 'lucide-react'

interface OrdersContentProps {
    orders: any[]
    restaurantId: string
    restaurantName: string
}

export default function OrdersContent({
    orders,
    restaurantId,
    restaurantName
}: OrdersContentProps) {
    const [activeTab, setActiveTab] = useState('all')
    const { newOrders, clearNewOrders } = useRealtimeOrders(restaurantId)

    useEffect(() => {
        if (newOrders.length > 0) {
            // Mostrar alerta por 5 segundos
            const timer = setTimeout(clearNewOrders, 5000)
            return () => clearTimeout(timer)
        }
    }, [newOrders, clearNewOrders])

    const pendingCount = orders.filter(o => o.status === 'PENDING').length
    const confirmedCount = orders.filter(o => o.status === 'CONFIRMED').length
    const preparingCount = orders.filter(o => o.status === 'PREPARING').length
    const readyCount = orders.filter(o => o.status === 'READY').length
    const deliveringCount = orders.filter(o => o.status === 'DELIVERING').length
    const completedCount = orders.filter(o => o.status === 'COMPLETED').length

    const filteredOrders = orders.filter(order => {
        if (activeTab === 'all') return true
        if (activeTab === 'pending') return order.status === 'PENDING'
        if (activeTab === 'active') return ['CONFIRMED', 'PREPARING', 'READY', 'DELIVERING'].includes(order.status)
        if (activeTab === 'completed') return order.status === 'COMPLETED'
        return true
    })

    return (
        <div className="space-y-6">
            {/* Alerta de Novos Pedidos */}
            {newOrders.length > 0 && (
                <Alert className="border-green-500 bg-green-50 animate-pulse">
                    <Bell className="h-5 w-5 text-green-600" />
                    <AlertDescription className="text-green-800 font-semibold text-lg">
                        🎉 {newOrders.length} Novo{newOrders.length > 1 ? 's' : ''} Pedido{newOrders.length > 1 ? 's' : ''}! A página será recarregada automaticamente...
                    </AlertDescription>
                </Alert>
            )}

            <div>
                <h1 className="text-3xl font-bold mb-2">Gerenciar Pedidos</h1>
                <p className="text-gray-600">
                    Total de {orders.length} pedido{orders.length !== 1 ? 's' : ''}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                    ⚡ Atualização automática ativa - Verificando novos pedidos a cada 5 segundos
                </p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-4 w-full max-w-2xl">
                    <TabsTrigger value="all" className="gap-2">
                        Todos
                        <Badge variant="secondary">{orders.length}</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="pending" className="gap-2 relative">
                        Novos
                        {pendingCount > 0 && (
                            <Badge variant="destructive" className="animate-pulse">
                                {pendingCount}
                            </Badge>
                        )}
                        {pendingCount > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                            </span>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="active" className="gap-2">
                        Em Andamento
                        {(confirmedCount + preparingCount + readyCount + deliveringCount) > 0 && (
                            <Badge>
                                {confirmedCount + preparingCount + readyCount + deliveringCount}
                            </Badge>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="completed" className="gap-2">
                        Concluídos
                        <Badge variant="outline">{completedCount}</Badge>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="mt-6">
                    {filteredOrders.length === 0 ? (
                        <Card>
                            <CardContent className="py-16 text-center">
                                <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    Nenhum pedido nesta categoria
                                </h3>
                                <p className="text-gray-500">
                                    Os pedidos aparecerão aqui quando forem realizados
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-6">
                            {filteredOrders.map(order => (
                                <OrderCard
                                    key={order.id}
                                    order={order}
                                    restaurantName={restaurantName}
                                />
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    )
}
