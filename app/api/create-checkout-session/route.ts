import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import Stripe from "stripe"
import { NextResponse } from "next/server"
import { getSiteSettings } from "@/actions/admin"

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user || session.user.role !== "RESTAURANT") {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const body = await req.json()
        const { planId } = body

        if (!planId) {
            return new NextResponse("Plan ID required", { status: 400 })
        }

        const plan = await prisma.subscriptionPlan.findUnique({
            where: { id: planId }
        })

        if (!plan || !plan.isActive) {
            return new NextResponse("Plan not found or inactive", { status: 404 })
        }

        const restaurant = await prisma.restaurant.findUnique({
            where: { ownerId: session.user.id }
        })

        if (!restaurant) {
            return new NextResponse("Restaurant not found", { status: 404 })
        }

        const intervalMap: Record<string, { interval: "month" | "year", interval_count: number }> = {
            "MONTHLY": { interval: "month", interval_count: 1 },
            "QUARTERLY": { interval: "month", interval_count: 3 },
            "SEMIANNUAL": { interval: "month", interval_count: 6 },
            "ANNUAL": { interval: "year", interval_count: 1 }
        }

        const stripeInterval = intervalMap[plan.interval]

        // Check for valid Stripe Key from KEY or DB
        const settings = await getSiteSettings()
        const dbKey = settings?.isStripeSandbox
            ? settings.stripeTestSecretKey
            : settings?.stripeProdSecretKey

        const stripeKey = dbKey || process.env.STRIPE_SECRET_KEY

        const isMock = !stripeKey || stripeKey.includes("dummy") || stripeKey === ""

        if (isMock) {
            console.log("Mocking Stripe Checkout Session")
            const mockSessionId = `mock_session_${Date.now()}`
            const mockUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/restaurant/dashboard/subscription/success?session_id=${mockSessionId}&mock=true`

            return NextResponse.json({
                sessionId: mockSessionId,
                url: mockUrl,
                isMock: true
            })
        }

        const stripe = new Stripe(stripeKey!, {
            typescript: true,
        })

        const checkoutSession = await stripe.checkout.sessions.create({
            mode: "subscription",
            // ... existing stripe config

            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency: "BRL",
                        unit_amount: Math.round(Number(plan.price) * 100),
                        product_data: {
                            name: plan.name,
                            description: plan.description || undefined,
                        },
                        recurring: {
                            interval: stripeInterval.interval,
                            interval_count: stripeInterval.interval_count,
                        },
                    },
                    quantity: 1,
                },
            ],
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/restaurant/dashboard/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/plans`,
            client_reference_id: restaurant.id,
            metadata: {
                restaurantId: restaurant.id,
                planId: plan.id,
                userId: session.user.id,
            },
        })

        return NextResponse.json({ sessionId: checkoutSession.id, url: checkoutSession.url })
    } catch (error: any) {
        console.error("Stripe checkout error:", error)
        return new NextResponse(`Internal Error: ${error.message}`, { status: 500 })
    }
}
