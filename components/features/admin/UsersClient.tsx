"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
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
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, UserCog, ChevronLeft, ChevronRight } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { changeUserRole } from "@/actions/admin"
import { toast } from "react-hot-toast"

interface User {
    id: string
    name: string | null
    email: string | null
    image: string | null
    role: string
    createdAt: Date
}

interface UsersClientProps {
    users: User[]
    totalPages: number
    currentPage: number
    totalUsers: number
}

export default function UsersClient({ users, totalPages, currentPage, totalUsers }: UsersClientProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "")
    const [activeTab, setActiveTab] = useState(searchParams.get("role") || "all")

    const [editingUser, setEditingUser] = useState<User | null>(null)
    const [newRole, setNewRole] = useState<string>("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSearch = (value: string) => {
        setSearchTerm(value)
        const params = new URLSearchParams(searchParams.toString())
        if (value) {
            params.set("search", value)
        } else {
            params.delete("search")
        }
        params.set("page", "1")
        router.push(`/admin/users?${params.toString()}`)
    }

    const handleTabChange = (value: string) => {
        setActiveTab(value)
        const params = new URLSearchParams(searchParams.toString())
        if (value === "all") {
            params.delete("role")
        } else {
            params.set("role", value)
        }
        params.set("page", "1")
        router.push(`/admin/users?${params.toString()}`)
    }

    const handlePageChange = (page: number) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set("page", page.toString())
        router.push(`/admin/users?${params.toString()}`)
    }

    const handleChangeRole = async () => {
        if (!editingUser || !newRole) return
        setIsSubmitting(true)
        try {
            const result = await changeUserRole(editingUser.id, newRole as any)
            if (result.success) {
                toast.success("Função do usuário atualizada!")
                setEditingUser(null)
            } else {
                toast.error(result.message || "Erro ao atualizar função")
            }
        } catch (error) {
            toast.error("Erro ao processar requisição")
        } finally {
            setIsSubmitting(false)
        }
    }

    const openEditDialog = (user: User) => {
        setEditingUser(user)
        setNewRole(user.role)
    }

    const getRoleBadge = (role: string) => {
        switch (role) {
            case "ADMIN":
                return <Badge variant="destructive">Admin</Badge>
            case "RESTAURANT":
                return <Badge className="bg-orange-500 hover:bg-orange-600">Restaurante</Badge>
            default:
                return <Badge variant="secondary">Cliente</Badge>
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Gerenciar Usuários</h1>
                <Badge variant="outline" className="text-lg px-4 py-1">
                    Total: {totalUsers}
                </Badge>
            </div>

            <div className="flex flex-col md:flex-row justify-between gap-4">
                <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full md:w-auto">
                    <TabsList>
                        <TabsTrigger value="all">Todos</TabsTrigger>
                        <TabsTrigger value="USER">Clientes</TabsTrigger>
                        <TabsTrigger value="RESTAURANT">Restaurantes</TabsTrigger>
                        <TabsTrigger value="ADMIN">Admins</TabsTrigger>
                    </TabsList>
                </Tabs>

                <div className="relative w-full md:w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por nome ou email..."
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="pl-8"
                    />
                </div>
            </div>

            <div className="rounded-md border bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]"></TableHead>
                            <TableHead>Nome</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Função</TableHead>
                            <TableHead>Cadastro</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    Nenhum usuário encontrado.
                                </TableCell>
                            </TableRow>
                        ) : (
                            users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell>
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={user.image || ""} />
                                            <AvatarFallback>{user.name?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                                        </Avatar>
                                    </TableCell>
                                    <TableCell className="font-medium">{user.name || "Sem nome"}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                                    <TableCell>
                                        {format(new Date(user.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm" onClick={() => openEditDialog(user)}>
                                            <UserCog className="h-4 w-4 mr-2" />
                                            Alterar Role
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {totalPages > 1 && (
                <div className="flex items-center justify-center space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage <= 1}
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Anterior
                    </Button>
                    <span className="text-sm text-muted-foreground">
                        Página {currentPage} de {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage >= totalPages}
                    >
                        Próxima
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            )}

            <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Alterar Função do Usuário</DialogTitle>
                        <DialogDescription>
                            Selecione a nova função para {editingUser?.name}.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Select value={newRole} onValueChange={setNewRole}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione uma função" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="USER">Cliente (User)</SelectItem>
                                <SelectItem value="RESTAURANT">Restaurante</SelectItem>
                                <SelectItem value="ADMIN">Administrador</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditingUser(null)}>Cancelar</Button>
                        <Button
                            onClick={handleChangeRole}
                            disabled={isSubmitting || newRole === editingUser?.role}
                        >
                            {isSubmitting ? "Salvando..." : "Salvar Alteração"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
