import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { format, differenceInDays, startOfDay, startOfMonth, subDays } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
    ShoppingCart,
    DollarSign,
    Package,
    Star,
    TrendingUp,
    TrendingDown,
    Clock,
    AlertTriangle
} from "lucide-react"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import DashboardCharts from "./DashboardCharts" // Client Component para gráficos

export default async function DashboardPage() {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
        redirect("/auth/signin")
    }

    const restaurant = await prisma.restaurant.findUnique({
        where: { ownerId: session.user.id },
        include: { subscriptionPlan: true },
    })

    if (!restaurant) {
        redirect("/restaurant/new")
    }

    // Datas para filtros
    const today = startOfDay(new Date())
    const firstDayOfMonth = startOfMonth(new Date())
    const sevenDaysAgo = subDays(new Date(), 7)

    // Métricas
    const ordersToday = await prisma.order.count({
        where: {
            restaurantId: restaurant.id,
            createdAt: { gte: today },
        },
    })

    const revenueToday = await prisma.order.aggregate({
        where: {
            restaurantId: restaurant.id,
            status: "COMPLETED",
            createdAt: { gte: today },
        },
        _sum: { finalAmount: true },
    })

    const revenueMonth = await prisma.order.aggregate({
        where: {
            restaurantId: restaurant.id,
            status: "COMPLETED",
            createdAt: { gte: firstDayOfMonth },
        },
        _sum: { finalAmount: true },
    })

    const totalProducts = await prisma.product.count({
        where: { restaurantId: restaurant.id },
    })

    const pendingOrders = await prisma.order.count({
        where: {
            restaurantId: restaurant.id,
            status: { in: ["PENDING", "CONFIRMED", "PREPARING"] },
        },
    })

    // Pedidos Recentes
    const recentOrders = await prisma.order.findMany({
        where: { restaurantId: restaurant.id },
        include: {
            user: { select: { name: true } },
            items: true,
        },
        orderBy: { createdAt: "desc" },
        take: 5,
    })

    // Dados para Gráfico (Simulado ou Agregado)
    // Como o groupBy do Prisma tem limitações dependendo do DB, vamos buscar os dados brutos e processar no cliente ou aqui.
    // Para simplificar e garantir compatibilidade, vamos buscar os pedidos dos últimos 7 dias e passar para o componente de gráfico processar.
    const last7DaysOrders = await prisma.order.findMany({
        where: {
            restaurantId: restaurant.id,
            createdAt: { gte: sevenDaysAgo },
        },
        select: {
            createdAt: true,
            finalAmount: true,
        },
        orderBy: { createdAt: "asc" },
    })

    // Serializar dados para o Client Component
    const chartData = last7DaysOrders.map(o => ({
        date: o.createdAt.toISOString(),
        amount: Number(o.finalAmount),
    }))

    const serializedRecentOrders = recentOrders.map(o => ({
        ...o,
        totalAmount: Number(o.totalAmount),
        finalAmount: Number(o.finalAmount),
        createdAt: o.createdAt,
    }))

    // Alertas
    const daysToExpire = restaurant.subscriptionExpiresAt
        ? differenceInDays(new Date(restaurant.subscriptionExpiresAt), new Date())
        : null

    const formatCurrency = (value: number | null) => {
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
        }).format(value || 0)
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                    <p className="text-muted-foreground">
                        Visão geral do seu restaurante em {format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button asChild>
                        <Link href="/restaurant/dashboard/products/new">Novo Produto</Link>
                    </Button>
                </div>
            </div>

            {/* Alerta de Métodos de Pagamento Padrão */}
            <Alert className="mb-6 bg-blue-50/50 border-blue-200 text-blue-900">
                <DollarSign className="h-4 w-4 text-blue-600 mt-0.5" />
                <AlertTitle className="font-semibold text-base mb-2 text-blue-800">Pagamentos configurados</AlertTitle>
                <AlertDescription className="text-blue-700/90 text-sm leading-relaxed">
                    <p>
                        Seu restaurante já está pronto para aceitar <span className="font-medium text-blue-900">Dinheiro, Cartão e PIX</span>. Se precisar alterar suas preferências, acesse a página de <Link href="/restaurant/dashboard/settings" className="underline decoration-blue-400 hover:text-blue-900 font-medium transition-colors">configurações de pagamento</Link>.
                    </p>
                </AlertDescription>
            </Alert>
            {/* Verificação de Status de Aprovação */}
            {!restaurant.isApproved && !restaurant.rejectedAt && (
                <Alert className="mb-6 border-yellow-500 bg-yellow-50">
                    <Clock className="h-5 w-5 text-yellow-600" />
                    <AlertTitle className="text-yellow-800 font-semibold">Aguardando Aprovação</AlertTitle>
                    <AlertDescription className="text-yellow-700">
                        Seu restaurante está em análise. Você será notificado por email assim que for aprovado.
                        Enquanto isso, você já pode cadastrar seus produtos.
                    </AlertDescription>
                </Alert>
            )}

            {restaurant.rejectedAt && (
                <Alert variant="destructive" className="mb-6">
                    <AlertTriangle className="h-5 w-5" />
                    <AlertTitle className="font-semibold">Restaurante Rejeitado</AlertTitle>
                    <AlertDescription>
                        <p className="mb-2">Seu restaurante foi rejeitado em {format(new Date(restaurant.rejectedAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
                        <p className="font-medium">Motivo: {restaurant.rejectionReason}</p>
                        <p className="mt-3 text-sm">Entre em contato com o suporte para mais informações ou corrija os problemas e solicite nova análise.</p>
                    </AlertDescription>
                </Alert>
            )}

            {restaurant.isApproved && restaurant.approvedAt && (
                <Alert className="mb-6 border-green-500 bg-green-50">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <AlertTitle className="text-green-800 font-semibold">Restaurante Aprovado</AlertTitle>
                    <AlertDescription className="text-green-700">
                        Seu restaurante foi aprovado em {format(new Date(restaurant.approvedAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })} e está visível para os clientes!
                    </AlertDescription>
                </Alert>
            )}
            {daysToExpire !== null && daysToExpire <= 7 && daysToExpire >= 0 && (
                <Alert className="bg-yellow-50 border-yellow-200 text-yellow-800">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Assinatura Vencendo</AlertTitle>
                    <AlertDescription>
                        Sua assinatura vence em {daysToExpire} dias. Renove para evitar interrupções.
                    </AlertDescription>
                </Alert>
            )}

            {/* Cards de Métricas */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Receita Hoje</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(Number(revenueToday._sum.finalAmount))}</div>
                        <p className="text-xs text-muted-foreground">
                            Vendas confirmadas hoje
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pedidos Hoje</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{ordersToday}</div>
                        <p className="text-xs text-muted-foreground">
                            Pedidos realizados hoje
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Receita Mês</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(Number(revenueMonth._sum.finalAmount))}</div>
                        <p className="text-xs text-muted-foreground">
                            Acumulado do mês atual
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pedidos Pendentes</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${pendingOrders > 0 ? "text-orange-600" : ""}`}>
                            {pendingOrders}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Aguardando preparo ou entrega
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Gráficos e Recentes */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Gráfico */}
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Visão Geral de Vendas</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <DashboardCharts data={chartData} />
                    </CardContent>
                </Card>

                {/* Pedidos Recentes */}
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Pedidos Recentes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8">
                            {serializedRecentOrders.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-4">Nenhum pedido recente.</p>
                            ) : (
                                serializedRecentOrders.map((order) => (
                                    <div key={order.id} className="flex items-center">
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium leading-none">
                                                {order.user.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {order.items.length} itens • {format(new Date(order.createdAt), "HH:mm")}
                                            </p>
                                        </div>
                                        <div className="ml-auto font-medium">
                                            {formatCurrency(order.finalAmount)}
                                        </div>
                                        <Button variant="ghost" size="sm" className="ml-2" asChild>
                                            <Link href={`/restaurant/dashboard/orders/${order.orderNumber}`}>Ver</Link>
                                        </Button>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
