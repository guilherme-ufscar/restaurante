import { prisma } from "@/lib/prisma"
import Container from "@/components/layout/Container"
import Link from "next/link"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Store, UtensilsCrossed } from "lucide-react"

export default async function CategoriesPage() {
    const categories = await prisma.category.findMany({
        where: { isActive: true },
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
        orderBy: { name: "asc" },
    })

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <Container>
                <div className="space-y-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold mb-2 text-gray-900">Categorias</h1>
                        <p className="text-lg text-muted-foreground">
                            Explore restaurantes por tipo de culinária
                        </p>
                    </div>

                    {/* Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {categories.map((category) => (
                            <Link
                                key={category.id}
                                href={`/restaurants?category=${category.slug}`}
                                className="group"
                            >
                                <div className="relative overflow-hidden rounded-2xl border-2 border-transparent bg-white hover:border-primary hover:shadow-xl transition-all duration-300 p-6 h-full">
                                    <div className="flex flex-col items-center text-center space-y-4">
                                        {category.image ? (
                                            <div className="relative w-20 h-20 rounded-full overflow-hidden">
                                                <Image
                                                    src={category.image}
                                                    alt={category.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                        ) : (
                                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                                                <Store className="text-white w-10 h-10" />
                                            </div>
                                        )}

                                        <h3 className="text-xl font-bold group-hover:text-primary transition-colors">
                                            {category.name}
                                        </h3>

                                        <Badge variant="secondary" className="px-3 py-1">
                                            {category._count.restaurants} restaurantes
                                        </Badge>

                                        {category.description && (
                                            <p className="text-sm text-muted-foreground line-clamp-2">
                                                {category.description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </Container>
        </div>
    )
}
