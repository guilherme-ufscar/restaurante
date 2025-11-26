"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { toast } from "react-hot-toast"

export interface CartItem {
    productId: string
    name: string
    description?: string
    image?: string
    price: number
    quantity: number
    restaurantId: string
    restaurantName: string
    restaurantSlug: string
    notes?: string
}

interface CartContextType {
    items: CartItem[]
    addToCart: (item: Omit<CartItem, "quantity">, quantity?: number) => void
    removeFromCart: (productId: string) => void
    updateQuantity: (productId: string, quantity: number) => void
    clearCart: () => void
    getTotal: () => number
    getItemsCount: () => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([])

    // Carregar do localStorage ao montar
    useEffect(() => {
        try {
            const saved = localStorage.getItem("cart")
            if (saved) {
                setItems(JSON.parse(saved))
            }
        } catch (error) {
            console.error("Erro ao carregar carrinho:", error)
        }
    }, [])

    // Salvar no localStorage quando items mudar
    useEffect(() => {
        if (items.length > 0) {
            localStorage.setItem("cart", JSON.stringify(items))
        } else {
            localStorage.removeItem("cart")
        }
    }, [items])

    const clearCart = () => {
        setItems([])
        toast.success("Carrinho limpo")
    }

    const addToCart = (item: Omit<CartItem, "quantity">, quantity = 1) => {
        // Verificar conflito de restaurantes
        if (items.length > 0 && items[0].restaurantId !== item.restaurantId) {
            if (window.confirm("Seu carrinho tem itens de outro restaurante. Deseja limpar o carrinho?")) {
                // Se confirmar, substitui o carrinho inteiro pelo novo item
                setItems([{ ...item, quantity }])
                toast.success("Novo pedido iniciado!")
                return
            } else {
                return
            }
        }

        const existingItem = items.find((i) => i.productId === item.productId)

        if (existingItem) {
            setItems(
                items.map((i) =>
                    i.productId === item.productId
                        ? { ...i, quantity: i.quantity + quantity }
                        : i
                )
            )
        } else {
            setItems([...items, { ...item, quantity }])
        }

        toast.success("Produto adicionado ao carrinho!")
    }

    const removeFromCart = (productId: string) => {
        setItems(items.filter((item) => item.productId !== productId))
        toast.success("Produto removido do carrinho")
    }

    const updateQuantity = (productId: string, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(productId)
            return
        }

        setItems(
            items.map((item) =>
                item.productId === productId ? { ...item, quantity } : item
            )
        )
    }

    const getTotal = () => {
        return items.reduce((acc, item) => acc + item.price * item.quantity, 0)
    }

    const getItemsCount = () => {
        return items.reduce((acc, item) => acc + item.quantity, 0)
    }

    const value = {
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotal,
        getItemsCount,
    }

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
    const context = useContext(CartContext)
    if (context === undefined) {
        throw new Error("useCart must be used within CartProvider")
    }
    return context
}
