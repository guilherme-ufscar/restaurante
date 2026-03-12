"use client"

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'

interface Banner {
    id: string
    image: string
    title?: string | null
    description?: string | null
    link?: string | null
}

interface HeroBannerCarouselProps {
    banners: Banner[]
}

export default function HeroBannerCarousel({ banners }: HeroBannerCarouselProps) {
    const [emblaRef] = useEmblaCarousel({ loop: true }, [
        Autoplay({ delay: 6000, stopOnInteraction: false })
    ])

    if (!banners || banners.length === 0) return null

    return (
        <div className="absolute inset-0 overflow-hidden" ref={emblaRef}>
            <div className="flex h-full">
                {banners.map((banner) => (
                    <div className="flex-[0_0_100%] min-w-0 relative h-full" key={banner.id}>
                        {banner.link ? (
                            <Link href={banner.link} className="block relative w-full h-full">
                                <Image
                                    src={banner.image}
                                    alt={banner.title || "Hero Banner"}
                                    fill
                                    className="object-cover"
                                    priority
                                />
                                <div className="absolute inset-0 bg-black/40" />
                            </Link>
                        ) : (
                            <div className="relative w-full h-full">
                                <Image
                                    src={banner.image}
                                    alt={banner.title || "Hero Banner"}
                                    fill
                                    className="object-cover"
                                    priority
                                />
                                <div className="absolute inset-0 bg-black/40" />
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}
