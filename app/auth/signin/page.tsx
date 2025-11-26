"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
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
import { toast, Toaster } from "react-hot-toast"
import { LogIn } from "lucide-react"

export default function SignInPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            if (!email || !password) {
                toast.error("Preencha todos os campos")
                return
            }

            const result = await signIn("credentials", {
                redirect: false,
                email,
                password,
            })

            if (result?.error) {
                toast.error("Email ou senha incorretos")
            } else {
                toast.success("Login realizado com sucesso!")
                setTimeout(() => {
                    router.push("/")
                }, 1000)
            }
        } catch (error) {
            console.error(error)
            toast.error("Erro ao fazer login. Tente novamente.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 p-4">
            <div className="w-full max-w-md">
                <Card>
                    <CardHeader className="space-y-1 text-center">
                        <CardTitle className="text-3xl font-bold">Bem-vindo de volta</CardTitle>
                        <CardDescription>
                            Entre com suas credenciais para continuar
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    name="email"
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
                                    name="password"
                                    type="password"
                                    placeholder="Mínimo 6 caracteres"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                <LogIn className="mr-2 h-4 w-4" />
                                {isLoading ? "Entrando..." : "Entrar"}
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4">
                        <div className="text-center text-sm">
                            <span className="text-muted-foreground">Não tem uma conta?</span>
                            <Link
                                href="/auth/signup"
                                className="font-medium text-primary hover:underline ml-1"
                            >
                                Cadastre-se
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
