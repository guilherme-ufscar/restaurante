import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import SiteSettingsClient from "@/components/features/admin/SiteSettingsClient"

export default async function SettingsPage() {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
        redirect("/")
    }

    const settings = await prisma.siteSettings.findFirst()

    return (
        <div className="container mx-auto py-10">
            <SiteSettingsClient initialSettings={settings} />
        </div>
    )
}
