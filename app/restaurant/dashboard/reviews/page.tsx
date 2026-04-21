import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Star, User } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export default async function RestaurantReviewsPage() {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "RESTAURANT") {
        redirect("/auth/signin")
    }

    const restaurant = await prisma.restaurant.findUnique({
        where: { ownerId: session.user.id }
    })

    if (!restaurant) {
        return <div>Restaurante não encontrado.</div>
    }

    const reviews = await prisma.review.findMany({
        where: { restaurantId: restaurant.id },
        include: {
            user: { select: { name: true, image: true } },
            order: { select: { orderNumber: true } }
        },
        orderBy: { createdAt: "desc" }
    })

    // Estatísticas
    const totalReviews = reviews.length
    const averageRating = totalReviews > 0
        ? reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews
        : 0

    const distribution = [5, 4, 3, 2, 1].map(star => {
        const count = reviews.filter(r => r.rating === star).length
        const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0
        return { star, count, percentage }
    })

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold tracking-tight">Avaliações dos Clientes</h1>

            {/* Resumo */}
            <Card>
                <CardHeader>
                    <CardTitle>Resumo Geral</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col md:flex-row gap-8 items-center">
                    <div className="text-center">
                        <div className="text-5xl font-bold text-primary flex items-center justify-center gap-2">
                            {averageRating.toFixed(1)}
                            <Star className="h-8 w-8 fill-primary text-primary" />
                        </div>
                        <p className="text-muted-foreground mt-2">{totalReviews} avaliações</p>
                    </div>
                    <div className="flex-1 w-full space-y-2">
                        {distribution.map((item) => (
                            <div key={item.star} className="flex items-center gap-2">
                                <span className="w-4 font-medium text-sm">{item.star}</span>
                                <Star className="h-4 w-4 text-gray-400" />
                                <Progress value={item.percentage} className="h-2" />
                                <span className="w-10 text-xs text-muted-foreground text-right">{item.count}</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Lista de Avaliações */}
            <div className="space-y-4">
                {reviews.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        <Star className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>Você ainda não recebeu avaliações.</p>
                    </div>
                ) : (
                    reviews.map((review) => (
                        <Card key={review.id}>
                            <CardContent className="pt-6">
                                <div className="flex items-start gap-4">
                                    <Avatar>
                                        <AvatarImage src={review.user.image || ""} />
                                        <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-semibold">{review.user.name || "Cliente"}</h4>
                                                <div className="flex items-center gap-1 mt-1">
                                                    {Array.from({ length: 5 }).map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            className={`h-4 w-4 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                            <span className="text-sm text-muted-foreground">
                                                {format(review.createdAt, "dd/MM/yyyy", { locale: ptBR })}
                                            </span>
                                        </div>
                                        {review.comment && (
                                            <p className="mt-3 text-gray-700">{review.comment}</p>
                                        )}
                                        <div className="mt-2 text-xs text-muted-foreground">
                                            Pedido #{review.order.orderNumber}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}
