
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import Container from "@/components/layout/Container"
import ProfileForm from "@/components/features/profile/ProfileForm"
import ProfileAddresses from "@/components/features/profile/ProfileAddresses"
import { prisma } from "@/lib/prisma"

export const metadata = {
    title: "Meu Perfil | DeliveryApp",
    description: "Gerencie suas informações pessoais.",
}

export default async function ProfilePage() {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
        redirect("/auth/signin")
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
    })

    if (!user) {
        redirect("/auth/signin")
    }

    return (
        <div className="py-12">
            <Container>
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold mb-8">Meu Perfil</h1>
                    <div className="bg-white p-8 rounded-lg shadow-sm border">
                        <ProfileForm
                            user={{
                                name: user.name || "",
                                email: user.email || "",
                                image: user.image || undefined
                            }}
                        />

                        <div className="mt-12 pt-8 border-t">
                            <ProfileAddresses />
                        </div>
                    </div>
                </div>
            </Container>
        </div>
    )
}
