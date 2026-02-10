"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ShoppingCart, DollarSign, Calendar, ChevronLeft, ChevronRight, Eye } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface Order {
    id: string
    createdAt: Date
    status: string
    finalAmount: number
    deliveryMethod: string
    paymentMethod: string
    user: {
        name: string | null
        email: string | null
    }
    restaurant: {
        name: string
    }
}

interface OrdersClientProps {
    orders: Order[]
    totalPages: number
    currentPage: number
    totalOrders: number
    metrics: {
        totalOrders: number
        ordersToday: number
        totalRevenue: number
        monthRevenue: number
    }
    restaurants: { id: string, name: string }[]
}

export default function OrdersClient({
    orders,
    totalPages,
    currentPage,
    totalOrders,
    metrics,
    restaurants
}: OrdersClientProps) {
    const router = useRouter()
    const searchParams = useSearchParams()

    const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "all")
    const [restaurantFilter, setRestaurantFilter] = useState(searchParams.get("restaurant") || "all")
    const [dateFilter, setDateFilter] = useState(searchParams.get("date") || "all")

    const updateFilters = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString())
        if (value === "all") {
            params.delete(key)
        } else {
            params.set(key, value)
        }
        params.set("page", "1")
        router.push(`/admin/orders?${params.toString()}`)
    }

    const handlePageChange = (page: number) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set("page", page.toString())
        router.push(`/admin/orders?${params.toString()}`)
    }

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL"
        }).format(value)
    }

    const getStatusBadge = (status: string) => {
        const map: Record<string, string> = {
            PENDING: "Pendente",
            CONFIRMED: "Confirmado",
            PREPARING: "Preparando",
            READY: "Pronto",
            DELIVERING: "Em entrega",
            COMPLETED: "Concluído",
            CANCELLED: "Cancelado"
        }

        const colorMap: Record<string, string> = {
            PENDING: "bg-yellow-500",
            CONFIRMED: "bg-blue-500",
            PREPARING: "bg-blue-600",
            READY: "bg-green-500",
            DELIVERING: "bg-orange-500",
            COMPLETED: "bg-green-700",
            CANCELLED: "bg-red-500"
        }

        return <Badge className={`${colorMap[status] || "bg-gray-500"} hover:${colorMap[status] || "bg-gray-500"}`}>{map[status] || status}</Badge>
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Gerenciar Pedidos</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total de Pedidos</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics.totalOrders}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pedidos Hoje</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics.ordersToday}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
                        <DollarSign className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(metrics.totalRevenue)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Receita Mês</CardTitle>
                        <DollarSign className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(metrics.monthRevenue)}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="flex flex-col gap-4">
                <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                    <Tabs value={statusFilter} onValueChange={(val) => {
                        setStatusFilter(val)
                        updateFilters("status", val)
                    }} className="w-full md:w-auto">
                        <TabsList>
                            <TabsTrigger value="all">Todos</TabsTrigger>
                            <TabsTrigger value="PENDING">Pendentes</TabsTrigger>
                            <TabsTrigger value="COMPLETED">Concluídos</TabsTrigger>
                            <TabsTrigger value="CANCELLED">Cancelados</TabsTrigger>
                        </TabsList>
                    </Tabs>

                    <div className="flex gap-2 w-full md:w-auto">
                        <Select
                            value={restaurantFilter}
                            onValueChange={(val) => {
                                setRestaurantFilter(val)
                                updateFilters("restaurant", val)
                            }}
                        >
                            <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="Filtrar por Restaurante" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos Restaurantes</SelectItem>
                                {restaurants.map(r => (
                                    <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select
                            value={dateFilter}
                            onValueChange={(val) => {
                                setDateFilter(val)
                                updateFilters("date", val)
                            }}
                        >
                            <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder="Período" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todo Período</SelectItem>
                                <SelectItem value="today">Hoje</SelectItem>
                                <SelectItem value="yesterday">Ontem</SelectItem>
                                <SelectItem value="week">Última Semana</SelectItem>
                                <SelectItem value="month">Último Mês</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="rounded-md border bg-white">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Pedido</TableHead>
                                <TableHead>Data</TableHead>
                                <TableHead>Cliente</TableHead>
                                <TableHead>Restaurante</TableHead>
                                <TableHead>Valor</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                        Nenhum pedido encontrado.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                orders.map((order) => (
                                    <TableRow key={order.id}>
                                        <TableCell className="font-medium">#{order.id.slice(-6)}</TableCell>
                                        <TableCell>
                                            {format(new Date(order.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                                        </TableCell>
                                        <TableCell>{order.user.name || "Sem nome"}</TableCell>
                                        <TableCell>{order.restaurant.name}</TableCell>
                                        <TableCell>{formatCurrency(order.finalAmount)}</TableCell>
                                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm" asChild>
                                                <Link href={`/admin/orders/${order.id}`}>
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    Detalhes
                                                </Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {totalPages > 1 && (
                    <div className="flex items-center justify-center space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage <= 1}
                        >
                            <ChevronLeft className="h-4 w-4" />
                            Anterior
                        </Button>
                        <span className="text-sm text-muted-foreground">
                            Página {currentPage} de {totalPages}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage >= totalPages}
                        >
                            Próxima
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}
