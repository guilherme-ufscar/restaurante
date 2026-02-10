"use client"

import { useState, useTransition } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'react-hot-toast'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
    Clock,
    CheckCircle,
    ChefHat,
    Package,
    Truck,
    XCircle,
    MapPin,
    User,
    Phone,
    Bike,
    Store as StoreIcon,
} from 'lucide-react'
import PrintOrderButton from './PrintOrderButton'
import {
    confirmOrder,
    startPreparingOrder,
    markOrderAsReady,
    startDelivery,
    completeOrder,
    cancelOrder,
} from '@/actions/order'

interface OrderCardProps {
    order: any
    restaurantName: string
}

export default function OrderCard({ order, restaurantName }: OrderCardProps) {
    const [isPending, startTransition] = useTransition()
    const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)
    const [cancelReason, setCancelReason] = useState('')

    const handleConfirm = () => {
        startTransition(async () => {
            const result = await confirmOrder(order.id)
            if (result.success) {
                toast.success(result.message)
            } else {
                toast.error(result.message)
            }
        })
    }

    const handleStartPreparing = () => {
        startTransition(async () => {
            const result = await startPreparingOrder(order.id)
            if (result.success) {
                toast.success(result.message)
            } else {
                toast.error(result.message)
            }
        })
    }

    const handleMarkReady = () => {
        startTransition(async () => {
            const result = await markOrderAsReady(order.id)
            if (result.success) {
                toast.success(result.message)
            } else {
                toast.error(result.message)
            }
        })
    }

    const handleStartDelivery = () => {
        startTransition(async () => {
            const result = await startDelivery(order.id)
            if (result.success) {
                toast.success(result.message)
            } else {
                toast.error(result.message)
            }
        })
    }

    const handleComplete = () => {
        startTransition(async () => {
            const result = await completeOrder(order.id)
            if (result.success) {
                toast.success(result.message)
            } else {
                toast.error(result.message)
            }
        })
    }

    const handleCancelClick = () => {
        setIsCancelDialogOpen(true)
    }

    const handleCancelConfirm = () => {
        if (!cancelReason.trim() || cancelReason.trim().length < 10) {
            toast.error('O motivo deve ter pelo menos 10 caracteres')
            return
        }

        startTransition(async () => {
            const result = await cancelOrder(order.id, cancelReason)
            if (result.success) {
                toast.success(result.message)
                setIsCancelDialogOpen(false)
                setCancelReason('')
            } else {
                toast.error(result.message)
            }
        })
    }

    const getStatusConfig = (status: string) => {
        const configs: Record<string, any> = {
            PENDING: {
                label: 'Novo Pedido',
                variant: 'destructive',
                icon: Clock,
                color: 'bg-red-500',
            },
            CONFIRMED: {
                label: 'Confirmado',
                variant: 'default',
                icon: CheckCircle,
                color: 'bg-blue-500',
            },
            PREPARING: {
                label: 'Em Preparo',
                variant: 'default',
                icon: ChefHat,
                color: 'bg-orange-500',
            },
            READY: {
                label: 'Pronto',
                variant: 'default',
                icon: Package,
                color: 'bg-purple-500',
            },
            DELIVERING: {
                label: 'Saiu para Entrega',
                variant: 'default',
                icon: Truck,
                color: 'bg-indigo-500',
            },
            COMPLETED: {
                label: 'Concluído',
                variant: 'outline',
                icon: CheckCircle,
                color: 'bg-green-500',
            },
            CANCELLED: {
                label: 'Cancelado',
                variant: 'outline',
                icon: XCircle,
                color: 'bg-gray-500',
            },
        }
        return configs[status] || configs.PENDING
    }

    const statusConfig = getStatusConfig(order.status)
    const StatusIcon = statusConfig.icon

    return (
        <>
            <Card className={`hover:shadow-lg transition-shadow border-l-4 ${order.status === 'PENDING' ? 'border-l-red-500' : ''}`}>
                <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                            <CardTitle className="text-2xl font-bold mb-1">
                                #{order.orderNumber}
                            </CardTitle>
                            <p className="text-sm text-gray-500">
                                {format(new Date(order.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                            </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            <Badge variant={statusConfig.variant} className="gap-1 text-sm px-3 py-1">
                                <StatusIcon className="w-4 h-4" />
                                {statusConfig.label}
                            </Badge>
                            <Badge variant={order.deliveryType === 'DELIVERY' ? 'default' : 'secondary'}>
                                {order.deliveryType === 'DELIVERY' ? (
                                    <><Bike className="w-3 h-3 mr-1" /> Entrega</>
                                ) : (
                                    <><StoreIcon className="w-3 h-3 mr-1" /> Retirada</>
                                )}
                            </Badge>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="space-y-4">
                    {/* Informações do Cliente */}
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                            <User className="w-4 h-4 text-gray-500" />
                            <span className="font-semibold">{order.user?.name || 'Cliente'}</span>
                        </div>
                        {order.deliveryType === 'DELIVERY' && order.deliveryAddress && (
                            <div className="flex items-start gap-2 text-sm">
                                <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                                <span className="text-gray-700">{order.deliveryAddress}</span>
                            </div>
                        )}
                    </div>

                    {/* Itens do Pedido */}
                    <div>
                        <h4 className="font-semibold mb-3 text-sm text-gray-700">Itens do Pedido:</h4>
                        <div className="space-y-2">
                            {order.items.map((item: any) => (
                                <div key={item.id} className="flex justify-between items-start text-sm border-b pb-2 last:border-0">
                                    <div className="flex-1">
                                        <p className="font-medium">
                                            <span className="inline-block w-8 text-center bg-gray-200 rounded mr-2 text-xs font-bold">
                                                {item.quantity}x
                                            </span>
                                            {item.product?.name}
                                        </p>
                                        {item.notes && (
                                            <p className="text-xs text-gray-500 mt-1 ml-10 italic">
                                                Obs: {item.notes}
                                            </p>
                                        )}
                                    </div>
                                    <p className="font-semibold text-primary ml-4">
                                        {new Intl.NumberFormat('pt-BR', {
                                            style: 'currency',
                                            currency: 'BRL'
                                        }).format(item.totalPrice)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Total */}
                    <div className="pt-3 border-t">
                        <div className="flex justify-between items-center">
                            <span className="text-lg font-bold">Total:</span>
                            <span className="text-2xl font-bold text-primary">
                                {new Intl.NumberFormat('pt-BR', {
                                    style: 'currency',
                                    currency: 'BRL'
                                }).format(order.finalAmount)}
                            </span>
                        </div>
                    </div>

                    {/* Observações Gerais */}
                    {order.notes && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                            <p className="text-sm font-semibold text-yellow-900 mb-1">📝 Observações:</p>
                            <p className="text-sm text-yellow-800">{order.notes}</p>
                        </div>
                    )}

                    {/* Botões de Ação */}
                    <div className="flex flex-wrap gap-2 pt-4">
                        {order.status === 'PENDING' && (
                            <>
                                <Button
                                    onClick={handleConfirm}
                                    disabled={isPending}
                                    className="flex-1 bg-green-600 hover:bg-green-700"
                                >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Confirmar Pedido
                                </Button>
                                <Button
                                    onClick={handleCancelClick}
                                    disabled={isPending}
                                    variant="destructive"
                                    className="flex-1"
                                >
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Cancelar
                                </Button>
                            </>
                        )}

                        {order.status === 'CONFIRMED' && (
                            <Button
                                onClick={handleStartPreparing}
                                disabled={isPending}
                                className="flex-1 bg-orange-600 hover:bg-orange-700"
                            >
                                <ChefHat className="w-4 h-4 mr-2" />
                                Iniciar Preparo
                            </Button>
                        )}

                        {order.status === 'PREPARING' && (
                            <Button
                                onClick={handleMarkReady}
                                disabled={isPending}
                                className="flex-1 bg-purple-600 hover:bg-purple-700"
                            >
                                <Package className="w-4 h-4 mr-2" />
                                Marcar como Pronto
                            </Button>
                        )}

                        {order.status === 'READY' && order.deliveryType === 'DELIVERY' && (
                            <Button
                                onClick={handleStartDelivery}
                                disabled={isPending}
                                className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                            >
                                <Truck className="w-4 h-4 mr-2" />
                                Saiu para Entrega
                            </Button>
                        )}

                        {order.status === 'READY' && order.deliveryType === 'PICKUP' && (
                            <Button
                                onClick={handleComplete}
                                disabled={isPending}
                                className="flex-1 bg-green-600 hover:bg-green-700"
                            >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Cliente Retirou
                            </Button>
                        )}

                        {order.status === 'DELIVERING' && (
                            <Button
                                onClick={handleComplete}
                                disabled={isPending}
                                className="flex-1 bg-green-600 hover:bg-green-700"
                            >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Pedido Entregue
                            </Button>
                        )}

                        <PrintOrderButton
                            order={order}
                            restaurantName={restaurantName}
                            siteLogo="/logo.png"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Dialog de Cancelamento */}
            <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Cancelar Pedido</DialogTitle>
                        <DialogDescription>
                            Informe o motivo do cancelamento. O cliente será notificado.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="cancelReason">Motivo do Cancelamento *</Label>
                            <Textarea
                                id="cancelReason"
                                placeholder="Descreva o motivo do cancelamento..."
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                rows={4}
                                className="resize-none"
                            />
                            <p className="text-sm text-gray-500">Mínimo de 10 caracteres</p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsCancelDialogOpen(false)
                                setCancelReason('')
                            }}
                            disabled={isPending}
                        >
                            Voltar
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleCancelConfirm}
                            disabled={isPending || cancelReason.trim().length < 10}
                        >
                            {isPending ? 'Cancelando...' : 'Confirmar Cancelamento'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
