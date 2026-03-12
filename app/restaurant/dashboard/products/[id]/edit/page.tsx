import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { redirect, notFound } from "next/navigation"
import EditProductForm from "./EditProductForm" // Client Component

interface EditProductPageProps {
    params: Promise<{ id: string }>
}

export default async function EditProductPage(props: EditProductPageProps) {
    const params = await props.params
    const session = await getServerSession(authOptions)

    if (!session?.user) {
        redirect("/auth/signin")
    }

    const product = await prisma.product.findUnique({
        where: { id: params.id },
        include: { restaurant: true },
    })

    if (!product) {
        notFound()
    }

    if (product.restaurant.ownerId !== session.user.id) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <h1 className="text-2xl font-bold text-red-600">Acesso Negado</h1>
                <p>Você não tem permissão para editar este produto.</p>
            </div>
        )
    }

    // Serializar dados para o Client Component
    const serializedProduct = {
        ...product,
        price: Number(product.price),
        discountPrice: product.discountPrice ? Number(product.discountPrice) : null,
        preparationTime: product.preparationTime || null,
        description: product.description || "",
        image: product.image || null,
    }

    return <EditProductForm product={serializedProduct} />
}
