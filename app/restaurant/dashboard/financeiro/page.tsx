import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import RestaurantFinanceiroClient from "@/components/features/restaurant/FinanceiroClient"

export default async function FinanceiroPage() {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "RESTAURANT") redirect("/")

    const restaurant = await prisma.restaurant.findUnique({
        where: { ownerId: session.user.id },
        select: { id: true },
    })
    if (!restaurant) redirect("/")

    const repayments = await prisma.pixRepayment.findMany({
        where: { restaurantId: restaurant.id },
        orderBy: [{ year: "desc" }, { month: "desc" }],
        include: {
            transactions: {
                select: { id: true, amount: true, platformFee: true, netAmount: true, status: true, paidAt: true, createdAt: true },
            },
        },
    })

    const settings = await prisma.siteSettings.findFirst({
        select: { footerEmail: true, footerPhone: true, pixFeePerTransaction: true },
    })

    return (
        <RestaurantFinanceiroClient
            repayments={repayments.map(r => ({
                ...r,
                grossAmount: Number(r.grossAmount),
                totalFees: Number(r.totalFees),
                netAmount: Number(r.netAmount),
                transactions: r.transactions.map(t => ({
                    ...t,
                    amount: Number(t.amount),
                    platformFee: Number(t.platformFee),
                    netAmount: Number(t.netAmount),
                })),
            }))}
            contactEmail={settings?.footerEmail ?? null}
            contactPhone={settings?.footerPhone ?? null}
            pixFee={Number(settings?.pixFeePerTransaction ?? 1)}
        />
    )
}
