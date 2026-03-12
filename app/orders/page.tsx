import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
    ShoppingBag,
    Clock,
    MapPin,
    ChevronRight,
    Store
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import Image from "next/image"
import Container from "@/components/layout/Container"

export default async function OrdersHistoryPage() {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
        redirect("/auth/signin")
    }

    const orders = await prisma.order.findMany({
        where: { userId: session.user.id },
        include: {
            restaurant: {
                select: {
                    name: true,
                    slug: true,
                    logo: true,
                },
            },
            items: {
                take: 3, // Mostrar apenas os primeiros 3 itens no resumo
                include: {
                    product: {
                        select: {
                            name: true,
                        },
                    },
                },
            },
            _count: {
                select: { items: true },
            },
        },
        orderBy: { createdAt: "desc" },
    })

    // Serialização
    const serializedOrders = orders.map(order => ({
        ...order,
        totalAmount: Number(order.totalAmount),
        finalAmount: Number(order.finalAmount),
        createdAt: order.createdAt,
    }))

    const getStatusColor = (status: string) => {
        switch (status) {
            case "PENDING": return "bg-yellow-500"
            case "CONFIRMED": return "bg-blue-500"
            case "PREPARING": return "bg-orange-500"
            case "READY": return "bg-purple-500"
            case "DELIVERING": return "bg-indigo-500"
            case "COMPLETED": return "bg-green-500"
            case "CANCELLED": return "bg-red-500"
            default: return "bg-gray-500"
        }
    }

    const getStatusLabel = (status: string) => {
        switch (status) {
            case "PENDING": return "Pendente"
            case "CONFIRMED": return "Confirmado"
            case "PREPARING": return "Em Preparo"
            case "READY": return "Pronto"
            case "DELIVERING": return "Em Entrega"
            case "COMPLETED": return "Concluído"
            case "CANCELLED": return "Cancelado"
            default: return status
        }
    }

    const OrderList = ({ ordersList }: { ordersList: typeof serializedOrders }) => {
        if (ordersList.length === 0) {
            return (
                <div className="text-center py-12">
                    <div className="flex justify-center mb-4">
                        <ShoppingBag className="h-12 w-12 text-gray-300" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">Nenhum pedido encontrado</h3>
                    <p className="text-muted-foreground mb-6">Você ainda não fez pedidos nesta categoria.</p>
                    <Button asChild>
                        <Link href="/">Explorar Restaurantes</Link>
                    </Button>
                </div>
            )
        }

        return (
            <div className="space-y-4">
                {ordersList.map((order) => (
                    <Card key={order.id} className="overflow-hidden hover:border-primary transition-colors">
                        <div className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    {order.restaurant.logo ? (
                                        <div className="relative h-12 w-12 rounded-full overflow-hidden border">
                                            <Image src={order.restaurant.logo} alt={order.restaurant.name} fill className="object-cover" />
                                        </div>
                                    ) : (
                                        <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center border">
                                            <Store className="h-6 w-6 text-gray-400" />
                                        </div>
                                    )}
                                    <div>
                                        <Link href={`/restaurant/${order.restaurant.slug}`} className="font-semibold hover:underline">
                                            {order.restaurant.name}
                                        </Link>
                                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {format(new Date(order.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                                        </div>
                                    </div>
                                </div>
                                <Badge className={getStatusColor(order.status)}>
                                    {getStatusLabel(order.status)}
                                </Badge>
                            </div>

                            <div className="space-y-2 mb-4">
                                {order.items.map((item) => (
                                    <div key={item.id} className="text-sm text-gray-600 flex justify-between">
                                        <span>{item.quantity}x {item.product.name}</span>
                                    </div>
                                ))}
                                {order._count.items > 3 && (
                                    <p className="text-xs text-muted-foreground">e mais {order._count.items - 3} itens...</p>
                                )}
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t">
                                <div className="flex flex-col">
                                    <span className="text-xs text-muted-foreground">Total</span>
                                    <span className="font-bold text-lg">R$ {order.finalAmount.toFixed(2)}</span>
                                </div>
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={`/orders/${order.orderNumber}`}>
                                        Ver Detalhes
                                        <ChevronRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <Container>
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold mb-8">Meus Pedidos</h1>

                    <Tabs defaultValue="all" className="space-y-6">
                        <TabsList>
                            <TabsTrigger value="all">Todos</TabsTrigger>
                            <TabsTrigger value="active">Em Andamento</TabsTrigger>
                            <TabsTrigger value="completed">Concluídos</TabsTrigger>
                        </TabsList>

                        <TabsContent value="all">
                            <OrderList ordersList={serializedOrders} />
                        </TabsContent>

                        <TabsContent value="active">
                            <OrderList
                                ordersList={serializedOrders.filter(o =>
                                    ["PENDING", "CONFIRMED", "PREPARING", "READY", "DELIVERING"].includes(o.status)
                                )}
                            />
                        </TabsContent>

                        <TabsContent value="completed">
                            <OrderList
                                ordersList={serializedOrders.filter(o =>
                                    ["COMPLETED", "CANCELLED"].includes(o.status)
                                )}
                            />
                        </TabsContent>
                    </Tabs>
                </div>
            </Container>
        </div>
    )
}
