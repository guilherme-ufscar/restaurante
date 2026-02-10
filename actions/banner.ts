"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getBanners(location: string = "HOME") {
    try {
        const banners = await prisma.banner.findMany({
            where: {
                location,
                active: true
            },
            orderBy: {
                createdAt: 'desc' // ou criar um campo 'order' depois se quiser ordenação manual
            }
        })
        return banners
    } catch (error) {
        console.error("Erro ao buscar banners:", error)
        return []
    }
}

export async function getAllBannersAdmin() {
    try {
        const banners = await prisma.banner.findMany({
            orderBy: {
                createdAt: 'desc'
            }
        })
        return banners
    } catch (error) {
        console.error("Erro ao buscar banners admin:", error)
        return []
    }
}

export async function createBanner(data: {
    image: string
    title?: string
    description?: string
    link?: string
    location: string
}) {
    try {
        await prisma.banner.create({
            data: {
                image: data.image,
                title: data.title,
                description: data.description,
                link: data.link,
                location: data.location,
                active: true
            }
        })
        revalidatePath("/")
        revalidatePath("/categories")
        revalidatePath("/admin/banners")
        return { success: true }
    } catch (error) {
        console.error("Erro ao criar banner:", error)
        return { success: false, error: "Erro ao criar banner" }
    }
}

export async function deleteBanner(id: string) {
    try {
        await prisma.banner.delete({
            where: { id }
        })
        revalidatePath("/")
        revalidatePath("/categories")
        revalidatePath("/admin/banners")
        return { success: true }
    } catch (error) {
        console.error("Erro ao deletar banner:", error)
        return { success: false, error: "Erro ao deletar banner" }
    }
}

export async function toggleBannerStatus(id: string, currentStatus: boolean) {
    try {
        await prisma.banner.update({
            where: { id },
            data: { active: !currentStatus }
        })
        revalidatePath("/")
        revalidatePath("/categories")
        revalidatePath("/admin/banners")
        return { success: true }
    } catch (error) {
        console.error("Erro ao alterar status:", error)
        return { success: false, error: "Erro ao alterar status" }
    }
}
