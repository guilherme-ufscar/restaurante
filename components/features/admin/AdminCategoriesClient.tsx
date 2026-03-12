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
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Plus, Pencil, Trash, Power, Image as ImageIcon } from "lucide-react"
import { toast } from "react-hot-toast"
import { createCategory, updateCategory, deleteCategory, toggleCategoryStatus } from "@/actions/admin"

interface Category {
    id: string
    name: string
    slug: string
    description: string | null
    image: string | null
    isActive: boolean
    _count: {
        restaurants: number
    }
}

interface AdminCategoriesClientProps {
    categories: Category[]
}

export default function AdminCategoriesClient({ categories }: AdminCategoriesClientProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingCategory, setEditingCategory] = useState<Category | null>(null)

    // Form states
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [image, setImage] = useState("")
    const [isActive, setIsActive] = useState(true)

    const resetForm = () => {
        setName("")
        setDescription("")
        setImage("")
        setIsActive(true)
        setEditingCategory(null)
    }

    const handleOpenDialog = (category?: Category) => {
        if (category) {
            setEditingCategory(category)
            setName(category.name)
            setDescription(category.description || "")
            setImage(category.image || "")
            setIsActive(category.isActive)
        } else {
            resetForm()
        }
        setIsDialogOpen(true)
    }

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setImage(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleSubmit = async () => {
        if (!name) {
            toast.error("Nome é obrigatório")
            return
        }

        setIsLoading(true)
        try {
            const data = { name, description, image, isActive }
            let result

            if (editingCategory) {
                result = await updateCategory(editingCategory.id, data)
            } else {
                result = await createCategory(data)
            }

            if (result.success) {
                toast.success(editingCategory ? "Categoria atualizada!" : "Categoria criada!")
                setIsDialogOpen(false)
                resetForm()
                router.refresh()
            } else {
                toast.error(result.message || "Erro ao salvar categoria")
            }
        } catch (error) {
            toast.error("Erro inesperado")
        } finally {
            setIsLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir esta categoria?")) return

        setIsLoading(true)
        try {
            const result = await deleteCategory(id)
            if (result.success) {
                toast.success("Categoria excluída!")
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
            const result = await toggleCategoryStatus(id)
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
                <h1 className="text-3xl font-bold tracking-tight">Categorias</h1>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => handleOpenDialog()}>
                            <Plus className="mr-2 h-4 w-4" /> Nova Categoria
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingCategory ? "Editar Categoria" : "Nova Categoria"}</DialogTitle>
                            <DialogDescription>
                                Preencha os dados da categoria abaixo.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nome</Label>
                                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Lanches" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Descrição</Label>
                                <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descrição curta..." />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="image">Imagem</Label>
                                <div className="flex items-center gap-4">
                                    {image && (
                                        <div className="h-16 w-16 rounded-md overflow-hidden border">
                                            <img src={image} alt="Preview" className="h-full w-full object-cover" />
                                        </div>
                                    )}
                                    <Input id="image" type="file" accept="image/*" onChange={handleImageUpload} />
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox id="isActive" checked={isActive} onCheckedChange={(checked) => setIsActive(checked as boolean)} />
                                <Label htmlFor="isActive">Categoria Ativa</Label>
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
                            <TableHead>Imagem</TableHead>
                            <TableHead>Nome</TableHead>
                            <TableHead>Slug</TableHead>
                            <TableHead>Restaurantes</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {categories.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                                    Nenhuma categoria cadastrada.
                                </TableCell>
                            </TableRow>
                        ) : (
                            categories.map((category) => (
                                <TableRow key={category.id}>
                                    <TableCell>
                                        <div className="h-10 w-10 rounded-md bg-gray-100 flex items-center justify-center overflow-hidden">
                                            {category.image ? (
                                                <img src={category.image} alt={category.name} className="h-full w-full object-cover" />
                                            ) : (
                                                <ImageIcon className="h-5 w-5 text-gray-400" />
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium">{category.name}</TableCell>
                                    <TableCell className="text-muted-foreground">{category.slug}</TableCell>
                                    <TableCell>{category._count.restaurants}</TableCell>
                                    <TableCell>
                                        <Badge variant={category.isActive ? "default" : "secondary"}>
                                            {category.isActive ? "Ativa" : "Inativa"}
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
                                                <DropdownMenuItem onClick={() => handleOpenDialog(category)}>
                                                    <Pencil className="mr-2 h-4 w-4" /> Editar
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleToggleStatus(category.id)}>
                                                    <Power className="mr-2 h-4 w-4" /> {category.isActive ? "Inativar" : "Ativar"}
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(category.id)}>
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
