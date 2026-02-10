"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "react-hot-toast"
import { loadStripe } from "@stripe/stripe-js"
import { useRouter } from "next/navigation"

interface PlanCheckoutButtonProps {
    planId: string
    isRestaurant: boolean
    stripePublishableKey?: string | null
}

export default function PlanCheckoutButton({ planId, isRestaurant, stripePublishableKey }: PlanCheckoutButtonProps) {
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const handleSubscribe = async () => {
        if (!isRestaurant) {
            router.push(`/auth/signup/restaurant?plan=${planId}`)
            return
        }

        setIsLoading(true)
        try {
            const response = await fetch("/api/create-checkout-session", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ planId }),
            })

            if (!response.ok) {
                const error = await response.text()
                throw new Error(error)
            }

            const data = await response.json()

            if (data.isMock && data.url) {
                window.location.href = data.url
                return
            }

            const { sessionId } = data
            const key = stripePublishableKey || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

            if (!key) {
                toast.error("Erro de configuração: Chave pública do Stripe não encontrada.")
                return
            }

            const stripe = await loadStripe(key)

            if (stripe) {
                await (stripe as any).redirectToCheckout({ sessionId })
            }
        } catch (error) {
            console.error("Checkout error:", error)
            toast.error("Erro ao iniciar checkout. Tente novamente.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Button
            className="w-full"
            size="lg"
            onClick={handleSubscribe}
            disabled={isLoading}
        >
            {isLoading ? "Processando..." : "Começar Agora"}
        </Button>
    )
}
