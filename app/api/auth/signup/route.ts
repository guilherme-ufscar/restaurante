import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { name, email, password, role, restaurantName } = body

        if (!name || !email || !password) {
            return NextResponse.json(
                { error: "Dados incompletos" },
                { status: 400 }
            )
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: "Email inválido" },
                { status: 400 }
            )
        }

        if (password.length < 6) {
            return NextResponse.json(
                { error: "A senha deve ter no mínimo 6 caracteres" },
                { status: 400 }
            )
        }

        const existingUser = await prisma.user.findUnique({
            where: { email },
        })

        if (existingUser) {
            return NextResponse.json(
                { error: "Email já cadastrado" },
                { status: 400 }
            )
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        // Transação para garantir consistência
        const result = await prisma.$transaction(async (tx) => {
            // Criar usuário
            const user = await tx.user.create({
                data: {
                    name,
                    email,
                    password: hashedPassword,
                    role: role || "USER",
                    emailVerified: new Date(),
                },
            })

            // Se for restaurante, criar registro de restaurante
            if (role === "RESTAURANT") {
                const finalRestaurantName = restaurantName || `Restaurante de ${name}`

                // Gerar slug simples
                let slug = finalRestaurantName
                    .toLowerCase()
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "")
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/^-+|-+$/g, "")

                // Verificar se slug existe e adicionar sufixo se necessário
                const existingSlug = await tx.restaurant.findUnique({
                    where: { slug },
                })

                if (existingSlug) {
                    slug = `${slug}-${Date.now()}`
                }

                // Buscar categoria padrão ou criar
                let category = await tx.category.findFirst()
                if (!category) {
                    category = await tx.category.create({
                        data: {
                            name: "Outros",
                            slug: "outros",
                            image: "/images/categories/others.png",
                        },
                    })
                }

                await tx.restaurant.create({
                    data: {
                        name: finalRestaurantName,
                        slug,
                        email: email,
                        phone: "",
                        ownerId: user.id,
                        categoryId: category.id,
                        minOrderValue: 0,
                        deliveryFee: 0,
                        estimatedDeliveryTime: 30,
                        isActive: false,
                        isApproved: false,
                        subscriptionStatus: "PENDING",
                        opensAt: "08:00",
                        closesAt: "22:00",
                    },
                })
            }

            return user
        })

        return NextResponse.json(
            {
                success: true,
                user: {
                    id: result.id,
                    email: result.email,
                    name: result.name,
                    role: result.role,
                },
            },
            { status: 201 }
        )
    } catch (error) {
        console.error("Erro no cadastro:", error)
        return NextResponse.json(
            { error: "Erro interno ao criar conta" },
            { status: 500 }
        )
    }
}
