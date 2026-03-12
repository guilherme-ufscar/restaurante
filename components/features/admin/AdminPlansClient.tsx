"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
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
import { Checkbox } from "@/components/ui/checkbox"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Plus, Check, X, Pencil, Power } from "lucide-react"
import { toast } from "react-hot-toast"
import { createSubscriptionPlan, updateSubscriptionPlan, toggleSubscriptionPlanStatus } from "@/actions/admin"

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

interface AdminPlansClientProps {
    plans: Plan[]
}

export default function AdminPlansClient({ plans }: AdminPlansClientProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingPlan, setEditingPlan] = useState<Plan | null>(null)

    // Form states
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [price, setPrice] = useState("")
    const [interval, setInterval] = useState("MONTHLY")
    const [features, setFeatures] = useState<string[]>([""])
    const [maxProducts, setMaxProducts] = useState("")
    const [maxOrders, setMaxOrders] = useState("")
    const [isActive, setIsActive] = useState(true)

    const resetForm = () => {
        setName("")
        setDescription("")
        setPrice("")
        setInterval("MONTHLY")
        setFeatures([""])
        setMaxProducts("")
        setMaxOrders("")
        setIsActive(true)
        setEditingPlan(null)
    }

    const handleOpenDialog = (plan?: Plan) => {
        if (plan) {
            setEditingPlan(plan)
            setName(plan.name)
            setDescription(plan.description || "")
            setPrice(plan.price.toString())
            setInterval(plan.interval)
            setFeatures(plan.features.length > 0 ? plan.features : [""])
            setMaxProducts(plan.maxProducts?.toString() || "")
            setMaxOrders(plan.maxOrders?.toString() || "")
            setIsActive(plan.isActive)
        } else {
            resetForm()
        }
        setIsDialogOpen(true)
    }

    const handleFeatureChange = (index: number, value: string) => {
        const newFeatures = [...features]
        newFeatures[index] = value
        setFeatures(newFeatures)
    }

    const addFeature = () => {
        setFeatures([...features, ""])
    }

    const removeFeature = (index: number) => {
        const newFeatures = features.filter((_, i) => i !== index)
        setFeatures(newFeatures)
    }

    const handleSubmit = async () => {
        if (!name || !price) {
            toast.error("Nome e Preço são obrigatórios")
            return
        }

        const validFeatures = features.filter(f => f.trim() !== "")
        if (validFeatures.length === 0) {
            toast.error("Adicione pelo menos uma funcionalidade")
            return
        }

        setIsLoading(true)
        try {
            const data = {
                name,
                description,
                price: parseFloat(price),
                interval: interval as any,
                features: validFeatures,
                maxProducts: maxProducts ? parseInt(maxProducts) : null,
                maxOrders: maxOrders ? parseInt(maxOrders) : null,
                isActive
            }
            let result

            if (editingPlan) {
                result = await updateSubscriptionPlan(editingPlan.id, data)
            } else {
                result = await createSubscriptionPlan(data)
            }

            if (result.success) {
                toast.success(editingPlan ? "Plano atualizado!" : "Plano criado!")
                setIsDialogOpen(false)
                resetForm()
                router.refresh()
            } else {
                toast.error(result.message || "Erro ao salvar")
            }
        } catch (error) {
            toast.error("Erro inesperado")
        } finally {
            setIsLoading(false)
        }
    }

    const handleToggleStatus = async (id: string) => {
        setIsLoading(true)
        try {
            const result = await toggleSubscriptionPlanStatus(id)
            if (result.success) {
                toast.success("Status alterado!")
                router.refresh()
            } else {
                toast.error(result.message || "Erro ao alterar status")
            }
        } catch (error) {
            toast.error("Erro inesperado")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Planos de Assinatura</h1>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => handleOpenDialog()}>
                            <Plus className="mr-2 h-4 w-4" /> Novo Plano
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{editingPlan ? "Editar Plano" : "Novo Plano"}</DialogTitle>
                            <DialogDescription>
                                Configure os detalhes do plano de assinatura.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nome</Label>
                                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Premium" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="price">Preço (R$)</Label>
                                    <Input id="price" type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Descrição</Label>
                                <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descrição curta..." />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="interval">Intervalo</Label>
                                <Select value={interval} onValueChange={setInterval}>
                                    <SelectTrigger>
                                        <SelectValue />
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
                                {features.map((feature, index) => (
                                    <div key={index} className="flex gap-2">
                                        <Input
                                            value={feature}
                                            onChange={(e) => handleFeatureChange(index, e.target.value)}
                                            placeholder="Ex: Cardápio Digital"
                                        />
                                        <Button variant="ghost" size="icon" onClick={() => removeFeature(index)} disabled={features.length === 1}>
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                                <Button type="button" variant="outline" size="sm" onClick={addFeature} className="mt-2">
                                    <Plus className="mr-2 h-4 w-4" /> Adicionar Funcionalidade
                                </Button>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="maxProducts">Máx. Produtos (Opcional)</Label>
                                    <Input id="maxProducts" type="number" value={maxProducts} onChange={(e) => setMaxProducts(e.target.value)} placeholder="Ilimitado" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="maxOrders">Máx. Pedidos (Opcional)</Label>
                                    <Input id="maxOrders" type="number" value={maxOrders} onChange={(e) => setMaxOrders(e.target.value)} placeholder="Ilimitado" />
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox id="isActive" checked={isActive} onCheckedChange={(checked) => setIsActive(checked as boolean)} />
                                <Label htmlFor="isActive">Plano Ativo</Label>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                            <Button onClick={handleSubmit} disabled={isLoading}>
                                {isLoading ? "Salvando..." : "Salvar"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {plans.map((plan) => (
                    <Card key={plan.id} className={!plan.isActive ? "opacity-75 bg-gray-50" : ""}>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <CardTitle>{plan.name}</CardTitle>
                                <Badge variant={plan.isActive ? "default" : "secondary"}>
                                    {plan.isActive ? "Ativo" : "Inativo"}
                                </Badge>
                            </div>
                            <CardDescription>{plan.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="text-3xl font-bold">
                                {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(plan.price)}
                                <span className="text-sm font-normal text-muted-foreground">
                                    /{plan.interval === "MONTHLY" ? "mês" : plan.interval === "ANNUAL" ? "ano" : "período"}
                                </span>
                            </div>
                            <ul className="space-y-2 text-sm">
                                {plan.features.map((feature, i) => (
                                    <li key={i} className="flex items-center gap-2">
                                        <Check className="h-4 w-4 text-green-500" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                            <div className="text-xs text-muted-foreground pt-4 border-t">
                                {plan._count.restaurants} assinantes ativos
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleOpenDialog(plan)}>
                                <Pencil className="mr-2 h-4 w-4" /> Editar
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleToggleStatus(plan.id)}>
                                <Power className="mr-2 h-4 w-4" /> {plan.isActive ? "Inativar" : "Ativar"}
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    )
}
