"use client"

import { useState } from "react"
import Image from "next/image"
import { Star, Clock, Bike, MapPin, Search, UtensilsCrossed } from "lucide-react"
import Container from "@/components/layout/Container"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import ProductModal from "./ProductModal"

interface Product {
    id: string
    name: string
    description?: string | null
    price: number
    discountPrice?: number | null
    image?: string | null
    category: string
    preparationTime?: number | null
    isAvailable: boolean
}

interface Restaurant {
    id: string
    name: string
    slug: string
    description?: string | null
    rating?: number | null
    totalReviews: number
    deliveryFee: number
    estimatedDeliveryTime: number
    minOrderValue: number
    category: { name: string }
}

interface RestaurantClientProps {
    restaurant: Restaurant
    productsByCategory: Record<string, Product[]>
}

export default function RestaurantClient({
    restaurant,
    productsByCategory,
}: RestaurantClientProps) {
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")

    const handleProductClick = (product: Product) => {
        setSelectedProduct(product)
        setIsModalOpen(true)
    }

    // Filtrar produtos baseado na busca
    const filteredProductsByCategory = Object.entries(productsByCategory).reduce(
        (acc, [category, products]) => {
            const filtered = products.filter((p) =>
                p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.description?.toLowerCase().includes(searchQuery.toLowerCase())
            )
            if (filtered.length > 0) {
                acc[category] = filtered
            }
            return acc
        },
        {} as Record<string, Product[]>
    )

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Banner com Gradiente */}
            <div className="h-48 md:h-64 bg-gradient-to-r from-orange-500 to-red-600 relative">
                <div className="absolute inset-0 bg-black/20" />
            </div>

            <Container className="relative z-10 -mt-20">
                {/* Card do Restaurante */}
                <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 mb-8">
                    <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                        {/* Logo Placeholder */}
                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-white border-4 border-white shadow-md flex items-center justify-center overflow-hidden flex-shrink-0">
                            <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                                <UtensilsCrossed className="w-10 h-10 md:w-14 md:h-14" />
                            </div>
                        </div>

                        <div className="flex-1 space-y-2 w-full">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                                <h1 className="text-3xl font-bold text-gray-900">
                                    {restaurant.name}
                                </h1>
                                <div className="flex items-center gap-1 text-yellow-500 font-bold bg-yellow-50 px-3 py-1 rounded-full">
                                    <Star className="w-5 h-5 fill-current" />
                                    <span>{restaurant.rating?.toFixed(1) || "Novo"}</span>
                                    <span className="text-gray-400 font-normal text-sm ml-1">
                                        ({restaurant.totalReviews})
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                                <span className="text-primary font-medium">
                                    {restaurant.category.name}
                                </span>
                                <span>•</span>
                                <div className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    {restaurant.estimatedDeliveryTime} min
                                </div>
                                <span>•</span>
                                <div className="flex items-center gap-1">
                                    <Bike className="w-4 h-4" />
                                    {restaurant.deliveryFee === 0
                                        ? "Grátis"
                                        : `R$ ${Number(restaurant.deliveryFee).toFixed(2)}`}
                                </div>
                                <span>•</span>
                                <span>Min. R$ {Number(restaurant.minOrderValue).toFixed(2)}</span>
                            </div>

                            {restaurant.description && (
                                <p className="text-gray-500 text-sm max-w-2xl">
                                    {restaurant.description}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Barra de Busca */}
                    <div className="mt-8 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                            placeholder="Buscar no cardápio..."
                            className="pl-10 bg-gray-50 border-gray-200"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Cardápio */}
                <div className="space-y-10">
                    {Object.entries(filteredProductsByCategory).length > 0 ? (
                        Object.entries(filteredProductsByCategory).map(([category, products]) => (
                            <div key={category} className="scroll-mt-24" id={category}>
                                <h2 className="text-2xl font-bold text-gray-800 mb-6 border-l-4 border-primary pl-3">
                                    {category}
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {products.map((product) => (
                                        <div
                                            key={product.id}
                                            className="group bg-white rounded-lg border border-gray-100 p-4 hover:shadow-md transition-all cursor-pointer flex gap-4"
                                            onClick={() => handleProductClick(product)}
                                        >
                                            <div className="flex-1 space-y-2">
                                                <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors">
                                                    {product.name}
                                                </h3>
                                                {product.description && (
                                                    <p className="text-sm text-gray-500 line-clamp-2">
                                                        {product.description}
                                                    </p>
                                                )}
                                                <div className="flex items-center gap-2 pt-1">
                                                    {product.discountPrice ? (
                                                        <>
                                                            <span className="font-bold text-primary">
                                                                R$ {Number(product.discountPrice).toFixed(2)}
                                                            </span>
                                                            <span className="text-sm text-gray-400 line-through">
                                                                R$ {Number(product.price).toFixed(2)}
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <span className="font-bold text-gray-900">
                                                            R$ {Number(product.price).toFixed(2)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Imagem do Produto */}
                                            <div className="relative w-28 h-28 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                                {product.image ? (
                                                    <Image
                                                        src={product.image}
                                                        alt={product.name}
                                                        fill
                                                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                        <UtensilsCrossed className="w-8 h-8" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-gray-500 text-lg">
                                Nenhum produto encontrado para sua busca.
                            </p>
                        </div>
                    )}
                </div>
            </Container>

            <ProductModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                product={selectedProduct}
                restaurant={restaurant}
            />
        </div>
    )
}
