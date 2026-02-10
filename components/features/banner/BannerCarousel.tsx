"use client"

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import { Button } from '@/components/ui/button' // Caso queira botão no banner
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Banner {
    id: string
    image: string
    title?: string | null
    description?: string | null
    link?: string | null
}

interface BannerCarouselProps {
    banners: Banner[]
    aspectRatio?: 'video' | 'wide' // video = 16:9, wide = 21:9 ou mais fino
}

export default function BannerCarousel({ banners, aspectRatio = 'wide' }: BannerCarouselProps) {
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
        Autoplay({ delay: 5000, stopOnInteraction: false })
    ])

    if (!banners || banners.length === 0) return null

    const heightClass = aspectRatio === 'wide' ? 'h-[200px] md:h-[400px]' : 'aspect-video'

    return (
        <div className="relative group overflow-hidden rounded-xl shadow-lg border border-gray-100">
            <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex">
                    {banners.map((banner) => (
                        <div className="flex-[0_0_100%] min-w-0 relative" key={banner.id}>
                            <div className={`relative w-full ${heightClass}`}>
                                {/* Imagem de Fundo com Gradient Overlay para Texto */}
                                <Image
                                    src={banner.image}
                                    alt={banner.title || "Banner"}
                                    fill
                                    className="object-cover"
                                    priority
                                />
                                {/* Overlay Escuro se tiver texto, para legibilidade */}
                                {(banner.title || banner.description) && (
                                    <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
                                )}

                                {/* Conteúdo de Texto */}
                                <div className="absolute inset-0 flex items-center p-6 md:p-12">
                                    <div className="max-w-xl space-y-4 text-white animate-in slide-in-from-left-4 fade-in duration-700">
                                        {banner.title && (
                                            <h2 className="text-3xl md:text-5xl font-bold leading-tight drop-shadow-md">
                                                {banner.title}
                                            </h2>
                                        )}
                                        {banner.description && (
                                            <p className="text-lg md:text-xl text-gray-200 drop-shadow-sm line-clamp-2">
                                                {banner.description}
                                            </p>
                                        )}
                                        {banner.link && (
                                            <div className="pt-4">
                                                <Button size="lg" className="bg-primary hover:bg-primary/90 text-white font-semibold rounded-full px-8" asChild>
                                                    <Link href={banner.link}>
                                                        Conferir
                                                    </Link>
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Link Area Total (Opcional, se não tiver botão e quiser clicar no banner todo) */}
                                {banner.link && !banner.title && (
                                    <Link href={banner.link} className="absolute inset-0 z-10">
                                        <span className="sr-only">Ver oferta</span>
                                    </Link>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Setas de Navegação (Só se tiver > 1) */}
            {banners.length > 1 && (
                <>
                    <button
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/30 backdrop-blur-md rounded-full p-2 text-white opacity-0 group-hover:opacity-100 transition duration-300"
                        onClick={() => emblaApi?.scrollPrev()}
                    >
                        <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/30 backdrop-blur-md rounded-full p-2 text-white opacity-0 group-hover:opacity-100 transition duration-300"
                        onClick={() => emblaApi?.scrollNext()}
                    >
                        <ChevronRight className="h-6 w-6" />
                    </button>
                </>
            )}

            {/* Dots Indicadores */}
            {banners.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {banners.map((_, index) => (
                        <div
                            key={index}
                            className="w-2 h-2 rounded-full bg-white/50"
                        // Embla não expõe o index ativo nativamente sem ouvir eventos, 
                        // para simplificar não vou fazer o "active" visual complexo agora, 
                        // mas visualmente os dots já indicam que é um carrossel.
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
