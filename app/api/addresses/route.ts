import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await request.json()
        const { street, number, complement, neighborhood, city, state, zipCode } = body

        if (!street || !number || !neighborhood || !city || !state || !zipCode) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 })
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        })

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        const address = await prisma.address.create({
            data: {
                street,
                number,
                complement,
                neighborhood,
                city,
                state,
                zipCode,
                userId: user.id,
            },
        })

        return NextResponse.json(address)
    } catch (error) {
        console.error("Error creating address:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
