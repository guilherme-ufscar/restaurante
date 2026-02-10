import { headers } from "next/headers"
import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"
import Stripe from "stripe"
import { addMonths, addYears } from "date-fns"

export async function POST(req: Request) {
    const body = await req.text()
    const signature = (await headers()).get("Stripe-Signature") as string

    let event: Stripe.Event

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        )
    } catch (error: any) {
        console.error("Webhook signature verification failed:", error.message)
        return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 })
    }

    try {
        switch (event.type) {
            case "checkout.session.completed": {
                const session = event.data.object as Stripe.Checkout.Session

                // Retrieve metadata
                const restaurantId = session.metadata?.restaurantId
                const planId = session.metadata?.planId

                if (restaurantId && planId) {
                    const plan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } })

                    if (plan) {
                        let expiresAt = new Date()
                        if (plan.interval === "MONTHLY") expiresAt = addMonths(expiresAt, 1)
                        else if (plan.interval === "QUARTERLY") expiresAt = addMonths(expiresAt, 3)
                        else if (plan.interval === "SEMIANNUAL") expiresAt = addMonths(expiresAt, 6)
                        else if (plan.interval === "ANNUAL") expiresAt = addYears(expiresAt, 1)

                        await prisma.restaurant.update({
                            where: { id: restaurantId },
                            data: {
                                subscriptionPlanId: planId,
                                subscriptionStatus: "ACTIVE",
                                subscriptionExpiresAt: expiresAt,
                                isActive: true // Reativar restaurante se estiver inativo
                            }
                        })
                        console.log(`Subscription activated for restaurant ${restaurantId}`)
                        // Estender a data de expiração
                        // Assumindo que o plano não mudou, pegamos o intervalo atual
                        const restaurant = await prisma.restaurant.findUnique({ where: { id: restaurantId }, include: { subscriptionPlan: true } })

                        if (restaurant && restaurant.subscriptionPlan) {
                            let expiresAt = restaurant.subscriptionExpiresAt || new Date()
                            // Se já expirou, começa de agora. Se não, adiciona ao final.
                            if (expiresAt < new Date()) expiresAt = new Date()

                            const plan = restaurant.subscriptionPlan
                            if (plan.interval === "MONTHLY") expiresAt = addMonths(expiresAt, 1)
                            else if (plan.interval === "QUARTERLY") expiresAt = addMonths(expiresAt, 3)
                            else if (plan.interval === "SEMIANNUAL") expiresAt = addMonths(expiresAt, 6)
                            else if (plan.interval === "ANNUAL") expiresAt = addYears(expiresAt, 1)

                            await prisma.restaurant.update({
                                where: { id: restaurantId },
                                data: {
                                    subscriptionStatus: "ACTIVE",
                                    subscriptionExpiresAt: expiresAt
                                }
                            })
                            console.log(`Subscription renewed for restaurant ${restaurantId}`)
                        }
                    }
                    break
                }
                break
            }

            case "invoice.payment_failed": {
                const invoice = event.data.object as any
                const subscriptionId = invoice.subscription as string
                const subscription = await stripe.subscriptions.retrieve(subscriptionId)
                const restaurantId = subscription.metadata?.restaurantId

                if (restaurantId) {
                    await prisma.restaurant.update({
                        where: { id: restaurantId },
                        data: {
                            subscriptionStatus: "PAYMENT_FAILED" as any
                        }
                    })
                    // TODO: Enviar email notificando falha
                    console.log(`Subscription payment failed for restaurant ${restaurantId}`)
                }
                break
            }

            case "customer.subscription.deleted": {
                const subscription = event.data.object as Stripe.Subscription
                const restaurantId = subscription.metadata?.restaurantId

                if (restaurantId) {
                    await prisma.restaurant.update({
                        where: { id: restaurantId },
                        data: {
                            subscriptionStatus: "CANCELLED",
                            isActive: false // Desativar restaurante? Ou esperar expirar?
                            // Geralmente cancelamento imediato no Stripe significa fim do acesso.
                        }
                    })
                    console.log(`Subscription cancelled for restaurant ${restaurantId}`)
                }
                break
            }
        }
    } catch (error: any) {
        console.error("Error processing webhook:", error)
        // Não retornar erro 500 para o Stripe não ficar tentando reenviar se for erro de lógica nossa
        return new NextResponse("Webhook Handler Error", { status: 200 })
    }

    return new NextResponse(null, { status: 200 })
}
