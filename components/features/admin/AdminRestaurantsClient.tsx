"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Tabs,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Search, Store } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface Restaurant {
    id: string
    name: string
    logo: string | null
    isApproved: boolean
    isActive: boolean
    rejectedAt: string | null
    createdAt: string
    owner: {
        name: string | null
        email: string
    }
    category: {
        name: string
    }
    subscriptionPlan: {
        name: string
    } | null
}

interface AdminRestaurantsClientProps {
    restaurants: Restaurant[]
}

export default function AdminRestaurantsClient({ restaurants }: AdminRestaurantsClientProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "")

    const handleSearch = (term: string) => {
        setSearchTerm(term)
        const params = new URLSearchParams(window.location.search)
        if (term) params.set("search", term)
        else params.delete("search")
        router.push(`?${params.toString()}`)
    }

    const handleTabChange = (value: string) => {
        const params = new URLSearchParams(window.location.search)
        if (value === "all") params.delete("status")
        else params.set("status", value)
        router.push(`?${params.toString()}`)
    }

    const currentTab = searchParams.get("status") || "all"

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 w-full max-w-sm">
                    <div className="relative flex-1">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar restaurante..."
                            value={searchTerm}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                </div>
            </div>

            <Tabs value={currentTab} onValueChange={handleTabChange}>
                <TabsList>
                    <TabsTrigger value="all">Todos</TabsTrigger>
                    <TabsTrigger value="pending">Pendentes</TabsTrigger>
                    <TabsTrigger value="approved">Aprovados</TabsTrigger>
                    <TabsTrigger value="rejected">Rejeitados</TabsTrigger>
                </TabsList>
            </Tabs>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Restaurante</TableHead>
                            <TableHead>Proprietário</TableHead>
                            <TableHead>Categoria</TableHead>
                            <TableHead>Plano</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Cadastro</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {restaurants.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                                    Nenhum restaurante encontrado.
                                </TableCell>
                            </TableRow>
                        ) : (
                            restaurants.map((restaurant) => (
                                <TableRow key={restaurant.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                                                {restaurant.logo ? (
                                                    <img src={restaurant.logo} alt={restaurant.name} className="h-full w-full object-cover" />
                                                ) : (
                                                    <Store className="h-5 w-5 text-gray-400" />
                                                )}
                                            </div>
                                            <span className="font-medium">{restaurant.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="text-sm">{restaurant.owner.name}</span>
                                            <span className="text-xs text-muted-foreground">{restaurant.owner.email}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{restaurant.category.name}</TableCell>
                                    <TableCell>
                                        {restaurant.subscriptionPlan ? (
                                            <Badge variant="outline">{restaurant.subscriptionPlan.name}</Badge>
                                        ) : (
                                            <span className="text-muted-foreground text-sm">-</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {restaurant.rejectedAt ? (
                                            <Badge variant="destructive">Rejeitado</Badge>
                                        ) : !restaurant.isApproved ? (
                                            <Badge className="bg-yellow-600 hover:bg-yellow-700">Pendente</Badge>
                                        ) : restaurant.isActive ? (
                                            <Badge className="bg-green-600 hover:bg-green-700">Ativo</Badge>
                                        ) : (
                                            <Badge variant="secondary">Inativo</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {format(new Date(restaurant.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Abrir menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/admin/restaurants/${restaurant.id}`}>Ver Detalhes</Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                {!restaurant.isApproved && !restaurant.rejectedAt && (
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/admin/restaurants/${restaurant.id}`}>Analisar</Link>
                                                    </DropdownMenuItem>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
