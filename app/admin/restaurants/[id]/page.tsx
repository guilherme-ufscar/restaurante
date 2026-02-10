import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
    Store,
    Mail,
    Phone,
    MapPin,
    Calendar,
    CheckCircle,
    XCircle,
    AlertTriangle,
    DollarSign,
    ShoppingBag
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import AdminRestaurantActions from "@/components/features/admin/AdminRestaurantActions" // Componente Client para ações

interface AdminRestaurantDetailsPageProps {
    params: Promise<{ id: string }>
}

export default async function AdminRestaurantDetailsPage(props: AdminRestaurantDetailsPageProps) {
    const params = await props.params
    const restaurant = await prisma.restaurant.findUnique({
        where: { id: params.id },
        include: {
            owner: true,
            category: true,
            subscriptionPlan: true,
            products: true,
            orders: {
                where: { status: "COMPLETED" },
                select: { finalAmount: true }
            }
        }
    })

    if (!restaurant) {
        notFound()
    }

    // Estatísticas
    const totalRevenue = restaurant.orders.reduce((acc, order) => acc + Number(order.finalAmount), 0)
    const totalOrders = restaurant.orders.length // Isso pega apenas COMPLETED pela query acima, talvez queira count total
    const totalProducts = restaurant.products.length

    // Contagem real de pedidos (todos os status)
    const realTotalOrders = await prisma.order.count({ where: { restaurantId: restaurant.id } })

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border">
                        {restaurant.logo ? (
                            <img src={restaurant.logo} alt={restaurant.name} className="h-full w-full object-cover" />
                        ) : (
                            <Store className="h-8 w-8 text-gray-400" />
                        )}
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                            {restaurant.name}
                            {restaurant.isApproved ? (
                                <CheckCircle className="h-5 w-5 text-green-600" />
                            ) : restaurant.rejectedAt ? (
                                <XCircle className="h-5 w-5 text-red-600" />
                            ) : (
                                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                            )}
                        </h1>
                        <p className="text-muted-foreground flex items-center gap-2">
                            <Badge variant="outline">{restaurant.category.name}</Badge>
                            <span>•</span>
                            <span>Cadastrado em {format(restaurant.createdAt, "dd/MM/yyyy", { locale: ptBR })}</span>
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <AdminRestaurantActions
                        restaurantId={restaurant.id}
                        isApproved={restaurant.isApproved}
                        isRejected={!!restaurant.rejectedAt}
                        isActive={restaurant.isActive}
                    />
                </div>
            </div>

            {restaurant.rejectedAt && (
                <Alert variant="destructive">
                    <AlertTitle>Restaurante Rejeitado</AlertTitle>
                    <AlertDescription>
                        Motivo: {restaurant.rejectionReason}
                        <br />
                        Data: {format(restaurant.rejectedAt, "dd/MM/yyyy HH:mm", { locale: ptBR })}
                    </AlertDescription>
                </Alert>
            )}

            <div className="grid gap-6 md:grid-cols-3">
                {/* Coluna Esquerda - Informações */}
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Informações Básicas</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Email de Contato</p>
                                    <p className="flex items-center gap-2"><Mail className="h-4 w-4" /> {restaurant.email}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Telefone</p>
                                    <p className="flex items-center gap-2"><Phone className="h-4 w-4" /> {restaurant.phone}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Horário</p>
                                    <p>{restaurant.opensAt} - {restaurant.closesAt}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Entrega</p>
                                    <p>{restaurant.estimatedDeliveryTime} min • R$ {Number(restaurant.deliveryFee).toFixed(2)}</p>
                                </div>
                            </div>
                            <Separator />
                            <div>
                                <p className="text-sm font-medium text-muted-foreground mb-1">Descrição</p>
                                <p className="text-sm">{restaurant.description || "Sem descrição."}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Proprietário</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                                    <span className="text-lg font-bold">{restaurant.owner.name?.charAt(0)}</span>
                                </div>
                                <div>
                                    <p className="font-medium">{restaurant.owner.name}</p>
                                    <p className="text-sm text-muted-foreground">{restaurant.owner.email}</p>
                                    <p className="text-xs text-muted-foreground">ID: {restaurant.ownerId}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Coluna Direita - Estatísticas e Assinatura */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Estatísticas</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground flex items-center gap-2">
                                    <ShoppingBag className="h-4 w-4" /> Produtos
                                </span>
                                <span className="font-bold">{totalProducts}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground flex items-center gap-2">
                                    <ShoppingBag className="h-4 w-4" /> Pedidos Totais
                                </span>
                                <span className="font-bold">{realTotalOrders}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground flex items-center gap-2">
                                    <DollarSign className="h-4 w-4" /> Receita Total
                                </span>
                                <span className="font-bold text-green-600">
                                    {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(totalRevenue)}
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Assinatura</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {restaurant.subscriptionPlan ? (
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">Plano</span>
                                        <span className="font-medium">{restaurant.subscriptionPlan.name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">Status</span>
                                        <Badge variant={restaurant.subscriptionStatus === "ACTIVE" ? "default" : "destructive"}>
                                            {restaurant.subscriptionStatus}
                                        </Badge>
                                    </div>
                                    {restaurant.subscriptionExpiresAt && (
                                        <div className="flex justify-between">
                                            <span className="text-sm text-muted-foreground">Expira em</span>
                                            <span className="text-sm">{format(restaurant.subscriptionExpiresAt, "dd/MM/yyyy", { locale: ptBR })}</span>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">Sem plano ativo.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
