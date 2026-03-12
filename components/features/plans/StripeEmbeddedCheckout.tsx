"use client"

import {
    EmbeddedCheckoutProvider,
    EmbeddedCheckout
} from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"

interface StripeEmbeddedCheckoutProps {
    clientSecret: string
    stripePublishableKey: string
}

export default function StripeEmbeddedCheckout({ clientSecret, stripePublishableKey }: StripeEmbeddedCheckoutProps) {
    const stripePromise = loadStripe(stripePublishableKey)

    return (
        <div className="min-h-[500px]">
            <EmbeddedCheckoutProvider
                stripe={stripePromise}
                options={{ clientSecret }}
            >
                <EmbeddedCheckout />
            </EmbeddedCheckoutProvider>
        </div>
    )
}
