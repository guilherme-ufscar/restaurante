"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import {
    ShoppingCart,
    User,
    Menu,
    Search,
    MapPin,
    ChevronDown,
    LogOut,
    Package,
    LayoutDashboard,
    UserCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import CartSheet from "@/components/features/cart/CartSheet"
import Container from "./Container"

export default function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const { data: session } = useSession()
    const router = useRouter()

    const handleSignOut = async () => {
        await signOut({ redirect: false })
        router.push("/")
    }

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <Container>
                <div className="flex h-16 items-center justify-between gap-4">
                    {/* Logo e Menu Mobile */}
                    <div className="flex items-center gap-2">
                        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="lg:hidden">
                                    <Menu className="h-6 w-6" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left">
                                <nav className="flex flex-col gap-4 mt-8">
                                    <Link
                                        href="/"
                                        className="text-lg font-medium hover:text-primary"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Início
                                    </Link>
                                    <Link
                                        href="/restaurants"
                                        className="text-lg font-medium hover:text-primary"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Restaurantes
                                    </Link>
                                    <Link
                                        href="/categories"
                                        className="text-lg font-medium hover:text-primary"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Categorias
                                    </Link>
                                </nav>
                            </SheetContent>
                        </Sheet>

                        <Link href="/" className="flex items-center gap-2">
                            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 text-white font-bold">
                                D
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent hidden sm:block">
                                DeliveryApp
                            </span>
                        </Link>
                    </div>

                    {/* Navegação Desktop */}
                    <nav className="hidden lg:flex items-center gap-6">
                        <Link
                            href="/"
                            className="text-sm font-medium transition-colors hover:text-primary"
                        >
                            Início
                        </Link>
                        <Link
                            href="/restaurants"
                            className="text-sm font-medium transition-colors hover:text-primary"
                        >
                            Restaurantes
                        </Link>
                        <Link
                            href="/categories"
                            className="text-sm font-medium transition-colors hover:text-primary"
                        >
                            Categorias
                        </Link>
                    </nav>

                    {/* Busca */}
                    <div className="flex-1 max-w-md hidden md:block">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input
                                type="search"
                                placeholder="Buscar restaurantes ou pratos"
                                className="w-full pl-10 pr-4 py-2 text-sm border rounded-full focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                            />
                        </div>
                    </div>

                    {/* Localização */}
                    <Button variant="ghost" size="sm" className="hidden lg:flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span className="text-sm text-muted-foreground">
                            Adicionar endereço
                        </span>
                    </Button>

                    {/* Ações do Usuário */}
                    <div className="flex items-center gap-2">
                        <CartSheet />

                        {session?.user ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="flex items-center gap-2 pl-2 pr-4">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={session.user.image || ""} />
                                            <AvatarFallback>
                                                {session.user.name
                                                    ? session.user.name.charAt(0).toUpperCase()
                                                    : "U"}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="hidden md:block text-sm font-medium">
                                            {session.user.name}
                                        </span>
                                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => router.push("/profile")}>
                                        <UserCircle className="mr-2 h-4 w-4" />
                                        <span>Meu Perfil</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => router.push("/orders")}>
                                        <Package className="mr-2 h-4 w-4" />
                                        <span>Meus Pedidos</span>
                                    </DropdownMenuItem>

                                    {session.user.role === "RESTAURANT" && (
                                        <DropdownMenuItem onClick={() => router.push("/restaurant/dashboard")}>
                                            <LayoutDashboard className="mr-2 h-4 w-4" />
                                            <span>Painel do Restaurante</span>
                                        </DropdownMenuItem>
                                    )}

                                    {session.user.role === "ADMIN" && (
                                        <DropdownMenuItem onClick={() => router.push("/admin/dashboard")}>
                                            <LayoutDashboard className="mr-2 h-4 w-4" />
                                            <span>Painel Admin</span>
                                        </DropdownMenuItem>
                                    )}

                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={handleSignOut} className="text-red-600 focus:text-red-600">
                                        <LogOut className="mr-2 h-4 w-4" />
                                        <span>Sair</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm" asChild>
                                    <Link href="/auth/signin">Entrar</Link>
                                </Button>
                                <Button size="sm" asChild>
                                    <Link href="/auth/signup">Cadastrar</Link>
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </Container>
        </header>
    )
}
