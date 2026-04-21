"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Plus, Pencil, Trash2, CreditCard } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { createPaymentMethod, updatePaymentMethod, deletePaymentMethod, togglePaymentMethodStatus } from "@/actions/admin"
import { toast } from "react-hot-toast"

const paymentMethodSchema = z.object({
    name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres").max(50),
    isActive: z.boolean().default(true)
})

type PaymentMethodFormValues = z.infer<typeof paymentMethodSchema>

interface PaymentMethod {
    id: string
    name: string
    isActive: boolean
    _count: {
        restaurants: number
    }
}

export default function PaymentMethodsClient({ paymentMethods }: { paymentMethods: PaymentMethod[] }) {
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm({
        resolver: zodResolver(paymentMethodSchema),
        defaultValues: {
            name: "",
            isActive: true
        }
    })

    const handleCreate = async (data: PaymentMethodFormValues) => {
        setIsSubmitting(true)
        try {
            const result = await createPaymentMethod(data)
            if (result.success) {
                toast.success("Método de pagamento criado!")
                setIsCreateOpen(false)
                form.reset()
            } else {
                toast.error(result.message || "Erro ao criar método")
            }
        } catch (error) {
            toast.error("Erro ao processar requisição")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleUpdate = async (data: PaymentMethodFormValues) => {
        if (!editingMethod) return
        setIsSubmitting(true)
        try {
            const result = await updatePaymentMethod(editingMethod.id, data)
            if (result.success) {
                toast.success("Método de pagamento atualizado!")
                setEditingMethod(null)
            } else {
                toast.error(result.message || "Erro ao atualizar método")
            }
        } catch (error) {
            toast.error("Erro ao processar requisição")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async () => {
        if (!deletingId) return
        setIsSubmitting(true)
        try {
            const result = await deletePaymentMethod(deletingId)
            if (result.success) {
                toast.success("Método de pagamento excluído!")
                setDeletingId(null)
            } else {
                toast.error(result.message || "Erro ao excluir método")
            }
        } catch (error) {
            toast.error("Erro ao processar requisição")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleToggleStatus = async (id: string) => {
        try {
            const result = await togglePaymentMethodStatus(id)
            if (result.success) {
                toast.success("Status atualizado!")
            } else {
                toast.error(result.message || "Erro ao atualizar status")
            }
        } catch (error) {
            toast.error("Erro ao processar requisição")
        }
    }

    const openEditDialog = (method: PaymentMethod) => {
        setEditingMethod(method)
        form.reset({
            name: method.name,
            isActive: method.isActive
        })
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Métodos de Pagamento</h1>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => form.reset()}>
                            <Plus className="mr-2 h-4 w-4" />
                            Novo Método
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Novo Método de Pagamento</DialogTitle>
                            <DialogDescription>
                                Adicione um novo método de pagamento disponível para os restaurantes.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={form.handleSubmit(handleCreate)} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nome</Label>
                                <Input id="name" {...form.register("name")} />
                                {form.formState.errors.name && (
                                    <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
                                )}
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
                                    {isSubmitting ? "Criando..." : "Criar Método"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="rounded-md border bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]"></TableHead>
                            <TableHead>Nome</TableHead>
                            <TableHead>Restaurantes Usando</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paymentMethods.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                    Nenhum método de pagamento cadastrado.
                                </TableCell>
                            </TableRow>
                        ) : (
                            paymentMethods.map((method) => (
                                <TableRow key={method.id}>
                                    <TableCell>
                                        <CreditCard className="h-5 w-5 text-gray-500" />
                                    </TableCell>
                                    <TableCell className="font-medium">{method.name}</TableCell>
                                    <TableCell>{method._count.restaurants}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center space-x-2">
                                            <Switch
                                                checked={method.isActive}
                                                onCheckedChange={() => handleToggleStatus(method.id)}
                                            />
                                            <span className="text-sm text-muted-foreground">
                                                {method.isActive ? "Ativo" : "Inativo"}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(method)}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setDeletingId(method.id)}
                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                            disabled={method._count.restaurants > 0}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Edit Dialog */}
            <Dialog open={!!editingMethod} onOpenChange={(open) => !open && setEditingMethod(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar Método de Pagamento</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={form.handleSubmit(handleUpdate)} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-name">Nome</Label>
                            <Input id="edit-name" {...form.register("name")} />
                            {form.formState.errors.name && (
                                <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
                            )}
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

            {/* Delete Alert */}
            <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Excluir Método de Pagamento?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Excluindo..." : "Confirmar Exclusão"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
