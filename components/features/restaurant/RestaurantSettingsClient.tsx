"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage
} from "@/components/ui/form"
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch" // Precisa criar se não existir, vou assumir que existe ou usar Checkbox
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "react-hot-toast"
import { updateRestaurantInfo, updateRestaurantImages, togglePaymentMethod } from "@/actions/restaurant"
import { Check, CreditCard, Upload, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"

// Schema
const restaurantInfoSchema = z.object({
    name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
    description: z.string().max(500, "Descrição muito longa").optional().nullable(),
    categoryId: z.string().min(1, "Categoria é obrigatória"),
    phone: z.string().min(10, "Telefone inválido"),
    email: z.string().email("Email inválido"),
    opensAt: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Horário inválido"),
    closesAt: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Horário inválido"),
    minOrderValue: z.number().min(0),
    deliveryFee: z.number().min(0),
    estimatedDeliveryTime: z.number().int().positive(),
    acceptsDelivery: z.boolean(),
    acceptsPickup: z.boolean(),
}).refine(data => data.acceptsDelivery || data.acceptsPickup, {
    message: "Selecione pelo menos um método de entrega",
    path: ["acceptsDelivery"]
})

interface RestaurantSettingsClientProps {
    restaurant: any
    categories: any[]
    allPaymentMethods: any[]
}

export default function RestaurantSettingsClient({ restaurant, categories, allPaymentMethods }: RestaurantSettingsClientProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [logoPreview, setLogoPreview] = useState<string | null>(restaurant.logo)
    const [bannerPreview, setBannerPreview] = useState<string | null>(restaurant.banner)

    const form = useForm<z.infer<typeof restaurantInfoSchema>>({
        resolver: zodResolver(restaurantInfoSchema),
        defaultValues: {
            name: restaurant.name,
            description: restaurant.description,
            categoryId: restaurant.categoryId,
            phone: restaurant.phone,
            email: restaurant.email,
            opensAt: restaurant.opensAt,
            closesAt: restaurant.closesAt,
            minOrderValue: Number(restaurant.minOrderValue),
            deliveryFee: Number(restaurant.deliveryFee),
            estimatedDeliveryTime: restaurant.estimatedDeliveryTime,
            acceptsDelivery: restaurant.acceptsDelivery,
            acceptsPickup: restaurant.acceptsPickup,
        },
    })

    async function onInfoSubmit(values: z.infer<typeof restaurantInfoSchema>) {
        setIsLoading(true)
        try {
            const result = await updateRestaurantInfo(values)
            if (result.success) {
                toast.success("Informações atualizadas!")
            } else {
                toast.error(result.message || "Erro ao atualizar")
            }
        } catch (error) {
            toast.error("Erro inesperado")
        } finally {
            setIsLoading(false)
        }
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: "logo" | "banner") => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                const base64String = reader.result as string
                if (type === "logo") setLogoPreview(base64String)
                else setBannerPreview(base64String)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleSaveImages = async () => {
        setIsLoading(true)
        try {
            const result = await updateRestaurantImages(logoPreview, bannerPreview)
            if (result.success) {
                toast.success("Imagens atualizadas!")
            } else {
                toast.error(result.message || "Erro ao atualizar imagens")
            }
        } catch (error) {
            toast.error("Erro inesperado")
        } finally {
            setIsLoading(false)
        }
    }

    const handlePaymentToggle = async (methodId: string, currentState: boolean) => {
        try {
            const result = await togglePaymentMethod(methodId, currentState)
            if (result.success) {
                toast.success("Método de pagamento atualizado")
            } else {
                toast.error(result.message || "Erro ao atualizar")
            }
        } catch (error) {
            toast.error("Erro inesperado")
        }
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>

            <Tabs defaultValue="general" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="general">Informações Gerais</TabsTrigger>
                    <TabsTrigger value="images">Imagens</TabsTrigger>
                    <TabsTrigger value="payment">Pagamento</TabsTrigger>
                </TabsList>

                <TabsContent value="general">
                    <Card>
                        <CardHeader>
                            <CardTitle>Dados do Restaurante</CardTitle>
                            <CardDescription>Gerencie as informações principais do seu estabelecimento.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onInfoSubmit)} className="space-y-6">
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Nome do Restaurante</FormLabel>
                                                    <FormControl><Input {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="categoryId"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Categoria</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Selecione" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {categories.map((cat: any) => (
                                                                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="description"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Descrição</FormLabel>
                                                <FormControl><Textarea {...field} value={field.value || ""} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="grid md:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="phone"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Telefone</FormLabel>
                                                    <FormControl><Input {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Email de Contato</FormLabel>
                                                    <FormControl><Input {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="opensAt"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Abre às</FormLabel>
                                                    <FormControl><Input type="time" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="closesAt"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Fecha às</FormLabel>
                                                    <FormControl><Input type="time" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="grid md:grid-cols-3 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="minOrderValue"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Pedido Mínimo (R$)</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            step="0.01"
                                                            {...field}
                                                            onChange={e => field.onChange(e.target.value === "" ? 0 : Number(e.target.value))}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="deliveryFee"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Taxa de Entrega (R$)</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            step="0.01"
                                                            {...field}
                                                            onChange={e => field.onChange(e.target.value === "" ? 0 : Number(e.target.value))}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="estimatedDeliveryTime"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Tempo Estimado (min)</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            {...field}
                                                            onChange={e => field.onChange(e.target.value === "" ? 0 : Number(e.target.value))}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="flex gap-6">
                                        <FormField
                                            control={form.control}
                                            name="acceptsDelivery"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                                    <FormControl>
                                                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                                    </FormControl>
                                                    <div className="space-y-1 leading-none">
                                                        <FormLabel>Aceita Entrega</FormLabel>
                                                    </div>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="acceptsPickup"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                                    <FormControl>
                                                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                                    </FormControl>
                                                    <div className="space-y-1 leading-none">
                                                        <FormLabel>Aceita Retirada</FormLabel>
                                                    </div>
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <Button type="submit" disabled={isLoading}>
                                        {isLoading ? "Salvando..." : "Salvar Alterações"}
                                    </Button>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="images">
                    <Card>
                        <CardHeader>
                            <CardTitle>Imagens</CardTitle>
                            <CardDescription>Personalize a aparência do seu restaurante.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <h3 className="font-medium">Logo</h3>
                                    <div className="relative h-32 w-32 border rounded-full overflow-hidden bg-gray-100">
                                        {logoPreview ? (
                                            <Image src={logoPreview} alt="Logo" fill className="object-cover" />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-gray-400">Sem Logo</div>
                                        )}
                                    </div>
                                    <Input type="file" accept="image/*" onChange={(e) => handleImageChange(e, "logo")} />
                                </div>

                                <div className="space-y-4">
                                    <h3 className="font-medium">Banner</h3>
                                    <div className="relative h-32 w-full border rounded-md overflow-hidden bg-gray-100">
                                        {bannerPreview ? (
                                            <Image src={bannerPreview} alt="Banner" fill className="object-cover" />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-gray-400">Sem Banner</div>
                                        )}
                                    </div>
                                    <Input type="file" accept="image/*" onChange={(e) => handleImageChange(e, "banner")} />
                                </div>
                            </div>
                            <Button onClick={handleSaveImages} disabled={isLoading}>
                                {isLoading ? "Salvando..." : "Salvar Imagens"}
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="payment">
                    <Card>
                        <CardHeader>
                            <CardTitle>Métodos de Pagamento</CardTitle>
                            <CardDescription>Selecione os métodos de pagamento aceitos.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {allPaymentMethods.map((method: any) => {
                                    const isActive = restaurant.paymentMethods.some((pm: any) => pm.paymentMethodId === method.id)
                                    return (
                                        <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <CreditCard className="h-5 w-5 text-muted-foreground" />
                                                <span className="font-medium">{method.name}</span>
                                            </div>
                                            <Checkbox
                                                checked={isActive}
                                                onCheckedChange={(checked) => handlePaymentToggle(method.id, isActive)}
                                            />
                                        </div>
                                    )
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
