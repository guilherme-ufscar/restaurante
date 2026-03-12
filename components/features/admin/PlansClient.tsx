"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Pencil, Check, Users, Trash2, X } from "lucide-react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { createSubscriptionPlan, updateSubscriptionPlan, toggleSubscriptionPlanStatus } from "@/actions/admin"
import { toast } from "react-hot-toast"

const planSchema = z.object({
    name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
    description: z.string().optional(),
    price: z.coerce.number().positive("Preço deve ser positivo"),
    interval: z.enum(["MONTHLY", "QUARTERLY", "SEMIANNUAL", "ANNUAL"]),
    features: z.array(z.object({ value: z.string().min(3, "Funcionalidade deve ter min 3 caracteres") })).min(1, "Adicione pelo menos uma funcionalidade"),
    maxProducts: z.coerce.number().positive().optional().nullable(),
    maxOrders: z.coerce.number().positive().optional().nullable(),
    isActive: z.boolean().default(true)
})

type PlanFormValues = z.infer<typeof planSchema>

interface Plan {
    id: string
    name: string
    description: string | null
    price: number
    interval: string
    features: string[]
    maxProducts: number | null
    maxOrders: number | null
    isActive: boolean
    _count: {
        restaurants: number
    }
}

export default function PlansClient({ plans }: { plans: Plan[] }) {
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [editingPlan, setEditingPlan] = useState<Plan | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm({
        resolver: zodResolver(planSchema),
        defaultValues: {
            name: "",
            description: "",
            price: 0,
            interval: "MONTHLY",
            features: [{ value: "" }],
            isActive: true
        }
    })

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "features"
    })

    const handleCreate = async (data: PlanFormValues) => {
        setIsSubmitting(true)
        try {
            const formattedData = {
                ...data,
                features: data.features.map(f => f.value)
            }
            const result = await createSubscriptionPlan(formattedData)
            if (result.success) {
                toast.success("Plano criado com sucesso!")
                setIsCreateOpen(false)
                form.reset()
            } else {
                toast.error(result.message || "Erro ao criar plano")
            }
        } catch (error) {
            toast.error("Erro ao processar requisição")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleUpdate = async (data: PlanFormValues) => {
        if (!editingPlan) return
        setIsSubmitting(true)
        try {
            const formattedData = {
                ...data,
                features: data.features.map(f => f.value)
            }
            const result = await updateSubscriptionPlan(editingPlan.id, formattedData)
            if (result.success) {
                toast.success("Plano atualizado com sucesso!")
                setEditingPlan(null)
            } else {
                toast.error(result.message || "Erro ao atualizar plano")
            }
        } catch (error) {
            toast.error("Erro ao processar requisição")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleToggleStatus = async (id: string) => {
        try {
            const result = await toggleSubscriptionPlanStatus(id)
            if (result.success) {
                toast.success("Status atualizado!")
            } else {
                toast.error(result.message || "Erro ao atualizar status")
            }
        } catch (error) {
            toast.error("Erro ao processar requisição")
        }
    }

    const openEditDialog = (plan: Plan) => {
        setEditingPlan(plan)
        form.reset({
            name: plan.name,
            description: plan.description || "",
            price: plan.price,
            interval: plan.interval as any,
            features: plan.features.map(f => ({ value: f })),
            maxProducts: plan.maxProducts,
            maxOrders: plan.maxOrders,
            isActive: plan.isActive
        })
    }

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL"
        }).format(value)
    }

    const translateInterval = (interval: string) => {
        const map: Record<string, string> = {
            MONTHLY: "por mês",
            QUARTERLY: "a cada 3 meses",
            SEMIANNUAL: "a cada 6 meses",
            ANNUAL: "por ano"
        }
        return map[interval] || interval
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Planos de Assinatura</h1>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => {
                            form.reset({
                                name: "",
                                description: "",
                                price: 0,
                                interval: "MONTHLY",
                                features: [{ value: "" }],
                                isActive: true
                            })
                        }}>
                            <Plus className="mr-2 h-4 w-4" />
                            Novo Plano
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Novo Plano de Assinatura</DialogTitle>
                            <DialogDescription>
                                Crie um novo plano para os restaurantes.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={form.handleSubmit(handleCreate)} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nome</Label>
                                    <Input id="name" {...form.register("name")} />
                                    {form.formState.errors.name && <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="price">Preço (R$)</Label>
                                    <Input id="price" type="number" step="0.01" {...form.register("price")} />
                                    {form.formState.errors.price && <p className="text-sm text-red-500">{form.formState.errors.price.message}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Descrição</Label>
                                <Textarea id="description" {...form.register("description")} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="interval">Intervalo de Cobrança</Label>
                                <Select
                                    onValueChange={(value) => form.setValue("interval", value as any)}
                                    defaultValue={form.getValues("interval")}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione o intervalo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="MONTHLY">Mensal</SelectItem>
                                        <SelectItem value="QUARTERLY">Trimestral</SelectItem>
                                        <SelectItem value="SEMIANNUAL">Semestral</SelectItem>
                                        <SelectItem value="ANNUAL">Anual</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Funcionalidades</Label>
                                {fields.map((field, index) => (
                                    <div key={field.id} className="flex gap-2">
                                        <Input {...form.register(`features.${index}.value` as const)} placeholder="Ex: Suporte 24/7" />
                                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                                <Button type="button" variant="outline" size="sm" onClick={() => append({ value: "" })}>
                                    <Plus className="mr-2 h-4 w-4" /> Adicionar
                                </Button>
                                {form.formState.errors.features && <p className="text-sm text-red-500">{form.formState.errors.features.message}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="maxProducts">Max. Produtos (Vazio = Ilimitado)</Label>
                                    <Input id="maxProducts" type="number" {...form.register("maxProducts")} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="maxOrders">Max. Pedidos (Vazio = Ilimitado)</Label>
                                    <Input id="maxOrders" type="number" {...form.register("maxOrders")} />
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="isActive"
                                    checked={form.watch("isActive")}
                                    onCheckedChange={(checked) => form.setValue("isActive", checked)}
                                />
                                <Label htmlFor="isActive">Ativo</Label>
                            </div>

                            <DialogFooter>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? "Criando..." : "Criar Plano"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map((plan) => (
                    <Card key={plan.id} className={`flex flex-col ${!plan.isActive ? "opacity-75 bg-gray-50" : ""}`}>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                                    <CardDescription>{plan.description}</CardDescription>
                                </div>
                                <Badge variant={plan.isActive ? "default" : "secondary"}>
                                    {plan.isActive ? "Ativo" : "Inativo"}
                                </Badge>
                            </div>
                            <div className="mt-4">
                                <span className="text-3xl font-bold">{formatCurrency(plan.price)}</span>
                                <span className="text-muted-foreground text-sm"> / {translateInterval(plan.interval)}</span>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <ul className="space-y-2">
                                {plan.features.map((feature, i) => (
                                    <li key={i} className="flex items-center text-sm">
                                        <Check className="h-4 w-4 mr-2 text-green-500" />
                                        {feature}
                                    </li>
                                ))}
                                <li className="flex items-center text-sm text-muted-foreground pt-2 border-t mt-2">
                                    <Users className="h-4 w-4 mr-2" />
                                    {plan._count.restaurants} assinantes ativos
                                </li>
                            </ul>
                        </CardContent>
                        <CardFooter className="flex justify-between pt-4 border-t">
                            <Button variant="outline" size="sm" onClick={() => openEditDialog(plan)}>
                                <Pencil className="h-4 w-4 mr-2" />
                                Editar
                            </Button>
                            <div className="flex items-center gap-2">
                                <Switch
                                    checked={plan.isActive}
                                    onCheckedChange={() => handleToggleStatus(plan.id)}
                                />
                                <span className="text-xs text-muted-foreground">
                                    {plan.isActive ? "Ativo" : "Inativo"}
                                </span>
                            </div>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            {/* Edit Dialog */}
            <Dialog open={!!editingPlan} onOpenChange={(open) => !open && setEditingPlan(null)}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Editar Plano</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={form.handleSubmit(handleUpdate)} className="space-y-4">
                        {/* Same fields as create form */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-name">Nome</Label>
                                <Input id="edit-name" {...form.register("name")} />
                                {form.formState.errors.name && <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-price">Preço (R$)</Label>
                                <Input id="edit-price" type="number" step="0.01" {...form.register("price")} />
                                {form.formState.errors.price && <p className="text-sm text-red-500">{form.formState.errors.price.message}</p>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-description">Descrição</Label>
                            <Textarea id="edit-description" {...form.register("description")} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-interval">Intervalo de Cobrança</Label>
                            <Select
                                onValueChange={(value) => form.setValue("interval", value as any)}
                                defaultValue={form.getValues("interval")}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione o intervalo" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="MONTHLY">Mensal</SelectItem>
                                    <SelectItem value="QUARTERLY">Trimestral</SelectItem>
                                    <SelectItem value="SEMIANNUAL">Semestral</SelectItem>
                                    <SelectItem value="ANNUAL">Anual</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Funcionalidades</Label>
                            {fields.map((field, index) => (
                                <div key={field.id} className="flex gap-2">
                                    <Input {...form.register(`features.${index}.value` as const)} />
                                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                            <Button type="button" variant="outline" size="sm" onClick={() => append({ value: "" })}>
                                <Plus className="mr-2 h-4 w-4" /> Adicionar
                            </Button>
                            {form.formState.errors.features && <p className="text-sm text-red-500">{form.formState.errors.features.message}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-maxProducts">Max. Produtos</Label>
                                <Input id="edit-maxProducts" type="number" {...form.register("maxProducts")} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-maxOrders">Max. Pedidos</Label>
                                <Input id="edit-maxOrders" type="number" {...form.register("maxOrders")} />
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Switch
                                id="edit-isActive"
                                checked={form.watch("isActive")}
                                onCheckedChange={(checked) => form.setValue("isActive", checked)}
                            />
                            <Label htmlFor="edit-isActive">Ativo</Label>
                        </div>

                        <DialogFooter>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "Salvando..." : "Salvar Alterações"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
