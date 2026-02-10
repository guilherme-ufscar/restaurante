"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"

export function HeroSearch() {
    const [searchQuery, setSearchQuery] = useState("")
    const router = useRouter()

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (searchQuery.trim()) {
            router.push(`/search?query=${encodeURIComponent(searchQuery.trim())}`)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto mt-8 relative">
            <div className="relative flex items-center">
                <Search className="absolute left-4 w-6 h-6 text-gray-400 pointer-events-none z-10" />
                <input
                    type="text"
                    placeholder="O que você quer comer hoje?"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-32 py-4 rounded-full text-gray-900 bg-white focus:outline-none focus:ring-4 focus:ring-white/30 shadow-2xl text-lg placeholder:text-gray-400"
                />
                <Button
                    type="submit"
                    className="absolute right-2 rounded-full px-8"
                    size="lg"
                >
                    Buscar
                </Button>
            </div>
        </form>
    )
}
