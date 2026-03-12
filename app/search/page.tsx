import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, Clock, Search as SearchIcon } from "lucide-react"

interface SearchPageProps {
    searchParams: Promise<{
        q?: string
    }>
}

export default async function SearchPage(props: SearchPageProps) {
    const searchParams = await props.searchParams
    const query = searchParams.q || ""

    if (!query) {
        return (
            <div className="container mx-auto px-4 py-8 text-center">
                <h1 className="text-2xl font-bold mb-4">Busca</h1>
                <p className="text-muted-foreground">Digite algo para buscar.</p>
            </div>
        )
    }

    console.log('Buscando por:', query)

    const [restaurants, products] = await Promise.all([
        prisma.restaurant.findMany({
            where: {
                isActive: true,
                isApproved: true,
                subscriptionStatus: "ACTIVE",
                OR: [
                    { name: { contains: query, mode: "insensitive" } },
                    { description: { contains: query, mode: "insensitive" } },
                    { category: { name: { contains: query, mode: "insensitive" } } }
                ]
            },
            include: { category: true }
        }),
        prisma.product.findMany({
            where: {
                isAvailable: true,
                restaurant: {
                    isActive: true,
                    isApproved: true,
                    subscriptionStatus: "ACTIVE"
                },
                OR: [
                    { name: { contains: query, mode: "insensitive" } },
                    { description: { contains: query, mode: "insensitive" } },
                    { category: { contains: query, mode: "insensitive" } }
                ]
            },
            include: { restaurant: true }
        })
    ])

    console.log(`Encontrados: ${restaurants.length} restaurantes, ${products.length} produtos`)

    return (
        <div className="container mx-auto px-4 py-8 space-y-8">
            <h1 className="text-3xl font-bold">Resultados para "{query}"</h1>

            {/* Restaurantes */}
            <section>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    Restaurantes <Badge variant="secondary">{restaurants.length}</Badge>
                </h2>
                {restaurants.length > 0 ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {restaurants.map((restaurant) => (
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
                ) : (
                    <p className="text-muted-foreground">Nenhum restaurante encontrado.</p>
                )}
            </section>

            {/* Produtos */}
            <section>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    Produtos <Badge variant="secondary">{products.length}</Badge>
                </h2>
                {products.length > 0 ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {products.map((product) => (
                            <Link href={`/restaurant/${product.restaurant.slug}`} key={product.id}>
                                <Card className="hover:shadow-md transition-shadow h-full flex flex-col">
                                    <div className="aspect-video bg-gray-100 relative overflow-hidden rounded-t-lg">
                                        {product.image ? (
                                            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-gray-400">
                                                <SearchIcon className="h-8 w-8" />
                                            </div>
                                        )}
                                    </div>
                                    <CardContent className="p-4 flex-1 flex flex-col">
                                        <h3 className="font-medium">{product.name}</h3>
                                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2 flex-1">{product.description}</p>
                                        <div className="mt-4 flex items-center justify-between">
                                            <span className="font-bold text-primary">
                                                {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(product.price))}
                                            </span>
                                            <span className="text-xs text-muted-foreground truncate max-w-[100px]">
                                                {product.restaurant.name}
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <p className="text-muted-foreground">Nenhum produto encontrado.</p>
                )}
            </section>
        </div>
    )
}
