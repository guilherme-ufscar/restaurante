import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import PaymentMethodsClient from "@/components/features/admin/PaymentMethodsClient"

export default async function PaymentMethodsPage() {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== "ADMIN") {
        redirect("/")
    }

    const paymentMethods = await prisma.paymentMethod.findMany({
        include: {
            _count: {
                select: { restaurants: true }
            }
        },
        orderBy: { name: "asc" }
    })

    return <PaymentMethodsClient paymentMethods={paymentMethods} />
}
