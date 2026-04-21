"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
import { Checkbox } from "@/components/ui/checkbox"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Plus, Pencil, Trash, Power, CreditCard } from "lucide-react"
import { toast } from "react-hot-toast"
import { createPaymentMethod, updatePaymentMethod, deletePaymentMethod, togglePaymentMethodStatus } from "@/actions/admin"

interface PaymentMethod {
    id: string
    name: string
    isActive: boolean
    _count: {
        restaurants: number
    }
}

interface AdminPaymentMethodsClientProps {
    paymentMethods: PaymentMethod[]
}

export default function AdminPaymentMethodsClient({ paymentMethods }: AdminPaymentMethodsClientProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null)

    const [name, setName] = useState("")
    const [isActive, setIsActive] = useState(true)

    const resetForm = () => {
        setName("")
        setIsActive(true)
        setEditingMethod(null)
    }

    const handleOpenDialog = (method?: PaymentMethod) => {
        if (method) {
            setEditingMethod(method)
            setName(method.name)
            setIsActive(method.isActive)
        } else {
            resetForm()
        }
        setIsDialogOpen(true)
    }

    const handleSubmit = async () => {
        if (!name) {
            toast.error("Nome é obrigatório")
            return
        }

        setIsLoading(true)
        try {
            const data = { name, isActive }
            let result

            if (editingMethod) {
                result = await updatePaymentMethod(editingMethod.id, data)
            } else {
                result = await createPaymentMethod(data)
            }

            if (result.success) {
                toast.success(editingMethod ? "Método atualizado!" : "Método criado!")
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

    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir este método?")) return

        setIsLoading(true)
        try {
            const result = await deletePaymentMethod(id)
            if (result.success) {
                toast.success("Método excluído!")
                router.refresh()
            } else {
                toast.error(result.message || "Erro ao excluir")
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
            const result = await togglePaymentMethodStatus(id)
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
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Métodos de Pagamento</h1>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => handleOpenDialog()}>
                            <Plus className="mr-2 h-4 w-4" /> Novo Método
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingMethod ? "Editar Método" : "Novo Método"}</DialogTitle>
                            <DialogDescription>
                                Preencha os dados do método de pagamento.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nome</Label>
                                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Cartão de Crédito" />
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox id="isActive" checked={isActive} onCheckedChange={(checked) => setIsActive(checked as boolean)} />
                                <Label htmlFor="isActive">Ativo</Label>
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

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nome</TableHead>
                            <TableHead>Restaurantes</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paymentMethods.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                                    Nenhum método cadastrado.
                                </TableCell>
                            </TableRow>
                        ) : (
                            paymentMethods.map((method) => (
                                <TableRow key={method.id}>
                                    <TableCell className="font-medium flex items-center gap-2">
                                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                                        {method.name}
                                    </TableCell>
                                    <TableCell>{method._count.restaurants}</TableCell>
                                    <TableCell>
                                        <Badge variant={method.isActive ? "default" : "secondary"}>
                                            {method.isActive ? "Ativo" : "Inativo"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Abrir menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => handleOpenDialog(method)}>
                                                    <Pencil className="mr-2 h-4 w-4" /> Editar
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleToggleStatus(method.id)}>
                                                    <Power className="mr-2 h-4 w-4" /> {method.isActive ? "Inativar" : "Ativar"}
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(method.id)}>
                                                    <Trash className="mr-2 h-4 w-4" /> Excluir
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
