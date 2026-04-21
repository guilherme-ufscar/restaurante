"use client"

import Link from "next/link"
import Image from "next/image"
import { ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/contexts/CartContext"

interface ProductCardProps {
    product: {
        id: string
        name: string
        image?: string | null
        price: number
        discountPrice?: number | null
        description?: string | null
    }
    restaurant: {
        id: string
        name: string
        slug: string
    }
}

export default function ProductCard({ product, restaurant }: ProductCardProps) {
    const discountPercentage = product.discountPrice
        ? Math.round(((Number(product.price) - Number(product.discountPrice)) / Number(product.price)) * 100)
        : 0

    const { addToCart } = useCart()

    return (
        <div className="group rounded-xl border bg-card overflow-hidden hover:shadow-lg transition-all duration-300">
            {/* Imagem */}
            <div className="relative h-40 overflow-hidden bg-gray-100">
                <Image
                    src={product.image || "/images/product-placeholder.jpg"}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {product.discountPrice && (
                    <Badge className="absolute top-2 right-2 bg-red-500 text-white">
                        -{discountPercentage}%
                    </Badge>
                )}
            </div>

            {/* Informações */}
            <div className="p-4 space-y-2">
                <h3 className="font-semibold line-clamp-1 group-hover:text-primary transition-colors">
                    {product.name}
                </h3>

                {product.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 h-10">
                        {product.description}
                    </p>
                )}

                <p className="text-xs text-muted-foreground">
                    {restaurant.name}
                </p>

                {/* Preço e Ação */}
                <div className="flex items-center justify-between pt-2">
                    <div className="flex flex-col">
                        {product.discountPrice ? (
                            <>
                                <span className="text-lg font-bold text-primary">
                                    R$ {Number(product.discountPrice).toFixed(2)}
                                </span>
                                <span className="text-sm text-muted-foreground line-through">
                                    R$ {Number(product.price).toFixed(2)}
                                </span>
                            </>
                        ) : (
                            <span className="text-lg font-bold">
                                R$ {Number(product.price).toFixed(2)}
                            </span>
                        )}
                    </div>

                    <Button
                        size="sm"
                        className="gap-1"
                        onClick={() => addToCart({
                            productId: product.id,
                            name: product.name,
                            image: product.image || undefined,
                            price: Number(product.discountPrice || product.price),
                            restaurantId: restaurant.id,
                            restaurantName: restaurant.name,
                            restaurantSlug: restaurant.slug,
                        })}
                    >
                        <ShoppingCart className="w-4 h-4" />
                        Adicionar
                    </Button>
                </div>
            </div>
        </div>
    )
}
