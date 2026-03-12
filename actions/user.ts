
"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"
import { z } from "zod"

const updateProfileSchema = z.object({
    name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
    email: z.string().email("Email inválido"),
    currentPassword: z.string().optional(),
    newPassword: z.string().min(6, "Nova senha deve ter pelo menos 6 caracteres").optional(),
})

export async function updateUserProfile(data: z.infer<typeof updateProfileSchema>) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return { success: false, message: "Acesso negado" }
        }

        const validatedData = updateProfileSchema.parse(data)

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
        })

        if (!user) {
            return { success: false, message: "Usuário não encontrado" }
        }

        const updateData: any = {
            name: validatedData.name,
            email: validatedData.email,
        }

        // Handle password change if requested
        if (validatedData.newPassword) {
            if (!validatedData.currentPassword) {
                return { success: false, message: "Senha atual é obrigatória para definir uma nova senha" }
            }

            if (!user.password) {
                return { success: false, message: "Este usuário não possui senha definida" }
            }

            // Verify current password
            const isPasswordValid = await bcrypt.compare(validatedData.currentPassword, user.password)
            if (!isPasswordValid) {
                return { success: false, message: "Senha atual incorreta" }
            }

            // Hash new password
            updateData.password = await bcrypt.hash(validatedData.newPassword, 10)
        }

        await prisma.user.update({
            where: { id: session.user.id },
            data: updateData,
        })

        revalidatePath("/profile")
        return { success: true }

    } catch (error: any) {
        console.error("Erro ao atualizar perfil:", error)
        if (error instanceof z.ZodError) {
            return { success: false, message: error.issues[0].message }
        }
        return { success: false, message: "Erro ao atualizar perfil" }
    }
}

export async function upgradeToRestaurant() {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return { success: false, message: "Não autorizado" }
        }

        await prisma.user.update({
            where: { id: session.user.id },
            data: { role: "RESTAURANT" }
        })

        return { success: true }
    } catch (error) {
        console.error("Erro ao fazer upgrade para restaurante:", error)
        return { success: false, message: "Erro ao processar solicitação" }
    }
}
