"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { updateSiteSettings } from "@/actions/admin"
import { toast } from "react-hot-toast"
import Image from "next/image"

const siteSettingsSchema = z.object({
    siteName: z.string().min(1, "Nome do site é obrigatório"),
    logo: z.string().optional().nullable(),
    favicon: z.string().optional().nullable(),
    primaryColor: z.string().regex(/^#([0-9A-F]{3}){1,2}$/i, "Cor inválida"),
    secondaryColor: z.string().regex(/^#([0-9A-F]{3}){1,2}$/i, "Cor inválida"),
    footerEmail: z.string().email("Email inválido").optional().nullable().or(z.literal("")),
    footerPhone: z.string().optional().nullable(),
    footerAddress: z.string().optional().nullable(),
    footerFacebook: z.string().optional().nullable(),
    footerInstagram: z.string().optional().nullable(),
    footerTwitter: z.string().optional().nullable(),
    stripeProdSecretKey: z.string().optional().nullable(),
    stripeProdPublishableKey: z.string().optional().nullable(),
    stripeTestSecretKey: z.string().optional().nullable(),
    stripeTestPublishableKey: z.string().optional().nullable(),
    isStripeSandbox: z.boolean(),
})

type SiteSettingsFormValues = z.infer<typeof siteSettingsSchema>

export default function SiteSettingsClient({ initialSettings }: { initialSettings: any }) {
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm<SiteSettingsFormValues>({
        resolver: zodResolver(siteSettingsSchema),
        defaultValues: {
            siteName: initialSettings?.siteName || "DeliveryApp",
            logo: initialSettings?.logo || "",
            favicon: initialSettings?.favicon || "",
            primaryColor: initialSettings?.primaryColor || "#ea580c",
            secondaryColor: initialSettings?.secondaryColor || "#dc2626",
            footerEmail: initialSettings?.footerEmail || "",
            footerPhone: initialSettings?.footerPhone || "",
            footerAddress: initialSettings?.footerAddress || "",
            footerFacebook: initialSettings?.footerFacebook || "",
            footerInstagram: initialSettings?.footerInstagram || "",
            footerTwitter: initialSettings?.footerTwitter || "",
            stripeProdSecretKey: initialSettings?.stripeProdSecretKey || "",
            stripeProdPublishableKey: initialSettings?.stripeProdPublishableKey || "",
            stripeTestSecretKey: initialSettings?.stripeTestSecretKey || "",
            stripeTestPublishableKey: initialSettings?.stripeTestPublishableKey || "",
            isStripeSandbox: initialSettings?.isStripeSandbox !== false,
        }
    })

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: "logo" | "favicon") => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                form.setValue(field, reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const onSubmit = async (data: SiteSettingsFormValues) => {
        setIsSubmitting(true)
        try {
            const result = await updateSiteSettings(data)
            if (result.success) {
                toast.success("Configurações salvas com sucesso!")
            } else {
                toast.error(result.message || "Erro ao salvar configurações")
            }
        } catch (error) {
            toast.error("Erro ao processar requisição")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Configurações do Site</h1>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Salvando..." : "Salvar Alterações"}
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Identidade Visual</CardTitle>
                        <CardDescription>Logo, cores e informações básicas.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="siteName">Nome do Site</Label>
                            <Input id="siteName" {...form.register("siteName")} />
                            {form.formState.errors.siteName && (
                                <p className="text-sm text-red-500">{form.formState.errors.siteName.message}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="primaryColor">Cor Primária</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="primaryColor"
                                        type="color"
                                        className="w-12 h-10 p-1"
                                        {...form.register("primaryColor")}
                                    />
                                    <Input {...form.register("primaryColor")} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="secondaryColor">Cor Secundária</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="secondaryColor"
                                        type="color"
                                        className="w-12 h-10 p-1"
                                        {...form.register("secondaryColor")}
                                    />
                                    <Input {...form.register("secondaryColor")} />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="logo">Logo</Label>
                            <Input
                                id="logo"
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageUpload(e, "logo")}
                            />
                            {form.watch("logo") && (
                                <div className="relative h-16 w-auto mt-2 p-2 bg-gray-100 rounded-md">
                                    <Image src={form.watch("logo")!} alt="Logo Preview" width={100} height={40} className="object-contain h-full" />
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="favicon">Favicon</Label>
                            <Input
                                id="favicon"
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageUpload(e, "favicon")}
                            />
                            {form.watch("favicon") && (
                                <div className="relative h-8 w-8 mt-2">
                                    <Image src={form.watch("favicon")!} alt="Favicon Preview" width={32} height={32} className="object-contain" />
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Rodapé e Contato</CardTitle>
                        <CardDescription>Informações exibidas no rodapé do site.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="footerEmail">Email de Contato</Label>
                            <Input id="footerEmail" {...form.register("footerEmail")} />
                            {form.formState.errors.footerEmail && (
                                <p className="text-sm text-red-500">{form.formState.errors.footerEmail.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="footerPhone">Telefone</Label>
                            <Input id="footerPhone" {...form.register("footerPhone")} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="footerAddress">Endereço</Label>
                            <Input id="footerAddress" {...form.register("footerAddress")} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="footerFacebook">Facebook URL</Label>
                            <Input id="footerFacebook" {...form.register("footerFacebook")} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="footerInstagram">Instagram URL</Label>
                            <Input id="footerInstagram" {...form.register("footerInstagram")} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="footerTwitter">Twitter URL</Label>
                            <Input id="footerTwitter" {...form.register("footerTwitter")} />
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-1 md:col-span-2">
                    <CardHeader>
                        <CardTitle>Pagamentos (Stripe)</CardTitle>
                        <CardDescription>Configure as chaves de API do Stripe para processar pagamentos.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center space-x-2 border p-4 rounded-md bg-gray-50">
                            <input
                                type="checkbox"
                                id="isStripeSandbox"
                                className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-600 cursor-pointer"
                                {...form.register("isStripeSandbox")}
                            />
                            <Label htmlFor="isStripeSandbox" className="font-medium cursor-pointer">Ativar Modo Sandbox (Ambiente de Teste)</Label>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <h3 className="font-semibold text-gray-700 pb-2 border-b">Ambiente de Teste (Sandbox)</h3>
                                <div className="space-y-2">
                                    <Label htmlFor="stripeTestSecretKey">Chave Secreta (Teste)</Label>
                                    <Input id="stripeTestSecretKey" type="password" placeholder="sk_test_..." {...form.register("stripeTestSecretKey")} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="stripeTestPublishableKey">Chave Pública (Teste)</Label>
                                    <Input id="stripeTestPublishableKey" placeholder="pk_test_..." {...form.register("stripeTestPublishableKey")} />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="font-semibold text-gray-700 pb-2 border-b">Ambiente de Produção (Live)</h3>
                                <div className="space-y-2">
                                    <Label htmlFor="stripeProdSecretKey">Chave Secreta (Produção)</Label>
                                    <Input id="stripeProdSecretKey" type="password" placeholder="sk_live_..." {...form.register("stripeProdSecretKey")} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="stripeProdPublishableKey">Chave Pública (Produção)</Label>
                                    <Input id="stripeProdPublishableKey" placeholder="pk_live_..." {...form.register("stripeProdPublishableKey")} />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </form>
    )
}
