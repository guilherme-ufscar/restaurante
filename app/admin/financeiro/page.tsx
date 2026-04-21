import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import AdminFinanceiroClient from "@/components/features/admin/FinanceiroClient"

export default async function AdminFinanceiroPage() {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "ADMIN") redirect("/")

    const repayments = await prisma.pixRepayment.findMany({
        orderBy: [{ year: "desc" }, { month: "desc" }],
        include: {
            restaurant: { select: { id: true, name: true, email: true } },
            transactions: { select: { id: true } },
        },
    })

    const settings = await prisma.siteSettings.findFirst({
        select: { pixFeePerTransaction: true },
    })

    const totalPlatformRevenue = await prisma.pixTransaction.aggregate({
        where: { status: "PAID" },
        _sum: { platformFee: true },
    })

    return (
        <AdminFinanceiroClient
            repayments={repayments.map(r => ({
                ...r,
                grossAmount: Number(r.grossAmount),
                totalFees: Number(r.totalFees),
                netAmount: Number(r.netAmount),
                transactionsCount: r.transactions.length,
            }))}
            totalPlatformRevenue={Number(totalPlatformRevenue._sum.platformFee ?? 0)}
            pixFee={Number(settings?.pixFeePerTransaction ?? 1)}
        />
    )
}
