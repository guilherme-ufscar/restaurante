import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import {
    LayoutDashboard,
    UtensilsCrossed,
    ShoppingCart,
    Star,
    CreditCard,
    Settings,
    LogOut,
    Store,
    Menu,
    Crown
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import SidebarNav from "./SidebarNav" // Client Component para navegação ativa
import GlobalOrderAlert from "@/components/features/restaurant/GlobalOrderAlert"

export default async function RestaurantDashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
        redirect("/auth/signin?callbackUrl=/restaurant/dashboard")
    }

    if (session.user.role !== "RESTAURANT") {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-4">
                <h1 className="text-2xl font-bold text-red-600">Acesso Negado</h1>
                <p>Esta área é restrita para parceiros restaurantes.</p>
                <Button asChild>
                    <Link href="/">Voltar para Home</Link>
                </Button>
            </div>
        )
    }

    const restaurant = await prisma.restaurant.findUnique({
        where: { ownerId: session.user.id },
        include: { subscriptionPlan: true },
    })

    if (!restaurant) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-4">
                <h1 className="text-2xl font-bold">Restaurante não encontrado</h1>
                <p>Parece que você ainda não completou o cadastro do seu restaurante.</p>
                <Button asChild>
                    <Link href="/restaurant/new">Cadastrar Restaurante</Link>
                </Button>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex bg-gray-100">
            {/* Sidebar */}
            <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-white fixed h-full z-10">
                <div className="p-6 flex flex-col items-center border-b border-slate-800">
                    <div className="h-16 w-16 rounded-full bg-white/10 flex items-center justify-center mb-3 overflow-hidden">
                        {restaurant.logo ? (
                            <img src={restaurant.logo} alt={restaurant.name} className="h-full w-full object-cover" />
                        ) : (
                            <Store className="h-8 w-8 text-slate-400" />
                        )}
                    </div>
                    <h2 className="font-bold text-lg truncate w-full text-center">{restaurant.name}</h2>
                    <div className="mt-2">
                        {restaurant.subscriptionStatus === "ACTIVE" && (
                            <Badge className="bg-green-600 hover:bg-green-700">Assinatura Ativa</Badge>
                        )}
                        {restaurant.subscriptionStatus === "PENDING" && (
                            <Badge className="bg-yellow-600 hover:bg-yellow-700">Pendente</Badge>
                        )}
                        {(restaurant.subscriptionStatus === "EXPIRED" || restaurant.subscriptionStatus === "CANCELLED") && (
                            <Badge className="bg-red-600 hover:bg-red-700">Expirada</Badge>
                        )}
                    </div>
                </div>

                <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
                    <SidebarNav />
                </div>

                <div className="p-4 border-t border-slate-800">
                    <Button variant="ghost" className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-900/20" asChild>
                        <Link href="/api/auth/signout">
                            <LogOut className="mr-2 h-4 w-4" />
                            Sair
                        </Link>
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
                <GlobalOrderAlert restaurantId={restaurant.id} />
                {/* Header */}
                <header className="bg-white shadow-sm h-16 flex items-center justify-between px-6 sticky top-0 z-20">
                    <div className="flex items-center gap-4">
                        <div className="md:hidden">
                            {/* Mobile Menu Trigger could go here */}
                            <Button variant="ghost" size="icon">
                                <Menu className="h-6 w-6" />
                            </Button>
                        </div>
                        <h1 className="text-xl font-semibold text-gray-800">Painel do Parceiro</h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                                    <Avatar>
                                        <AvatarImage src={session.user.image || ""} alt={session.user.name || ""} />
                                        <AvatarFallback>{session.user.name?.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end" forceMount>
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none">{session.user.name}</p>
                                        <p className="text-xs leading-none text-muted-foreground">
                                            {session.user.email}
                                        </p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href="/restaurant/dashboard/settings">Configurações</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600" asChild>
                                    <Link href="/api/auth/signout">Sair</Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-6 overflow-x-hidden">
                    {!restaurant.isApproved && (
                        <Alert className="mb-6 bg-yellow-50 border-yellow-200 text-yellow-800">
                            <AlertTitle className="font-bold">Aprovação Pendente</AlertTitle>
                            <AlertDescription>
                                Seu restaurante está em análise. Algumas funcionalidades podem estar limitadas até a aprovação final do administrador.
                            </AlertDescription>
                        </Alert>
                    )}

                    {restaurant.subscriptionStatus === "EXPIRED" && (
                        <Alert className="mb-6 bg-red-50 border-red-200 text-red-800" variant="destructive">
                            <AlertTitle className="font-bold">Assinatura Expirada</AlertTitle>
                            <AlertDescription className="flex items-center justify-between">
                                <span>Sua assinatura expirou. Renove agora para continuar recebendo pedidos.</span>
                                <Button size="sm" variant="outline" className="bg-white text-red-600 border-red-200 hover:bg-red-50" asChild>
                                    <Link href="/restaurant/dashboard/subscription">Renovar Agora</Link>
                                </Button>
                            </AlertDescription>
                        </Alert>
                    )}

                    {children}
                </main>
            </div>
        </div>
    )
}
