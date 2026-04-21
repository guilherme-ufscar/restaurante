"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "react-hot-toast"
import { useRouter } from "next/navigation"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import StripeEmbeddedCheckout from "./StripeEmbeddedCheckout"

interface PlanCheckoutButtonProps {
    planId: string
    isRestaurant: boolean
    stripePublishableKey?: string | null
}

export default function PlanCheckoutButton({ planId, isRestaurant, stripePublishableKey }: PlanCheckoutButtonProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [showCheckout, setShowCheckout] = useState(false)
    const [clientSecret, setClientSecret] = useState<string | null>(null)
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

            if (data.isMock) {
                if (data.url) {
                    window.location.href = data.url
                    return
                }
            }

            if (data.clientSecret) {
                setClientSecret(data.clientSecret)
                setShowCheckout(true)
            } else {
                throw new Error("No client secret returned from Stripe")
            }
        } catch (error) {
            console.error("Checkout error:", error)
            toast.error("Erro ao iniciar checkout. Tente novamente.")
        } finally {
            setIsLoading(false)
        }
    }

    const key = stripePublishableKey || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

    return (
        <>
            <Button
                className="w-full"
                size="lg"
                onClick={handleSubscribe}
                disabled={isLoading}
            >
                {isLoading ? "Processando..." : "Começar Agora"}
            </Button>

            <Dialog open={showCheckout} onOpenChange={setShowCheckout}>
                <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Finalizar Assinatura</DialogTitle>
                    </DialogHeader>
                    {clientSecret && key ? (
                        <StripeEmbeddedCheckout
                            clientSecret={clientSecret}
                            stripePublishableKey={key}
                        />
                    ) : (
                        <div className="flex items-center justify-center p-8">
                            <p>Carregando checkout...</p>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    )
}
