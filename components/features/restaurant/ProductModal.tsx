"use client"

import { useState } from "react"
import Image from "next/image"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useCart } from "@/contexts/CartContext"
import { Minus, Plus, X, Clock, UtensilsCrossed } from "lucide-react"

interface ProductModalProps {
    isOpen: boolean
    onClose: () => void
    product: {
        id: string
        name: string
        description?: string | null
        image?: string | null
        price: number
        discountPrice?: number | null
        category: string
        preparationTime?: number | null
    } | null
    restaurant: {
        id: string
        name: string
        slug: string
    }
}

export default function ProductModal({
    isOpen,
    onClose,
    product,
    restaurant,
}: ProductModalProps) {
    const [quantity, setQuantity] = useState(1)
    const [notes, setNotes] = useState("")
    const { addToCart } = useCart()

    if (!product) return null

    const finalPrice = product.discountPrice || product.price

    const handleAddToCart = () => {
        addToCart(
            {
                productId: product.id,
                name: product.name,
                description: product.description || undefined,
                image: product.image || undefined,
                price: finalPrice,
                restaurantId: restaurant.id,
                restaurantName: restaurant.name,
                restaurantSlug: restaurant.slug,
                notes: notes || undefined,
            },
            quantity
        )
        handleClose()
    }

    const handleClose = () => {
        onClose()
        setQuantity(1)
        setNotes("")
    }

    const incrementQuantity = () => setQuantity((prev) => prev + 1)
    const decrementQuantity = () => setQuantity((prev) => Math.max(1, prev - 1))

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-4 right-4 rounded-full z-10"
                    onClick={handleClose}
                >
                    <X className="h-4 w-4" />
                </Button>

                <DialogHeader>
                    <DialogTitle className="text-2xl">{product.name}</DialogTitle>
                    <DialogDescription>{product.category}</DialogDescription>
                </DialogHeader>

                <div className="grid md:grid-cols-2 gap-6 mt-4">
                    {/* Imagem */}
                    <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                        {product.image ? (
                            <Image
                                src={product.image}
                                alt={product.name}
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <UtensilsCrossed className="h-20 w-20 text-gray-300" />
                            </div>
                        )}
                    </div>

                    {/* Informações */}
                    <div className="space-y-4">
                        {product.description && (
                            <p className="text-muted-foreground">{product.description}</p>
                        )}

                        {/* Preço */}
                        <div className="flex items-baseline gap-2">
                            {product.discountPrice ? (
                                <>
                                    <span className="text-3xl font-bold text-primary">
                                        R$ {product.discountPrice.toFixed(2)}
                                    </span>
                                    <span className="text-lg text-muted-foreground line-through">
                                        R$ {product.price.toFixed(2)}
                                    </span>
                                </>
                            ) : (
                                <span className="text-3xl font-bold">
                                    R$ {product.price.toFixed(2)}
                                </span>
                            )}
                        </div>

                        {product.preparationTime && (
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                Preparo: ~{product.preparationTime} min
                            </p>
                        )}

                        {/* Quantidade */}
                        <div className="space-y-2">
                            <Label>Quantidade</Label>
                            <div className="flex items-center gap-3">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={decrementQuantity}
                                    disabled={quantity === 1}
                                >
                                    <Minus className="h-4 w-4" />
                                </Button>
                                <span className="text-xl font-bold w-12 text-center">
                                    {quantity}
                                </span>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={incrementQuantity}
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Observações */}
                        <div className="space-y-2">
                            <Label htmlFor="notes">Observações (opcional)</Label>
                            <Textarea
                                id="notes"
                                placeholder="Ex: Sem cebola, bem passado..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows={3}
                            />
                        </div>

                        {/* Total e Botão */}
                        <div className="space-y-4 pt-4 border-t">
                            <div className="flex items-center justify-between text-lg">
                                <span>Subtotal</span>
                                <span className="text-2xl font-bold">
                                    R$ {(finalPrice * quantity).toFixed(2)}
                                </span>
                            </div>
                            <Button
                                className="w-full"
                                size="lg"
                                onClick={handleAddToCart}
                            >
                                Adicionar ao Carrinho - R$ {(finalPrice * quantity).toFixed(2)}
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
