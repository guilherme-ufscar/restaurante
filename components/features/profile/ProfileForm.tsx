
"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { toast } from "react-hot-toast"
import { updateUserProfile } from "@/actions/user"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User } from "lucide-react"

const profileSchema = z.object({
    name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
    email: z.string().email("Email inválido"),
    currentPassword: z.string().optional(),
    newPassword: z.string().optional(),
    confirmNewPassword: z.string().optional(),
}).refine((data) => {
    if (data.newPassword && data.newPassword !== data.confirmNewPassword) {
        return false
    }
    return true
}, {
    message: "Novas senhas não conferem",
    path: ["confirmNewPassword"],
}).refine((data) => {
    if (data.newPassword && !data.currentPassword) {
        return false
    }
    return true
}, {
    message: "Senha atual é necessária para alterar a senha",
    path: ["currentPassword"],
})

interface ProfileFormProps {
    user: {
        name: string
        email: string
        image?: string
    }
}

export default function ProfileForm({ user }: ProfileFormProps) {
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm<z.infer<typeof profileSchema>>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: user.name || "",
            email: user.email || "",
            currentPassword: "",
            newPassword: "",
            confirmNewPassword: "",
        },
    })

    const onSubmit = async (values: z.infer<typeof profileSchema>) => {
        setIsLoading(true)
        try {
            const result = await updateUserProfile({
                name: values.name,
                email: values.email,
                currentPassword: values.currentPassword || undefined,
                newPassword: values.newPassword || undefined,
            })

            if (result.success) {
                toast.success("Perfil atualizado com sucesso!")
                form.reset({
                    name: values.name,
                    email: values.email,
                    currentPassword: "",
                    newPassword: "",
                    confirmNewPassword: "",
                })
            } else {
                toast.error(result.message || "Erro desconhecido")
            }
        } catch (error) {
            console.error(error)
            toast.error("Erro ao atualizar perfil")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="max-w-xl mx-auto space-y-8">
            <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-24 w-24">
                    <AvatarImage src={user.image} />
                    <AvatarFallback className="text-2xl">
                        {user.name?.charAt(0).toUpperCase() || <User />}
                    </AvatarFallback>
                </Avatar>
                {/* Image upload logic can be added later */}
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nome Completo</FormLabel>
                                <FormControl>
                                    <Input placeholder="Seu nome" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input placeholder="seu@email.com" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="pt-4 border-t">
                        <h3 className="text-lg font-medium mb-4">Alterar Senha</h3>
                        <div className="space-y-4">
                            <FormField
                                control={form.control}
                                name="currentPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Senha Atual</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="********" {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            Necessário apenas para alterar a senha.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="newPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nova Senha</FormLabel>
                                            <FormControl>
                                                <Input type="password" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="confirmNewPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Confirmar Nova Senha</FormLabel>
                                            <FormControl>
                                                <Input type="password" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? "Salvando..." : "Salvar Alterações"}
                    </Button>
                </form>
            </Form>
        </div>
    )
}
