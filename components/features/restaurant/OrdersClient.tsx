"use client"

import { useState, useEffect, useRef, useTransition } from "react"
import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
    RefreshCw, Search, Filter, Bike, Store, CreditCard,
    CheckCircle, XCircle, Clock, ChefHat, Package, AlertTriangle,
    MoreHorizontal, DollarSign, Calendar
} from "lucide-react"
import { useRealtimeOrders } from "@/hooks/useRealtimeOrders"
import PrintOrderButton from "./PrintOrderButton"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle
} from "@/components/ui/card"
import {
    Tabs, TabsContent, TabsList, TabsTrigger
} from "@/components/ui/tabs"
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select"
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from "@/components/ui/alert-dialog"
import { toast } from "react-hot-toast"
import {
    confirmOrder, cancelOrder, startPreparingOrder,
    markOrderAsReady, startDelivery, completeOrder
} from "@/actions/order"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Tipos
interface OrderItem {
    id: string
    quantity: number
    product: {
        name: string
        image: string | null
    }
}

interface Order {
    id: string
    orderNumber: string
    status: string
    createdAt: string | Date
    finalAmount: number
    deliveryType: string
    paymentStatus: string
    paymentMethodId: string
    user: {
        name: string | null
        image: string | null
    }
    address: {
        street: string
        number: string
        neighborhood: string
        city: string
    } | null
    items: OrderItem[]
}

interface OrdersClientProps {
    initialOrders: Order[]
    counts: {
        PENDING: number
        CONFIRMED: number
        PREPARING: number
        READY: number
        DELIVERING: number
        COMPLETED: number
    }
    restaurantId: string
    restaurant: {
        name: string
        phone: string
        address: string
        logo: string | null
    }
}

export default function OrdersClient({ initialOrders, counts, restaurantId, restaurant }: OrdersClientProps) {
    const router = useRouter()
    const [activeTab, setActiveTab] = useState("all")
    const [searchTerm, setSearchTerm] = useState("")
    const [lastUpdated, setLastUpdated] = useState(new Date())
    const [isPending, startTransition] = useTransition()

    // Realtime Orders Hook
    const { newOrders, clearNewOrders } = useRealtimeOrders(restaurantId)

    // Efeito para atualizar timestamp quando houver novos pedidos
    useEffect(() => {
        if (newOrders.length > 0) {
            setLastUpdated(new Date())
            // O hook já faz o refresh e toca o som

            // Resetar contador visual após um tempo se desejar, 
            // ou manter até o usuário interagir. 
            // Aqui vamos resetar após 10s para não ficar piscando para sempre
            const timer = setTimeout(() => clearNewOrders(), 10000)
            return () => clearTimeout(timer)
        }
    }, [newOrders, clearNewOrders])

    const handleRefresh = () => {
        startTransition(() => {
            router.refresh()
            setLastUpdated(new Date())
            toast.success("Dados atualizados")
        })
    }

    const handleDateFilter = (value: string) => {
        const params = new URLSearchParams(window.location.search)
        if (value === "all") params.delete("date")
        else params.set("date", value)
        router.push(`?${params.toString()}`)
    }

    // Filtragem local
    const filteredOrders = initialOrders.filter(order => {
        const matchesTab = activeTab === "all" ||
            (activeTab === "new" && order.status === "PENDING") ||
            (activeTab === "confirmed" && order.status === "CONFIRMED") ||
            (activeTab === "preparing" && order.status === "PREPARING") ||
            (activeTab === "ready" && order.status === "READY") ||
            (activeTab === "delivering" && order.status === "DELIVERING") ||
            (activeTab === "completed" && order.status === "COMPLETED")

        const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (order.user.name && order.user.name.toLowerCase().includes(searchTerm.toLowerCase()))

        return matchesTab && matchesSearch
    })

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Gerenciar Pedidos</h1>
                    <p className="text-muted-foreground flex items-center gap-2">
                        <RefreshCw className={`h-3 w-3 ${isPending ? "animate-spin" : ""}`} />
                        Atualizado {formatDistanceToNow(lastUpdated, { locale: ptBR, addSuffix: true })}
                        {newOrders.length > 0 && (
                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 animate-pulse">
                                {newOrders.length} novos pedidos!
                            </span>
                        )}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Select onValueChange={handleDateFilter} defaultValue="today">
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Período" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="today">Hoje</SelectItem>
                            <SelectItem value="yesterday">Ontem</SelectItem>
                            <SelectItem value="week">Últimos 7 dias</SelectItem>
                            <SelectItem value="all">Todo o período</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isPending}>
                        <RefreshCw className={`h-4 w-4 ${isPending ? "animate-spin" : ""}`} />
                    </Button>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por número ou cliente..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8"
                    />
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="flex flex-wrap h-auto">
                    <TabsTrigger value="all">Todos</TabsTrigger>
                    <TabsTrigger value="new" className="relative">
                        Novos
                        {counts.PENDING > 0 && (
                            <Badge variant="destructive" className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px]">
                                {counts.PENDING}
                            </Badge>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="confirmed">Confirmados ({counts.CONFIRMED})</TabsTrigger>
                    <TabsTrigger value="preparing">Em Preparo ({counts.PREPARING})</TabsTrigger>
                    <TabsTrigger value="ready">Prontos ({counts.READY})</TabsTrigger>
                    <TabsTrigger value="delivering">Em Entrega ({counts.DELIVERING})</TabsTrigger>
                    <TabsTrigger value="completed">Concluídos</TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="space-y-4">
                    {filteredOrders.length === 0 ? (
                        <div className="text-center py-10 text-muted-foreground">
                            Nenhum pedido encontrado nesta categoria.
                        </div>
                    ) : (
                        filteredOrders.map(order => (
                            <OrderCard key={order.id} order={order} restaurant={restaurant} />
                        ))
                    )}
                </TabsContent>
            </Tabs>
        </div>
    )
}

function OrderCard({ order, restaurant }: {
    order: Order
    restaurant: {
        name: string
        phone: string
        address: string
        logo: string | null
    }
}) {
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
    const [cancelReason, setCancelReason] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
        PENDING: "destructive", // Amarelo seria melhor, mas shadcn padrão não tem warning
        CONFIRMED: "secondary", // Azul
        PREPARING: "secondary",
        READY: "default", // Verde ou similar
        DELIVERING: "default",
        COMPLETED: "outline", // Verde
        CANCELLED: "destructive"
    }

    const statusLabels: Record<string, string> = {
        PENDING: "Pendente",
        CONFIRMED: "Confirmado",
        PREPARING: "Em Preparo",
        READY: "Pronto",
        DELIVERING: "Saiu para Entrega",
        COMPLETED: "Concluído",
        CANCELLED: "Cancelado"
    }

    const handleAction = async (action: () => Promise<any>) => {
        setIsLoading(true)
        try {
            const result = await action()
            if (result.success) {
                toast.success("Status atualizado!")
            } else {
                toast.error(result.message || "Erro ao atualizar status")
            }
        } catch (error) {
            toast.error("Erro inesperado")
        } finally {
            setIsLoading(false)
        }
    }

    const handleCancel = async () => {
        if (cancelReason.length < 10) {
            toast.error("Motivo muito curto")
            return
        }
        setIsLoading(true)
        try {
            const result = await cancelOrder(order.id, cancelReason)
            if (result.success) {
                toast.success("Pedido cancelado")
                setCancelDialogOpen(false)
            } else {
                toast.error(result.message || "Erro ao cancelar")
            }
        } catch (error) {
            toast.error("Erro inesperado")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card className={isLoading ? "opacity-60 pointer-events-none" : ""}>
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg font-bold">#{order.orderNumber}</span>
                            <Badge variant={statusColors[order.status] as any}>
                                {statusLabels[order.status]}
                            </Badge>
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground gap-2">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(new Date(order.createdAt), { locale: ptBR, addSuffix: true })}
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="font-bold text-lg">
                            {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(order.finalAmount)}
                        </div>
                        <div className="flex items-center justify-end gap-1 text-sm text-muted-foreground mb-2">
                            {order.paymentStatus === "PAID" ? (
                                <span className="text-green-600 flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Pago</span>
                            ) : (
                                <span className="text-yellow-600 flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Pendente</span>
                            )}
                        </div>
                        <PrintOrderButton
                            order={order}
                            restaurantName={restaurant.name}
                            restaurantPhone={restaurant.phone}
                            restaurantAddress={restaurant.address}
                            siteLogo={restaurant.logo || undefined}
                        />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pb-2">
                <div className="grid md:grid-cols-2 gap-4">
                    {/* Cliente e Entrega */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={order.user.image || ""} />
                                <AvatarFallback>{order.user.name?.[0] || "C"}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="text-sm font-medium">{order.user.name}</p>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    {order.deliveryType === "DELIVERY" ? <Bike className="h-3 w-3" /> : <Store className="h-3 w-3" />}
                                    {order.deliveryType === "DELIVERY" ? "Entrega" : "Retirada"}
                                </div>
                            </div>
                        </div>
                        {order.deliveryType === "DELIVERY" && order.address && (
                            <p className="text-xs text-muted-foreground ml-10">
                                {order.address.neighborhood}, {order.address.city}
                            </p>
                        )}
                    </div>

                    {/* Itens */}
                    <div className="space-y-1">
                        {order.items.map(item => (
                            <div key={item.id} className="flex justify-between text-sm">
                                <span>{item.quantity}x {item.product.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2 pt-2">
                {order.status === "PENDING" && (
                    <>
                        <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                                    Cancelar
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Cancelar Pedido #{order.orderNumber}</DialogTitle>
                                    <DialogDescription>
                                        Esta ação é irreversível. O cliente será notificado.
                                    </DialogDescription>
                                </DialogHeader>
                                <Textarea
                                    placeholder="Motivo do cancelamento (obrigatório)"
                                    value={cancelReason}
                                    onChange={e => setCancelReason(e.target.value)}
                                />
                                <DialogFooter>
                                    <Button variant="ghost" onClick={() => setCancelDialogOpen(false)}>Voltar</Button>
                                    <Button variant="destructive" onClick={handleCancel} disabled={isLoading}>
                                        {isLoading ? "Cancelando..." : "Confirmar Cancelamento"}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                        <Button className="bg-green-600 hover:bg-green-700" onClick={() => handleAction(() => confirmOrder(order.id))}>
                            Confirmar Pedido
                        </Button>
                    </>
                )}

                {order.status === "CONFIRMED" && (
                    <Button onClick={() => handleAction(() => startPreparingOrder(order.id))}>
                        <ChefHat className="mr-2 h-4 w-4" /> Iniciar Preparo
                    </Button>
                )}

                {order.status === "PREPARING" && (
                    <Button onClick={() => handleAction(() => markOrderAsReady(order.id))}>
                        <CheckCircle className="mr-2 h-4 w-4" /> Marcar como Pronto
                    </Button>
                )}

                {order.status === "READY" && order.deliveryType === "DELIVERY" && (
                    <Button onClick={() => handleAction(() => startDelivery(order.id))}>
                        <Bike className="mr-2 h-4 w-4" /> Saiu para Entrega
                    </Button>
                )}

                {order.status === "READY" && order.deliveryType === "PICKUP" && (
                    <Button onClick={() => handleAction(() => completeOrder(order.id))}>
                        <Store className="mr-2 h-4 w-4" /> Cliente Retirou
                    </Button>
                )}

                {order.status === "DELIVERING" && (
                    <Button onClick={() => handleAction(() => completeOrder(order.id))}>
                        <CheckCircle className="mr-2 h-4 w-4" /> Pedido Entregue
                    </Button>
                )}
            </CardFooter>
        </Card>
    )
}
