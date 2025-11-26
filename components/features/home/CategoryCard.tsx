"use client"

import Link from "next/link"
import { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface CategoryCardProps {
    id: string
    name: string
    slug: string
    image?: string | null
    icon?: ReactNode
}

export default function CategoryCard({
    name,
    slug,
    image,
    icon,
}: CategoryCardProps) {
    return (
        <Link href={`/category/${slug}`} className="group">
            <div className="relative aspect-square rounded-2xl overflow-hidden border-2 border-transparent bg-gradient-to-br from-orange-50 to-red-50 hover:border-primary hover:shadow-lg transition-all duration-300 flex flex-col items-center justify-center gap-2 p-6">
                {image ? (
                    <img
                        src={image}
                        alt={name}
                        className="w-16 h-16 object-cover rounded-full"
                    />
                ) : icon ? (
                    <div className="text-primary w-12 h-12 flex items-center justify-center">
                        {icon}
                    </div>
                ) : (
                    <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 font-bold text-xl">
                        {name.charAt(0)}
                    </div>
                )}
                <h3 className="text-center font-semibold text-gray-900 group-hover:text-primary transition-colors">
                    {name}
                </h3>
            </div>
        </Link>
    )
}
