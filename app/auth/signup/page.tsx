"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"
import Link from "next/link"
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
import { UserPlus, Info } from "lucide-react"

export default function SignUpPage() {
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()
    const searchParams = useSearchParams()
    const type = searchParams.get("type")
    const planId = searchParams.get("plan")

    useEffect(() => {
        if (type === "restaurant") {
            const url = planId ? `/auth/signup/restaurant?plan=${planId}` : "/auth/signup/restaurant"
            router.push(url)
        }
    }, [type, planId, router])

    if (type === "restaurant") {
        return <div className="min-h-screen flex items-center justify-center">Redirecionando...</div>
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            if (!name || !email || !password || !confirmPassword) {
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
                    name,
                    email,
                    password,
                    role: "USER",
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                toast.error(data.error || "Erro ao criar conta")
                return
            }

            toast.success("Conta criada! Redirecionando...")

            // Login automático após cadastro
            await signIn("credentials", {
                redirect: false,
                email,
                password,
            })

            router.push("/")
        } catch (error) {
            console.error(error)
            toast.error("Erro ao criar conta. Tente novamente.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 p-4">
            <div className="w-full max-w-md">
                <Card>
                    <CardHeader className="space-y-1 text-center">
                        <CardTitle className="text-3xl font-bold">Criar Conta</CardTitle>
                        <CardDescription>
                            Preencha os dados abaixo para começar
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nome Completo</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    placeholder="Seu nome"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    disabled={isLoading}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="seuemail@exemplo.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={isLoading}
                                />
                            </div>

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

                            <Button type="submit" className="w-full" disabled={isLoading}>
                                <UserPlus className="mr-2 h-4 w-4" />
                                {isLoading ? "Criando conta..." : "Criar Conta"}
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4">
                        <div className="text-center text-sm">
                            <span className="text-muted-foreground">Já tem uma conta?</span>
                            <Link
                                href="/auth/signin"
                                className="font-medium text-primary hover:underline ml-1"
                            >
                                Entrar
                            </Link>
                        </div>
                        <div className="text-center text-sm">
                            <Link
                                href="/auth/signup/restaurant"
                                className="text-orange-600 hover:text-orange-700 font-medium"
                            >
                                Você é um restaurante? Cadastre-se aqui
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
            </div>
            <Toaster position="top-right" />
        </div>
    )
}
