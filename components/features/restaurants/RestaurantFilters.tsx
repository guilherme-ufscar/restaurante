"use client"

import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useState } from "react"

interface Category {
    id: string
    name: string
    slug: string
}

interface RestaurantFiltersProps {
    categories: Category[]
    searchParams: {
        query?: string
        category?: string
        sort?: string
    }
}

export default function RestaurantFilters({
    categories,
    searchParams,
}: RestaurantFiltersProps) {
    const [category, setCategory] = useState(searchParams.category || "")
    const [sort, setSort] = useState(searchParams.sort || "")

    return (
        <form method="GET" action="/restaurants" className="bg-white rounded-lg shadow-sm p-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Busca */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        name="query"
                        placeholder="Buscar restaurantes..."
                        className="pl-10"
                        defaultValue={searchParams.query}
                    />
                </div>

                {/* Categoria */}
                <div>
                    <Select
                        name="category"
                        value={category}
                        onValueChange={setCategory}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Todas as Categorias" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todas as Categorias</SelectItem>
                            {categories.map((cat) => (
                                <SelectItem key={cat.id} value={cat.slug}>
                                    {cat.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {/* Input hidden para enviar o valor no form GET */}
                    <input type="hidden" name="category" value={category === "all" ? "" : category} />
                </div>

                {/* Ordenação */}
                <div className="flex gap-2">
                    <div className="flex-1">
                        <Select
                            name="sort"
                            value={sort}
                            onValueChange={setSort}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Ordenar por" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="recent">Mais Recentes</SelectItem>
                                <SelectItem value="rating">Melhor Avaliados</SelectItem>
                                <SelectItem value="reviews">Mais Pedidos</SelectItem>
                                <SelectItem value="delivery">Menor Taxa Entrega</SelectItem>
                            </SelectContent>
                        </Select>
                        <input type="hidden" name="sort" value={sort} />
                    </div>

                    <Button type="submit">
                        Filtrar
                    </Button>
                </div>
            </div>
        </form>
    )
}
