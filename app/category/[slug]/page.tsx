import { prisma } from "@/lib/prisma"
import Container from "@/components/layout/Container"
import RestaurantCard from "@/components/features/home/RestaurantCard"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Store } from "lucide-react"

interface PageProps {
    params: Promise<{ slug: string }>
}

export default async function CategoryPage(props: PageProps) {
    const params = await props.params
    const { slug } = params

    const category = await prisma.category.findUnique({
        where: { slug },
        include: {
            _count: {
                select: {
                    restaurants: {
                        where: {
                            isActive: true,
                            isApproved: true,
                        },
                    },
                },
            },
        },
    })

    if (!category) {
        notFound()
    }

    const restaurants = await prisma.restaurant.findMany({
        where: {
            categoryId: category.id,
            isActive: true,
            isApproved: true,
            subscriptionStatus: "ACTIVE",
        },
        include: {
            category: true,
        },
        orderBy: {
            rating: "desc",
        },
    })

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <Container>
                {/* Header Section */}
                <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl p-8 mb-8 shadow-lg">
                    <div className="flex items-center gap-2 text-sm opacity-90 mb-4">
                        <Link href="/" className="hover:underline">
                            Home
                        </Link>
                        <span>&gt;</span>
                        <Link href="/categories" className="hover:underline">
                            Categorias
                        </Link>
                        <span>&gt;</span>
                        <span className="font-medium">{category.name}</span>
                    </div>

                    <h1 className="text-4xl font-bold mb-2">{category.name}</h1>

                    {category.description && (
                        <p className="text-lg opacity-90 mt-2 max-w-2xl">
                            {category.description}
                        </p>
                    )}

                    <div className="flex items-center gap-2 mt-6 opacity-80">
                        <Store className="w-5 h-5" />
                        <p>{category._count.restaurants} restaurantes encontrados</p>
                    </div>
                </div>

                {/* Grid de Restaurantes */}
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
                    <div className="text-center py-16 bg-white rounded-lg shadow-sm">
                        <div className="flex justify-center mb-4">
                            <Store className="w-16 h-16 text-gray-300" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Nenhum restaurante encontrado
                        </h3>
                        <p className="text-muted-foreground max-w-md mx-auto">
                            Ainda não temos restaurantes cadastrados nesta categoria.
                        </p>
                    </div>
                )}
            </Container>
        </div>
    )
}
