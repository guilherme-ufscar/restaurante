import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import Link from "next/link"
import {
    LayoutDashboard,
    Store,
    Tag,
    CreditCard,
    Crown,
    Users,
    ShoppingCart,
    LogOut
} from "lucide-react"
import { Button } from "@/components/ui/button"

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
        redirect("/auth/signin?redirect=/admin")
    }

    if (session.user.role !== "ADMIN") {
        redirect("/")
    }

    return (
        <div className="flex min-h-screen bg-gray-100">
            <aside className="w-64 bg-slate-900 text-white flex flex-col">
                <div className="p-6">
                    <Link href="/admin" className="flex items-center gap-2">
                        <div className="bg-orange-500 rounded-lg p-2">
                            <LayoutDashboard size={24} />
                        </div>
                        <h1 className="text-xl font-bold">Painel Admin</h1>
                    </Link>
                </div>

                <nav className="flex-1 px-3 py-6">
                    <div className="space-y-1">
                        <Link
                            href="/admin"
                            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors"
                        >
                            <LayoutDashboard size={20} />
                            Dashboard
                        </Link>
                        <Link
                            href="/admin/restaurants"
                            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors"
                        >
                            <Store size={20} />
                            Restaurantes
                        </Link>
                        <Link
                            href="/admin/categories"
                            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors"
                        >
                            <Tag size={20} />
                            Categorias
                        </Link>
                        <Link
                            href="/admin/payment-methods"
                            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors"
                        >
                            <CreditCard size={20} />
                            Métodos de Pagamento
                        </Link>
                        <Link
                            href="/admin/plans"
                            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors"
                        >
                            <Crown size={20} />
                            Planos
                        </Link>
                        <Link
                            href="/admin/users"
                            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors"
                        >
                            <Users size={20} />
                            Usuários
                        </Link>
                        <Link
                            href="/admin/orders"
                            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors"
                        >
                            <ShoppingCart size={20} />
                            Pedidos
                        </Link>
                    </div>
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                            {session.user.name?.[0] || "A"}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-medium truncate">{session.user.name}</p>
                            <p className="text-xs text-slate-400 truncate">{session.user.email}</p>
                        </div>
                    </div>
                    <form action="/api/auth/signout" method="POST">
                        <Button variant="destructive" className="w-full justify-start" type="submit">
                            <LogOut className="mr-2 h-4 w-4" />
                            Sair
                        </Button>
                    </form>
                </div>
            </aside>

            <div className="flex-1 flex flex-col">
                <header className="bg-white shadow-sm p-4 mb-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-gray-800">Área Administrativa</h2>
                        <Link href="/" className="text-sm text-blue-600 hover:underline">
                            Voltar para o site
                        </Link>
                    </div>
                </header>
                <main className="p-6 flex-1 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    )
}
