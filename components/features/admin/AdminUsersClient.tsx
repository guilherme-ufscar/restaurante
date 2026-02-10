"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, ChevronLeft, ChevronRight, UserCog } from "lucide-react"
import { toast } from "react-hot-toast"
import { changeUserRole } from "@/actions/admin"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface User {
    id: string
    name: string | null
    email: string | null
    image: string | null
    role: "USER" | "RESTAURANT" | "ADMIN"
    createdAt: string
}

interface AdminUsersClientProps {
    users: User[]
    total: number
    currentPage: number
    totalPages: number
}

export default function AdminUsersClient({ users, total, currentPage, totalPages }: AdminUsersClientProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "")
    const [roleFilter, setRoleFilter] = useState(searchParams.get("role") || "all")
    const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false)
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const [newRole, setNewRole] = useState<"USER" | "RESTAURANT" | "ADMIN">("USER")
    const [isLoading, setIsLoading] = useState(false)

    const handleSearch = () => {
        const params = new URLSearchParams(window.location.search)
        if (searchTerm) params.set("search", searchTerm)
        else params.delete("search")
        params.set("page", "1")
        router.push(`?${params.toString()}`)
    }

    const handleRoleFilterChange = (value: string) => {
        setRoleFilter(value)
        const params = new URLSearchParams(window.location.search)
        if (value !== "all") params.set("role", value)
        else params.delete("role")
        params.set("page", "1")
        router.push(`?${params.toString()}`)
    }

    const handlePageChange = (page: number) => {
        const params = new URLSearchParams(window.location.search)
        params.set("page", page.toString())
        router.push(`?${params.toString()}`)
    }

    const openRoleDialog = (user: User) => {
        setSelectedUser(user)
        setNewRole(user.role)
        setIsRoleDialogOpen(true)
    }

    const handleRoleChange = async () => {
        if (!selectedUser) return

        setIsLoading(true)
        try {
            const result = await changeUserRole(selectedUser.id, newRole)
            if (result.success) {
                toast.success("Permissão alterada com sucesso!")
                setIsRoleDialogOpen(false)
                router.refresh()
            } else {
                toast.error(result.message || "Erro ao alterar permissão")
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
                <h1 className="text-3xl font-bold tracking-tight">Usuários ({total})</h1>
            </div>

            <div className="flex gap-4 items-center">
                <div className="flex-1 flex gap-2 max-w-sm">
                    <Input
                        placeholder="Buscar por nome ou email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    />
                    <Button variant="ghost" size="icon" onClick={handleSearch}>
                        <Search className="h-4 w-4" />
                    </Button>
                </div>
                <Select value={roleFilter} onValueChange={handleRoleFilterChange}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filtrar por Permissão" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todas</SelectItem>
                        <SelectItem value="USER">Usuário</SelectItem>
                        <SelectItem value="RESTAURANT">Restaurante</SelectItem>
                        <SelectItem value="ADMIN">Administrador</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Usuário</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Permissão</TableHead>
                            <TableHead>Cadastro</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                    Nenhum usuário encontrado.
                                </TableCell>
                            </TableRow>
                        ) : (
                            users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={user.image || ""} />
                                                <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <span className="font-medium">{user.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>
                                        <Badge variant={user.role === "ADMIN" ? "destructive" : user.role === "RESTAURANT" ? "default" : "secondary"}>
                                            {user.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {format(new Date(user.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm" onClick={() => openRoleDialog(user)}>
                                            <UserCog className="mr-2 h-4 w-4" /> Alterar Role
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-end space-x-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                >
                    <ChevronLeft className="h-4 w-4" />
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
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>

            <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Alterar Permissão</DialogTitle>
                        <DialogDescription>
                            Alterar a permissão do usuário {selectedUser?.name}.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Label>Nova Permissão</Label>
                        <Select value={newRole} onValueChange={(val: any) => setNewRole(val)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="USER">Usuário (Padrão)</SelectItem>
                                <SelectItem value="RESTAURANT">Restaurante</SelectItem>
                                <SelectItem value="ADMIN">Administrador</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsRoleDialogOpen(false)}>Cancelar</Button>
                        <Button onClick={handleRoleChange} disabled={isLoading}>
                            Salvar Alteração
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
