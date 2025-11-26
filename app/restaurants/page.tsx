import { prisma } from "@/lib/prisma"
import Container from "@/components/layout/Container"
import RestaurantCard from "@/components/features/home/RestaurantCard"
import RestaurantFilters from "@/components/features/restaurants/RestaurantFilters"
import { Store } from "lucide-react"

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

export default async function RestaurantsPage(props: {
    searchParams: SearchParams
}) {
    const searchParams = await props.searchParams
    const query = typeof searchParams.query === "string" ? searchParams.query : undefined
    const categorySlug = typeof searchParams.category === "string" ? searchParams.category : undefined
    const sort = typeof searchParams.sort === "string" ? searchParams.sort : undefined

    // Construir filtro Where
    const where: any = {
        isActive: true,
        isApproved: true,
        subscriptionStatus: "ACTIVE",
    }

    if (query) {
        where.OR = [
            { name: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
        ]
    }

    if (categorySlug) {
        where.category = {
            slug: categorySlug,
        }
    }

    // Construir ordenação
    let orderBy: any = { createdAt: "desc" }

    switch (sort) {
        case "rating":
            orderBy = { rating: "desc" }
            break
        case "reviews":
            orderBy = { totalReviews: "desc" }
            break
        case "delivery":
            orderBy = { deliveryFee: "asc" }
            break
        case "recent":
        default:
            orderBy = { createdAt: "desc" }
            break
    }

    // Buscar dados
    const restaurants = await prisma.restaurant.findMany({
        where,
        include: {
            category: true,
            owner: {
                select: {
                    name: true,
                },
            },
        },
        orderBy,
    })

    const categories = await prisma.category.findMany({
        where: { isActive: true },
        orderBy: { name: "asc" },
    })

    const totalRestaurants = restaurants.length

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <Container>
                <div className="space-y-6">
                    {/* Header */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h1 className="text-3xl font-bold mb-2 text-gray-900">Restaurantes</h1>
                        <p className="text-muted-foreground">
                            Encontrados {totalRestaurants} restaurantes
                            {query && ` para "${query}"`}
                            {categorySlug && ` na categoria selecionada`}
                        </p>
                    </div>

                    {/* Filtros */}
                    <RestaurantFilters
                        categories={categories}
                        searchParams={{ query, category: categorySlug, sort }}
                    />

                    {/* Resultados */}
                    {restaurants.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {restaurants.map((restaurant) => (
                                <RestaurantCard
                                    key={restaurant.id}
                                    restaurant={{
                                        ...restaurant,
                                        rating: restaurant.rating ? Number(restaurant.rating) : null,
                                        deliveryFee: Number(restaurant.deliveryFee),
                                        minOrderValue: Number(restaurant.minOrderValue),
                                    }}
                                    category={restaurant.category}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                            <div className="flex justify-center mb-4">
                                <Store className="w-16 h-16 text-gray-300" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Nenhum restaurante encontrado
                            </h3>
                            <p className="text-muted-foreground max-w-md mx-auto">
                                Tente ajustar seus filtros ou buscar por outro termo.
                            </p>
                        </div>
                    )}
                </div>
            </Container>
        </div>
    )
}
