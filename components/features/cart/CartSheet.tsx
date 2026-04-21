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
import { ShoppingCart, Trash, Plus, Minus, Store } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Separator } from "@/components/ui/separator"

export default function CartSheet() {
    const { items, removeFromCart, updateQuantity, getTotal, clearCart } = useCart()
    const itemCount = items.reduce((acc, item) => acc + item.quantity, 0)
    const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0)
    const deliveryFee = 5.00 // Ou pegar do restaurante
    const total = subtotal + deliveryFee

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
            <SheetContent className="w-full sm:max-w-lg flex flex-col p-0">
                {/* Header Fixo */}
                <SheetHeader className="px-6 py-4 border-b bg-white">
                    <div className="flex items-center justify-between">
                        <SheetTitle className="text-2xl font-bold">Seu Carrinho</SheetTitle>
                    </div>
                    {items.length > 0 && (
                        <p className="text-sm text-gray-500 mt-1">
                            {items.length} {items.length === 1 ? 'item' : 'itens'}
                        </p>
                    )}
                </SheetHeader>

                {/* Conteúdo Scrollável */}
                <div className="flex-1 overflow-y-auto px-6 py-4">
                    {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center py-12">
                            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                <ShoppingCart className="w-12 h-12 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Seu carrinho está vazio
                            </h3>
                            <p className="text-gray-500 mb-6">
                                Adicione produtos para começar seu pedido
                            </p>
                            <Button asChild>
                                <Link href="/">Explorar Restaurantes</Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Informações do Restaurante */}
                            {items[0]?.restaurantName && (
                                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                                    <p className="text-sm font-medium text-orange-900">
                                        Pedido de: <span className="font-bold">{items[0].restaurantName}</span>
                                    </p>
                                </div>
                            )}

                            {/* Lista de Itens */}
                            {items.map((item) => (
                                <div key={item.productId} className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
                                    <div className="flex gap-4">
                                        {/* Imagem do Produto */}
                                        {item.image ? (
                                            <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                                                <Image
                                                    src={item.image}
                                                    alt={item.name}
                                                    width={80}
                                                    height={80}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        ) : (
                                            <div className="w-20 h-20 flex-shrink-0 rounded-lg bg-gray-100 flex items-center justify-center">
                                                <Store className="w-8 h-8 text-gray-400" />
                                            </div>
                                        )}

                                        {/* Detalhes do Produto */}
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-semibold text-gray-900 mb-1 truncate">
                                                {item.name}
                                            </h4>

                                            {item.notes && (
                                                <p className="text-xs text-gray-500 mb-2 line-clamp-2">
                                                    Obs: {item.notes}
                                                </p>
                                            )}

                                            <div className="flex items-center justify-between mt-2">
                                                {/* Controles de Quantidade */}
                                                <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7"
                                                        onClick={() => {
                                                            if (item.quantity === 1) {
                                                                removeFromCart(item.productId)
                                                            } else {
                                                                updateQuantity(item.productId, item.quantity - 1)
                                                            }
                                                        }}
                                                    >
                                                        {item.quantity === 1 ? (
                                                            <Trash className="w-4 h-4 text-red-500" />
                                                        ) : (
                                                            <Minus className="w-4 h-4" />
                                                        )}
                                                    </Button>

                                                    <span className="font-semibold text-sm w-8 text-center">
                                                        {item.quantity}
                                                    </span>

                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7"
                                                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                    </Button>
                                                </div>

                                                {/* Preço */}
                                                <p className="font-bold text-primary">
                                                    {new Intl.NumberFormat('pt-BR', {
                                                        style: 'currency',
                                                        currency: 'BRL'
                                                    }).format(item.price * item.quantity)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Botão Limpar Carrinho */}
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full"
                                onClick={clearCart}
                            >
                                <Trash className="w-4 h-4 mr-2" />
                                Limpar Carrinho
                            </Button>
                        </div>
                    )}
                </div>

                {/* Footer Fixo com Totais e Checkout */}
                {items.length > 0 && (
                    <div className="border-t bg-white px-6 py-4 space-y-4">
                        {/* Resumo de Valores */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Subtotal</span>
                                <span className="font-medium">
                                    {new Intl.NumberFormat('pt-BR', {
                                        style: 'currency',
                                        currency: 'BRL'
                                    }).format(subtotal)}
                                </span>
                            </div>

                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Taxa de entrega</span>
                                <span className="font-medium">
                                    {new Intl.NumberFormat('pt-BR', {
                                        style: 'currency',
                                        currency: 'BRL'
                                    }).format(deliveryFee)}
                                </span>
                            </div>

                            <Separator className="my-3" />

                            <div className="flex justify-between text-lg font-bold">
                                <span>Total</span>
                                <span className="text-primary">
                                    {new Intl.NumberFormat('pt-BR', {
                                        style: 'currency',
                                        currency: 'BRL'
                                    }).format(total)}
                                </span>
                            </div>
                        </div>

                        {/* Botão de Finalizar Pedido */}
                        <Button
                            className="w-full h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-shadow"
                            size="lg"
                            asChild
                        >
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
