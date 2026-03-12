"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn, useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { upgradeToRestaurant } from "@/actions/user"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast, Toaster } from "react-hot-toast"
import { Store, Info } from "lucide-react"

function RestaurantSignUpForm() {
    const [ownerName, setOwnerName] = useState("")
    const [restaurantName, setRestaurantName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()
    const searchParams = useSearchParams()
    const planId = searchParams.get("plan")
    const { data: session, update: updateSession } = useSession()

    const handleUpgrade = async () => {
        setIsLoading(true)
        try {
            const result = await upgradeToRestaurant()
            if (result.success) {
                toast.success("Conta atualizada para Restaurante!")
                await updateSession({ ...session, user: { ...session?.user, role: "RESTAURANT" } })

                window.location.href = planId
                    ? `/restaurant/dashboard/subscription?checkout_plan=${planId}`
                    : "/restaurant/dashboard"
            } else {
                toast.error(result.message || "Erro ao atualizar conta")
            }
        } catch (error) {
            toast.error("Erro ao processar")
        } finally {
            setIsLoading(false)
        }
    }

    if (session?.user) {
        if (session.user.role === "RESTAURANT") {
            if (planId) {
                router.push(`/restaurant/dashboard/subscription?checkout_plan=${planId}`)
            } else {
                router.push("/restaurant/dashboard")
            }
            return <div className="text-center p-8">Redirecionando...</div>
        }

        return (
            <Card>
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                            <Store className="w-6 h-6 text-orange-600" />
                        </div>
                    </div>
                    <CardTitle>Olá, {session.user.name}!</CardTitle>
                    <CardDescription>
                        Você já possui uma conta de cliente. Deseja ativar o modo Vendedor nela?
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Alert className="bg-orange-50 text-orange-800 border-orange-200">
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                            Ao confirmar, sua conta terá acesso ao Painel do Restaurante e você poderá cadastrar seus produtos.
                        </AlertDescription>
                    </Alert>

                    <Button
                        onClick={handleUpgrade}
                        className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                        disabled={isLoading}
                    >
                        {isLoading ? "Processando..." : "Sim, Quero Vender"}
                    </Button>

                    <Button
                        variant="ghost"
                        onClick={() => signOut({ callbackUrl: "/auth/signup/restaurant" })}
                        className="w-full"
                    >
                        Não, quero criar outra conta
                    </Button>
                </CardContent>
            </Card>
        )
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            if (!ownerName || !restaurantName || !email || !password || !confirmPassword) {
                toast.error("Preencha todos os campos")
                return
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            if (!emailRegex.test(email)) {
                toast.error("Email inválido")
                return
            }

            if (password.length < 6) {
                toast.error("A senha deve ter no mínimo 6 caracteres")
                return
            }

            if (password !== confirmPassword) {
                toast.error("As senhas não coincidem")
                return
            }

            const response = await fetch("/api/auth/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: ownerName,
                    restaurantName,
                    email,
                    password,
                    role: "RESTAURANT",
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                toast.error(data.error || "Erro ao criar conta")
                return
            }

            toast.success("Conta de restaurante criada! Redirecionando...")

            // Login automático após cadastro
            const result = await signIn("credentials", {
                redirect: false,
                email,
                password,
            })

            if (result?.error) {
                toast.error("Conta criada, mas erro no login automático. Por favor entre manualmente.")
                router.push("/auth/signin")
                return
            }

            if (planId) {
                // Usando window.location para garantir que o cookie de sessão seja enviado corretamente
                window.location.href = `/restaurant/dashboard/subscription?checkout_plan=${planId}`
            } else {
                window.location.href = "/restaurant/dashboard"
            }
        } catch (error) {
            console.error(error)
            toast.error("Erro ao criar conta. Tente novamente.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card>
            <CardHeader className="space-y-1 text-center">
                <div className="flex justify-center mb-4">
                    <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                        <Store className="w-6 h-6 text-orange-600" />
                    </div>
                </div>
                <CardTitle className="text-3xl font-bold">Cadastrar Restaurante</CardTitle>
                <CardDescription>
                    Crie sua conta para começar a vender
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div className="space-y-2">
                        <Label htmlFor="restaurantName">Nome do Restaurante</Label>
                        <Input
                            id="restaurantName"
                            type="text"
                            placeholder="Ex: Pizzaria do João"
                            value={restaurantName}
                            onChange={(e) => setRestaurantName(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="name">Nome do Responsável</Label>
                        <Input
                            id="name"
                            type="text"
                            placeholder="Seu nome completo"
                            value={ownerName}
                            onChange={(e) => setOwnerName(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email Corporativo</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="contato@restaurante.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                    </div>

                    <Alert className="bg-blue-50 text-blue-800 border-blue-200">
                        <Info className="h-4 w-4" />
                        <AlertDescription className="text-sm">
                            Sua conta precisará ser aprovada e ter um plano ativo para que seus produtos fiquem visíveis aos clientes.
                        </AlertDescription>
                    </Alert>

                    <div className="space-y-2">
                        <Label htmlFor="password">Senha</Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="Mínimo 6 caracteres"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                        <Input
                            id="confirmPassword"
                            type="password"
                            placeholder="Confirme sua senha"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                    </div>

                    <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white" disabled={isLoading}>
                        {isLoading ? "Criando conta..." : "Criar Restaurante"}
                    </Button>
                </form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
                <div className="text-center text-sm">
                    <span className="text-muted-foreground">Já tem uma conta?</span>
                    <Link
                        href="/auth/signin"
                        className="font-medium text-orange-600 hover:underline ml-1"
                    >
                        Entrar
                    </Link>
                </div>
                <div className="text-center">
                    <Link
                        href="/"
                        className="text-sm text-muted-foreground hover:text-primary"
                    >
                        Voltar para home
                    </Link>
                </div>
            </CardFooter>
        </Card>
    )
}

export default function RestaurantSignUpPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 p-4">
            <div className="w-full max-w-md">
                <Suspense fallback={<div>Carregando...</div>}>
                    <RestaurantSignUpForm />
                </Suspense>
            </div>
            <Toaster position="top-right" />
        </div>
    )
}
