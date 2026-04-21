"use client"

import Link from "next/link"
import Image from "next/image"
import { Star, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface RestaurantCardProps {
    restaurant: {
        id: string
        name: string
        slug: string
        logo?: string | null
        banner?: string | null
        rating?: number | null
        totalReviews: number
        estimatedDeliveryTime: number
        deliveryFee: number
        minOrderValue: number
    }
    category: {
        name: string
    }
}

export default function RestaurantCard({
    restaurant,
    category,
}: RestaurantCardProps) {
    return (
        <Link href={`/restaurant/${restaurant.slug}`} className="group block">
            <div className="overflow-hidden rounded-2xl border bg-card hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                {/* Imagem e Banner */}
                <div className="relative h-48 overflow-hidden">
                    <Image
                        src={restaurant.banner || "/images/restaurant-placeholder.jpg"}
                        alt={restaurant.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                    <Badge className="absolute top-3 left-3 bg-white/90 text-gray-900 hover:bg-white">
                        {category.name}
                    </Badge>

                    {restaurant.logo && (
                        <div className="absolute -bottom-6 left-4 w-20 h-20 rounded-full border-4 border-white overflow-hidden shadow-lg bg-white z-10">
                            <Image
                                src={restaurant.logo}
                                alt={restaurant.name}
                                fill
                                className="object-cover"
                            />
                        </div>
                    )}
                </div>

                {/* Informações */}
                <div className={cn("p-4", restaurant.logo ? "pt-12" : "pt-4")}>
                    <div className="space-y-2">
                        <h3 className="font-bold text-lg line-clamp-1 group-hover:text-primary transition-colors">
                            {restaurant.name}
                        </h3>

                        {restaurant.rating && (
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1">
                                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                    <span className="text-sm font-medium">
                                        {Number(restaurant.rating).toFixed(1)}
                                    </span>
                                </div>
                                <span className="text-sm text-muted-foreground">
                                    ({restaurant.totalReviews} avaliações)
                                </span>
                            </div>
                        )}

                        <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                            <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                <span>{restaurant.estimatedDeliveryTime} min</span>
                            </div>
                            <div>
                                Entrega R$ {Number(restaurant.deliveryFee).toFixed(2)}
                            </div>
                            <div>
                                Mín R$ {Number(restaurant.minOrderValue).toFixed(2)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    )
}
