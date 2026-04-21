import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import PlansClient from "@/components/features/admin/PlansClient"

export default async function PlansPage() {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== "ADMIN") {
        redirect("/")
    }

    const plans = await prisma.subscriptionPlan.findMany({
        include: {
            _count: {
                select: {
                    restaurants: {
                        where: { subscriptionStatus: "ACTIVE" }
                    }
                }
            }
        },
        orderBy: { price: "asc" }
    })

    // Serialize Decimal to number
    const serializedPlans = plans.map(p => ({
        ...p,
        price: Number(p.price)
    }))

    return <PlansClient plans={serializedPlans} />
}
