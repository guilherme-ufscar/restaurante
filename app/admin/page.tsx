import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Store, Clock, CheckCircle, Users, ShoppingCart, DollarSign } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function AdminDashboard() {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== "ADMIN") {
        redirect("/")
    }

    // Metrics
    const totalRestaurants = await prisma.restaurant.count()

    const pendingRestaurants = await prisma.restaurant.count({
        where: {
            isApproved: false,
            rejectedAt: null
        }
    })

    const activeRestaurants = await prisma.restaurant.count({
        where: { subscriptionStatus: "ACTIVE" }
    })

    const totalUsers = await prisma.user.count()

    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    const ordersToday = await prisma.order.count({
        where: { createdAt: { gte: todayStart } }
    })

    const revenueData = await prisma.order.aggregate({
        where: { status: "COMPLETED" },
        _sum: { finalAmount: true }
    })

    const totalRevenue = revenueData._sum.finalAmount ? Number(revenueData._sum.finalAmount) : 0

    // Pending Restaurants List
    const pendingRestaurantsList = await prisma.restaurant.findMany({
        where: {
            isApproved: false,
            rejectedAt: null
        },
        include: {
            owner: {
                select: { name: true, email: true }
            },
            category: {
                select: { name: true }
            }
        },
        orderBy: { createdAt: "desc" },
        take: 5
    })

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Administrativo</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total de Restaurantes</CardTitle>
                        <Store className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalRestaurants}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pendentes de Aprovação</CardTitle>
                        <Clock className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{pendingRestaurants}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Restaurantes Ativos</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeRestaurants}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalUsers}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pedidos Hoje</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{ordersToday}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
                        <DollarSign className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(totalRevenue)}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Restaurantes Pendentes de Aprovação</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {pendingRestaurantsList.length === 0 ? (
                            <p className="text-muted-foreground">Nenhum restaurante aguardando aprovação.</p>
                        ) : (
                            <div className="space-y-4">
                                {pendingRestaurantsList.map((restaurant) => (
                                    <div key={restaurant.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                                        <div>
                                            <h3 className="font-semibold">{restaurant.name}</h3>
                                            <p className="text-sm text-muted-foreground">
                                                Proprietário: {restaurant.owner.name} ({restaurant.owner.email})
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                Categoria: {restaurant.category.name}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                Cadastrado em: {new Date(restaurant.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <Button asChild size="sm">
                                            <Link href={`/admin/restaurants/${restaurant.id}`}>
                                                Ver Detalhes
                                            </Link>
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
