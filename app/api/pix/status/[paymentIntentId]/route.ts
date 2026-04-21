import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function GET(
    _req: Request,
    { params }: { params: { paymentIntentId: string } }
) {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const tx = await prisma.pixTransaction.findUnique({
        where: { stripePaymentIntentId: params.paymentIntentId },
        select: { status: true, paidAt: true },
    })

    if (!tx) {
        return NextResponse.json({ error: "Transação não encontrada" }, { status: 404 })
    }

    return NextResponse.json({ status: tx.status, paidAt: tx.paidAt })
}
