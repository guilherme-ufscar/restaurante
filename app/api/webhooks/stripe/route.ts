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
                    const restaurant = await prisma.restaurant.findUnique({ where: { id: restaurantId } })

                    if (plan && restaurant) {
                        let expiresAt = restaurant.subscriptionExpiresAt || new Date()
                        // Se já expirou ou nunca teve, começa de agora. Se não, adiciona ao final.
                        if (expiresAt < new Date()) expiresAt = new Date()

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
                    }
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
                            isActive: false
                        }
                    })
                    console.log(`Subscription cancelled for restaurant ${restaurantId}`)
                }
                break
            }

            case "payment_intent.succeeded": {
                const paymentIntent = event.data.object as Stripe.PaymentIntent
                const orderId = paymentIntent.metadata?.orderId
                const restaurantId = paymentIntent.metadata?.restaurantId

                if (!orderId || !restaurantId) break

                const tx = await prisma.pixTransaction.findUnique({
                    where: { stripePaymentIntentId: paymentIntent.id },
                })

                if (!tx || tx.status === "PAID") break

                const now = new Date()

                await prisma.$transaction(async (trx) => {
                    await trx.pixTransaction.update({
                        where: { id: tx.id },
                        data: { status: "PAID", paidAt: now },
                    })

                    await trx.order.update({
                        where: { id: orderId },
                        data: { paymentStatus: "PAID" },
                    })

                    const month = now.getMonth() + 1
                    const year = now.getFullYear()

                    const existing = await trx.pixRepayment.findUnique({
                        where: { restaurantId_month_year: { restaurantId, month, year } },
                    })

                    if (existing) {
                        await trx.pixRepayment.update({
                            where: { id: existing.id },
                            data: {
                                grossAmount: { increment: tx.amount },
                                totalFees: { increment: tx.platformFee },
                                netAmount: { increment: tx.netAmount },
                                transactions: { connect: { id: tx.id } },
                            },
                        })
                    } else {
                        await trx.pixRepayment.create({
                            data: {
                                restaurantId,
                                month,
                                year,
                                grossAmount: tx.amount,
                                totalFees: tx.platformFee,
                                netAmount: tx.netAmount,
                                transactions: { connect: { id: tx.id } },
                            },
                        })
                    }
                })

                console.log(`PIX confirmed for order ${orderId}`)
                break
            }

            case "payment_intent.payment_failed": {
                const paymentIntent = event.data.object as Stripe.PaymentIntent
                const tx = await prisma.pixTransaction.findUnique({
                    where: { stripePaymentIntentId: paymentIntent.id },
                })
                if (tx) {
                    await prisma.pixTransaction.update({
                        where: { id: tx.id },
                        data: { status: "FAILED" },
                    })
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
