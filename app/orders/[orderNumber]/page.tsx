import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { notFound, redirect } from "next/navigation"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
    CheckCircle,
    MapPin,
    Clock,
    Phone,
    ArrowLeft,
    ShoppingBag,
    CreditCard,
    Store
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import Image from "next/image"
import Container from "@/components/layout/Container"

interface OrderPageProps {
    params: Promise<{ orderNumber: string }>
}

export default async function OrderPage(props: OrderPageProps) {
    const params = await props.params
    const session = await getServerSession(authOptions)

    if (!session?.user) {
        redirect("/auth/signin")
    }

    const order = await prisma.order.findUnique({
        where: { orderNumber: params.orderNumber },
        include: {
            restaurant: {
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    logo: true,
                    phone: true,
                    email: true,
                },
            },
            items: {
                include: {
                    product: {
                        select: {
                            id: true,
                            name: true,
                            image: true,
                        },
                    },
                },
            },
        },
    })

    if (!order) {
        notFound()
    }

    // Buscar método de pagamento manualmente já que não há relação no schema
    const paymentMethod = await prisma.paymentMethod.findUnique({
        where: { id: order.paymentMethodId },
    })

    if (order.userId !== session.user.id) {
        return (
            <Container>
                <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                    <h1 className="text-2xl font-bold text-red-600">Acesso Negado</h1>
                    <p>Você não tem permissão para visualizar este pedido.</p>
                    <Button asChild>
                        <Link href="/">Voltar para Home</Link>
                    </Button>
                </div>
            </Container>
        )
    }

    // Serialização
    const serializedOrder = {
        ...order,
        totalAmount: Number(order.totalAmount),
        deliveryFee: Number(order.deliveryFee),
        discount: Number(order.discount),
        finalAmount: Number(order.finalAmount),
        items: order.items.map(item => ({
            ...item,
            unitPrice: Number(item.unitPrice),
            totalPrice: Number(item.totalPrice),
        })),
    }

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

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <Container>
                <div className="max-w-4xl mx-auto space-y-8">
                    {/* Header de Sucesso */}
                    <div className="text-center space-y-4">
                        <div className="flex justify-center">
                            <CheckCircle className="h-16 w-16 text-green-500" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900">Pedido Realizado com Sucesso!</h1>
                        <p className="text-muted-foreground">
                            Obrigado pela preferência. Acompanhe abaixo o status do seu pedido.
                        </p>
                        <Badge variant="outline" className="text-lg py-1 px-4">
                            Pedido #{serializedOrder.orderNumber}
                        </Badge>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Detalhes do Pedido */}
                        <div className="md:col-span-2 space-y-6">
                            {/* Status Card */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between">
                                        <span>Status do Pedido</span>
                                        <Badge className={`${getStatusColor(serializedOrder.status)} hover:${getStatusColor(serializedOrder.status)}`}>
                                            {getStatusLabel(serializedOrder.status)}
                                        </Badge>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        <Clock className="h-4 w-4" />
                                        <span>
                                            Previsão de entrega: {serializedOrder.estimatedDeliveryTime ? format(new Date(serializedOrder.estimatedDeliveryTime), "HH:mm", { locale: ptBR }) : "--:--"}
                                            {" "}(aprox. {serializedOrder.estimatedDeliveryTime ? Math.round((new Date(serializedOrder.estimatedDeliveryTime).getTime() - Date.now()) / 60000) : 40} min)
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Itens */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Itens do Pedido</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {serializedOrder.items.map((item) => (
                                        <div key={item.id} className="flex items-start gap-4 py-2 border-b last:border-0">
                                            <div className="relative h-16 w-16 rounded-md overflow-hidden bg-gray-100 shrink-0">
                                                {item.product.image ? (
                                                    <Image
                                                        src={item.product.image}
                                                        alt={item.product.name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex items-center justify-center h-full">
                                                        <Store className="h-6 w-6 text-gray-300" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-medium">{item.product.name}</h4>
                                                <p className="text-sm text-muted-foreground">
                                                    {item.quantity}x R$ {item.unitPrice.toFixed(2)}
                                                </p>
                                                {item.notes && (
                                                    <p className="text-xs text-gray-500 italic mt-1">Obs: {item.notes}</p>
                                                )}
                                            </div>
                                            <div className="font-medium">
                                                R$ {item.totalPrice.toFixed(2)}
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>

                            {/* Entrega e Pagamento */}
                            <div className="grid md:grid-cols-2 gap-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base flex items-center gap-2">
                                            <MapPin className="h-4 w-4" />
                                            Entrega
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {serializedOrder.deliveryType === "DELIVERY" ? (
                                            <div className="text-sm">
                                                <p className="font-medium text-gray-900">Endereço de Entrega</p>
                                                <p className="text-muted-foreground mt-1">
                                                    {serializedOrder.deliveryAddress}
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="text-sm">
                                                <p className="font-medium text-green-600">Retirada no Local</p>
                                                <p className="text-muted-foreground mt-1">
                                                    Você deve retirar seu pedido no restaurante.
                                                </p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base flex items-center gap-2">
                                            <CreditCard className="h-4 w-4" />
                                            Pagamento
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-sm">
                                            <p className="font-medium">
                                                {paymentMethod?.name || "Pagamento na entrega"}
                                            </p>
                                            <p className="text-muted-foreground mt-1">
                                                Status: {serializedOrder.paymentStatus === "PENDING" ? "Pendente" : "Pago"}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Resumo Financeiro */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Resumo Financeiro</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Subtotal</span>
                                        <span>R$ {serializedOrder.totalAmount.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Taxa de Entrega</span>
                                        <span>R$ {serializedOrder.deliveryFee.toFixed(2)}</span>
                                    </div>
                                    {serializedOrder.discount > 0 && (
                                        <div className="flex justify-between text-sm text-green-600">
                                            <span>Desconto</span>
                                            <span>- R$ {serializedOrder.discount.toFixed(2)}</span>
                                        </div>
                                    )}
                                    <Separator />
                                    <div className="flex justify-between font-bold text-lg">
                                        <span>Total</span>
                                        <span className="text-primary">R$ {serializedOrder.finalAmount.toFixed(2)}</span>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Restaurante Info */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <Store className="h-4 w-4" />
                                        Restaurante
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        {serializedOrder.restaurant.logo ? (
                                            <div className="relative h-10 w-10 rounded-full overflow-hidden">
                                                <Image src={serializedOrder.restaurant.logo} alt={serializedOrder.restaurant.name} fill className="object-cover" />
                                            </div>
                                        ) : (
                                            <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                                                <Store className="h-5 w-5 text-gray-400" />
                                            </div>
                                        )}
                                        <div>
                                            <p className="font-medium">{serializedOrder.restaurant.name}</p>
                                            <Link href={`/restaurant/${serializedOrder.restaurant.slug}`} className="text-xs text-primary hover:underline">
                                                Ver cardápio
                                            </Link>
                                        </div>
                                    </div>

                                    {serializedOrder.restaurant.phone && (
                                        <Button variant="outline" className="w-full gap-2" asChild>
                                            <a href={`tel:${serializedOrder.restaurant.phone}`}>
                                                <Phone className="h-4 w-4" />
                                                Ligar para restaurante
                                            </a>
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Ações */}
                            <div className="space-y-3">
                                <Button className="w-full" asChild>
                                    <Link href="/orders">Meus Pedidos</Link>
                                </Button>
                                <Button variant="outline" className="w-full" asChild>
                                    <Link href="/">Fazer Novo Pedido</Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </Container>
        </div>
    )
}
