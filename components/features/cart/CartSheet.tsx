"use client"

import { useCart } from "@/contexts/CartContext"
import { Button } from "@/components/ui/button"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Trash, Plus, Minus } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Separator } from "@/components/ui/separator"

export default function CartSheet() {
    const { items, removeFromCart, updateQuantity, getTotal, getItemsCount } = useCart()
    const itemCount = getItemsCount()
    const total = getTotal()

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <ShoppingCart className="h-5 w-5" />
                    {itemCount > 0 && (
                        <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center rounded-full bg-primary text-primary-foreground text-xs p-0">
                            {itemCount}
                        </Badge>
                    )}
                </Button>
            </SheetTrigger>
            <SheetContent className="flex flex-col w-full sm:max-w-md">
                <SheetHeader>
                    <SheetTitle>Seu Carrinho</SheetTitle>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto py-4">
                    {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                            <ShoppingCart className="h-16 w-16 text-muted-foreground opacity-20" />
                            <p className="text-muted-foreground">Seu carrinho está vazio</p>
                            <Button variant="outline" asChild onClick={() => document.getElementById("close-cart")?.click()}>
                                <Link href="/restaurants">Ver Restaurantes</Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="text-sm text-muted-foreground mb-4">
                                Pedido de <span className="font-semibold text-foreground">{items[0].restaurantName}</span>
                            </div>

                            {items.map((item) => (
                                <div key={item.productId} className="flex gap-4">
                                    {/* Imagem (opcional) */}
                                    {item.image && (
                                        <div className="relative h-16 w-16 rounded-md overflow-hidden flex-shrink-0">
                                            <Image
                                                src={item.image}
                                                alt={item.name}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                    )}

                                    <div className="flex-1">
                                        <h4 className="font-medium text-sm line-clamp-2">{item.name}</h4>
                                        <p className="text-sm font-bold text-primary mt-1">
                                            R$ {Number(item.price).toFixed(2)}
                                        </p>

                                        <div className="flex items-center justify-between mt-2">
                                            <div className="flex items-center gap-2 border rounded-md p-1">
                                                <button
                                                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                                    className="p-1 hover:bg-gray-100 rounded"
                                                    disabled={item.quantity <= 1}
                                                >
                                                    <Minus className="h-3 w-3" />
                                                </button>
                                                <span className="text-xs w-4 text-center">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                                    className="p-1 hover:bg-gray-100 rounded"
                                                >
                                                    <Plus className="h-3 w-3" />
                                                </button>
                                            </div>

                                            <button
                                                onClick={() => removeFromCart(item.productId)}
                                                className="text-red-500 hover:text-red-700 p-1"
                                            >
                                                <Trash className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {items.length > 0 && (
                    <div className="space-y-4 pt-4 border-t">
                        <div className="flex items-center justify-between font-bold text-lg">
                            <span>Total</span>
                            <span>R$ {total.toFixed(2)}</span>
                        </div>

                        <Button className="w-full" size="lg" asChild>
                            <Link href="/checkout">
                                Finalizar Pedido
                            </Link>
                        </Button>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    )
}
