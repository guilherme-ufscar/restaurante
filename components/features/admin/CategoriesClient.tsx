"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { DynamicIcon } from "@/components/ui/DynamicIcon"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Plus, Pencil, Trash2, Store, Power } from "lucide-react"
import Image from "next/image"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { createCategory, updateCategory, deleteCategory, toggleCategoryStatus } from "@/actions/admin"
import { toast } from "react-hot-toast"

const categorySchema = z.object({
    name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres").max(50),
    description: z.string().max(200).optional(),
    image: z.string().optional(),
    icon: z.string().optional(),
    isActive: z.boolean().default(true)
})

type CategoryFormValues = z.infer<typeof categorySchema>

interface Category {
    id: string
    name: string
    slug: string
    description: string | null
    image: string | null
    icon: string | null
    isActive: boolean
    _count: {
        restaurants: number
    }
}

export default function CategoriesClient({ categories }: { categories: Category[] }) {
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [editingCategory, setEditingCategory] = useState<Category | null>(null)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm({
        resolver: zodResolver(categorySchema),
        defaultValues: {
            name: "",
            description: "",
            image: "",
            icon: "",
            isActive: true
        }
    })

    const availableIcons = [
        { value: 'Pizza', label: 'Pizza' },
        { value: 'Beef', label: 'Hambúrguer' },
        { value: 'Fish', label: 'Peixe' },
        { value: 'Coffee', label: 'Café' },
        { value: 'IceCream', label: 'Sorvete' },
        { value: 'Salad', label: 'Salada' },
        { value: 'Wine', label: 'Vinho' },
        { value: 'Cookie', label: 'Cookie' },
        { value: 'Cake', label: 'Bolo' },
        { value: 'Soup', label: 'Sopa' },
    ]

    const handleCreate = async (data: CategoryFormValues) => {
        setIsSubmitting(true)
        try {
            const result = await createCategory(data)
            if (result.success) {
                toast.success("Categoria criada com sucesso!")
                setIsCreateOpen(false)
                form.reset()
            } else {
                toast.error(result.message || "Erro ao criar categoria")
            }
        } catch (error) {
            toast.error("Erro ao processar requisição")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleUpdate = async (data: CategoryFormValues) => {
        if (!editingCategory) return
        setIsSubmitting(true)
        try {
            const result = await updateCategory(editingCategory.id, data)
            if (result.success) {
                toast.success("Categoria atualizada com sucesso!")
                setEditingCategory(null)
            } else {
                toast.error(result.message || "Erro ao atualizar categoria")
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
            const result = await deleteCategory(deletingId)
            if (result.success) {
                toast.success("Categoria excluída com sucesso!")
                setDeletingId(null)
            } else {
                toast.error(result.message || "Erro ao excluir categoria")
            }
        } catch (error) {
            toast.error("Erro ao processar requisição")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleToggleStatus = async (id: string) => {
        try {
            const result = await toggleCategoryStatus(id)
            if (result.success) {
                toast.success("Status atualizado!")
            } else {
                toast.error(result.message || "Erro ao atualizar status")
            }
        } catch (error) {
            toast.error("Erro ao processar requisição")
        }
    }

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                if (isEdit) {
                    // For edit mode we might need to handle this differently if using separate form instance
                    // But here we can just update the form values if we reset the form with editing data
                }
                form.setValue("image", reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const openEditDialog = (category: Category) => {
        setEditingCategory(category)
        form.reset({
            name: category.name,
            description: category.description || "",
            image: category.image || "",
            icon: category.icon || "",
            isActive: category.isActive
        })
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Categorias</h1>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => form.reset()}>
                            <Plus className="mr-2 h-4 w-4" />
                            Nova Categoria
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Nova Categoria</DialogTitle>
                            <DialogDescription>
                                Crie uma nova categoria para os restaurantes.
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
                            <div className="space-y-2">
                                <Label htmlFor="description">Descrição</Label>
                                <Textarea id="description" {...form.register("description")} />
                            </div>
                            <div className="space-y-2">
                                <Label>Ícone</Label>
                                <Select
                                    value={form.watch("icon")}
                                    onValueChange={(value) => form.setValue("icon", value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione um ícone" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableIcons.map((icon) => (
                                            <SelectItem key={icon.value} value={icon.value}>
                                                <div className="flex items-center gap-2">
                                                    <DynamicIcon name={icon.value} className="w-4 h-4" />
                                                    <span>{icon.label}</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="image">Imagem</Label>
                                <Input
                                    id="image"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleImageUpload(e, false)}
                                />
                                {form.watch("image") && (
                                    <div className="relative h-32 w-full mt-2 rounded-md overflow-hidden">
                                        <Image src={form.watch("image")!} alt="Preview" fill className="object-cover" />
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="isActive"
                                    checked={form.watch("isActive")}
                                    onCheckedChange={(checked) => form.setValue("isActive", checked)}
                                />
                                <Label htmlFor="isActive">Ativa</Label>
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? "Criando..." : "Criar Categoria"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {categories.map((category) => (
                    <Card key={category.id} className="overflow-hidden">
                        <div className="relative h-32 bg-gray-100">
                            {category.image ? (
                                <Image src={category.image} alt={category.name} fill className="object-cover" />
                            ) : (
                                <div className="flex h-full items-center justify-center text-gray-400">
                                    {category.icon ? (
                                        <DynamicIcon name={category.icon} className="h-10 w-10" />
                                    ) : (
                                        <Store className="h-10 w-10" />
                                    )}
                                </div>
                            )}
                            <div className="absolute top-2 right-2">
                                <Badge variant={category.isActive ? "default" : "secondary"}>
                                    {category.isActive ? "Ativa" : "Inativa"}
                                </Badge>
                            </div>
                        </div>
                        <CardHeader className="pb-2">
                            <CardTitle className="flex justify-between items-center">
                                {category.name}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pb-2">
                            <p className="text-sm text-muted-foreground line-clamp-2 h-10">
                                {category.description || "Sem descrição"}
                            </p>
                            <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                                <Store className="h-4 w-4" />
                                {category._count.restaurants} restaurantes
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-between pt-2">
                            <Button variant="ghost" size="sm" onClick={() => openEditDialog(category)}>
                                <Pencil className="h-4 w-4 mr-2" />
                                Editar
                            </Button>
                            <div className="flex gap-1">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleToggleStatus(category.id)}
                                    title={category.isActive ? "Desativar" : "Ativar"}
                                >
                                    <Power className={`h-4 w-4 ${category.isActive ? "text-green-600" : "text-gray-400"}`} />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setDeletingId(category.id)}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    disabled={category._count.restaurants > 0}
                                    title={category._count.restaurants > 0 ? "Não é possível excluir categoria em uso" : "Excluir"}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            {/* Edit Dialog */}
            <Dialog open={!!editingCategory} onOpenChange={(open) => !open && setEditingCategory(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar Categoria</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={form.handleSubmit(handleUpdate)} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-name">Nome</Label>
                            <Input id="edit-name" {...form.register("name")} />
                            {form.formState.errors.name && (
                                <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-description">Descrição</Label>
                            <Textarea id="edit-description" {...form.register("description")} />
                        </div>
                        <div className="space-y-2">
                            <Label>Ícone</Label>
                            <Select
                                value={form.watch("icon")}
                                onValueChange={(value) => form.setValue("icon", value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione um ícone" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableIcons.map((icon) => (
                                        <SelectItem key={icon.value} value={icon.value}>
                                            <div className="flex items-center gap-2">
                                                <DynamicIcon name={icon.value} className="w-4 h-4" />
                                                <span>{icon.label}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-image">Imagem</Label>
                            <Input
                                id="edit-image"
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageUpload(e, true)}
                            />
                            {form.watch("image") && (
                                <div className="relative h-32 w-full mt-2 rounded-md overflow-hidden">
                                    <Image src={form.watch("image")!} alt="Preview" fill className="object-cover" />
                                </div>
                            )}
                        </div>
                        <div className="flex items-center space-x-2">
                            <Switch
                                id="edit-isActive"
                                checked={form.watch("isActive")}
                                onCheckedChange={(checked) => form.setValue("isActive", checked)}
                            />
                            <Label htmlFor="edit-isActive">Ativa</Label>
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
                        <AlertDialogTitle>Excluir Categoria?</AlertDialogTitle>
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
