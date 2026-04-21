import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import Stripe from "stripe"

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { orderId, amount, restaurantId } = await req.json()

    if (!orderId || !amount || !restaurantId) {
        return NextResponse.json({ error: "Parâmetros inválidos" }, { status: 400 })
    }

    const settings = await prisma.siteSettings.findFirst()
    const secretKey = settings?.isStripeSandbox
        ? settings?.stripeTestSecretKey
        : settings?.stripeProdSecretKey

    if (!secretKey) {
        return NextResponse.json({ error: "Stripe não configurado" }, { status: 500 })
    }

    const stripe = new Stripe(secretKey, { typescript: true })
    const fee = Number(settings?.pixFeePerTransaction ?? 1)

    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // em centavos
            currency: "brl",
            payment_method_types: ["pix"],
            payment_method_data: { type: "pix" },
            confirm: true,
            pix: { expires_after_seconds: 3600 },
            metadata: {
                orderId,
                restaurantId,
                userId: session.user.id,
                platformFee: fee.toFixed(2),
            },
        })

        const pixData = (paymentIntent.next_action as any)?.pix_display_qr_code
        const pixCode: string = pixData?.data ?? ""
        const qrCodeUrl: string = pixData?.image_url_png ?? ""
        const expiresAt = pixData?.expires_at
            ? new Date(pixData.expires_at * 1000)
            : new Date(Date.now() + 3600 * 1000)

        await prisma.pixTransaction.create({
            data: {
                orderId,
                restaurantId,
                stripePaymentIntentId: paymentIntent.id,
                amount,
                platformFee: fee,
                netAmount: amount - fee,
                pixCode,
                qrCodeUrl,
                expiresAt,
                status: "PENDING",
            },
        })

        return NextResponse.json({
            paymentIntentId: paymentIntent.id,
            pixCode,
            qrCodeUrl,
            expiresAt: expiresAt.toISOString(),
        })
    } catch (err: any) {
        console.error("Erro ao criar PIX:", err)
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
