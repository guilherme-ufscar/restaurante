import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Plus, UtensilsCrossed, Edit, Trash2, Copy, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Image from "next/image"
import ProductActions from "./ProductActions" // Client Component para ações interativas

export default async function ProductsPage() {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
        redirect("/auth/signin")
    }

    const restaurant = await prisma.restaurant.findUnique({
        where: { ownerId: session.user.id },
    })

    if (!restaurant) {
        redirect("/restaurant/new")
    }

    const products = await prisma.product.findMany({
        where: { restaurantId: restaurant.id },
        orderBy: [
            { category: "asc" },
            { name: "asc" },
        ],
    })

    // Serialização
    const serializedProducts = products.map(p => ({
        ...p,
        price: Number(p.price),
        discountPrice: p.discountPrice ? Number(p.discountPrice) : null,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
    }))

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Meus Produtos</h2>
                    <p className="text-muted-foreground">
                        Gerencie o cardápio do seu restaurante ({products.length} produtos)
                    </p>
                </div>
                <Button asChild>
                    <Link href="/restaurant/dashboard/products/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Adicionar Novo Produto
                    </Link>
                </Button>
            </div>

            {products.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[400px] border-2 border-dashed rounded-lg bg-gray-50">
                    <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                        <UtensilsCrossed className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">Nenhum produto cadastrado</h3>
                    <p className="text-muted-foreground mb-6">Comece adicionando itens ao seu cardápio.</p>
                    <Button asChild>
                        <Link href="/restaurant/dashboard/products/new">Cadastrar Primeiro Produto</Link>
                    </Button>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {serializedProducts.map((product) => (
                        <Card key={product.id} className="overflow-hidden flex flex-col">
                            <div className="relative h-48 w-full bg-gray-100">
                                {product.image ? (
                                    <Image
                                        src={product.image}
                                        alt={product.name}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full">
                                        <UtensilsCrossed className="h-12 w-12 text-gray-300" />
                                    </div>
                                )}
                                <div className="absolute top-2 right-2">
                                    <Badge variant={product.isAvailable ? "default" : "destructive"}>
                                        {product.isAvailable ? "Disponível" : "Indisponível"}
                                    </Badge>
                                </div>
                            </div>
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <Badge variant="outline" className="mb-2">{product.category}</Badge>
                                        <CardTitle className="text-lg line-clamp-1">{product.name}</CardTitle>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-1 flex flex-col justify-end">
                                <div className="flex items-baseline gap-2 mb-4">
                                    {product.discountPrice ? (
                                        <>
                                            <span className="text-lg font-bold text-green-600">
                                                R$ {product.discountPrice.toFixed(2)}
                                            </span>
                                            <span className="text-sm text-muted-foreground line-through">
                                                R$ {product.price.toFixed(2)}
                                            </span>
                                        </>
                                    ) : (
                                        <span className="text-lg font-bold">
                                            R$ {product.price.toFixed(2)}
                                        </span>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" className="flex-1" asChild>
                                        <Link href={`/restaurant/dashboard/products/${product.id}/edit`}>
                                            <Edit className="h-4 w-4 mr-2" />
                                            Editar
                                        </Link>
                                    </Button>
                                    <ProductActions product={product} />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
