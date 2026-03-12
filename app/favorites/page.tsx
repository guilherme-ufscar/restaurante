import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Star, Clock, Heart } from "lucide-react"

export default async function FavoritesPage() {
    const session = await getServerSession(authOptions)
    if (!session) {
        redirect("/auth/signin")
    }

    const favorites = await (prisma as any).favorite.findMany({
        where: { userId: session.user.id },
        include: {
            restaurant: true
        }
    })

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
                <Heart className="h-8 w-8 fill-red-500 text-red-500" />
                Meus Favoritos
            </h1>

            {favorites.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-muted-foreground text-lg">Você ainda não tem restaurantes favoritos.</p>
                    <Link href="/" className="text-primary hover:underline mt-2 inline-block">
                        Explorar restaurantes
                    </Link>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {favorites.map(({ restaurant }: any) => (
                        <Link href={`/restaurant/${restaurant.slug}`} key={restaurant.id}>
                            <Card className="hover:shadow-md transition-shadow h-full overflow-hidden">
                                <div className="h-32 bg-gray-200 relative">
                                    {restaurant.banner && (
                                        <img src={restaurant.banner} alt={restaurant.name} className="w-full h-full object-cover" />
                                    )}
                                </div>
                                <CardContent className="p-4">
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-bold text-lg">{restaurant.name}</h3>
                                        {restaurant.rating && (
                                            <div className="flex items-center gap-1 text-sm font-medium text-yellow-600">
                                                <Star className="h-4 w-4 fill-yellow-400" />
                                                {Number(restaurant.rating).toFixed(1)}
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{restaurant.description}</p>
                                    <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" /> {restaurant.estimatedDeliveryTime} min
                                        </span>
                                        <span>
                                            {Number(restaurant.deliveryFee) === 0 ? "Grátis" : `R$ ${Number(restaurant.deliveryFee).toFixed(2)}`}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}
