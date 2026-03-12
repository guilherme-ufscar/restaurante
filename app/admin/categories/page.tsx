import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import CategoriesClient from "@/components/features/admin/CategoriesClient"

export default async function CategoriesPage() {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== "ADMIN") {
        redirect("/")
    }

    const categories = await prisma.category.findMany({
        include: {
            _count: {
                select: {
                    restaurants: {
                        where: { isActive: true, isApproved: true }
                    }
                }
            }
        },
        orderBy: { name: "asc" }
    })

    return <CategoriesClient categories={categories} />
}
