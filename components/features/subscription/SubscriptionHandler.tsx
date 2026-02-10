
"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { loadStripe } from "@stripe/stripe-js"
import { toast } from "react-hot-toast"

export default function SubscriptionHandler() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const checkoutPlanId = searchParams.get("checkout_plan")
    const [processed, setProcessed] = useState(false)

    useEffect(() => {
        const handleAutoCheckout = async () => {
            if (checkoutPlanId && !processed) {
                setProcessed(true) // Prevent double execution
                toast.loading("Iniciando checkout...", { id: "checkout-loading" })

                try {
                    const response = await fetch("/api/create-checkout-session", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ planId: checkoutPlanId }),
                    })

                    if (!response.ok) {
                        const error = await response.text()
                        throw new Error(error)
                    }

                    const { sessionId } = await response.json()
                    const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

                    if (stripe) {
                        await (stripe as any).redirectToCheckout({ sessionId })
                    }
                } catch (error) {
                    console.error("Auto checkout error:", error)
                    toast.error("Erro ao iniciar checkout.", { id: "checkout-loading" })
                }
            }
        }

        handleAutoCheckout()
    }, [checkoutPlanId, processed])

    return null
}
