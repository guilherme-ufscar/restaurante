import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import UsersClient from "@/components/features/admin/UsersClient"

export default async function UsersPage({
    searchParams
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== "ADMIN") {
        redirect("/")
    }

    const resolvedSearchParams = await searchParams
    const page = typeof resolvedSearchParams.page === "string" ? parseInt(resolvedSearchParams.page) : 1
    const search = typeof resolvedSearchParams.search === "string" ? resolvedSearchParams.search : undefined
    const role = typeof resolvedSearchParams.role === "string" ? resolvedSearchParams.role : undefined

    const perPage = 20
    const skip = (page - 1) * perPage

    const where: any = {}

    if (search) {
        where.OR = [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } }
        ]
    }

    if (role && ["USER", "RESTAURANT", "ADMIN"].includes(role)) {
        where.role = role
    }

    const users = await prisma.user.findMany({
        where,
        take: perPage,
        skip,
        orderBy: { createdAt: "desc" },
        select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true,
            createdAt: true
        }
    })

    const totalUsers = await prisma.user.count({ where })
    const totalPages = Math.ceil(totalUsers / perPage)

    return (
        <UsersClient
            users={users}
            totalPages={totalPages}
            currentPage={page}
            totalUsers={totalUsers}
        />
    )
}
