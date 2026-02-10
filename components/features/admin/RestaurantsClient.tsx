

"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
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
import { Textarea } from "@/components/ui/textarea"
import { MoreVertical, Search, Eye, CheckCircle, XCircle, Ban } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { approveRestaurant, rejectRestaurant, suspendRestaurant } from "@/actions/admin"
import { toast } from "react-hot-toast"

interface Restaurant {
    id: string
    name: string
    logo: string | null
    isApproved: boolean
    rejectedAt: Date | null
    isActive: boolean
    createdAt: Date
    subscriptionStatus: string
    owner: {
        name: string | null
        email: string
    }
    category: {
        name: string
    }
    subscriptionPlan: {
        name: string
    } | null
}

interface RestaurantsClientProps {
    restaurants: any[] // Using any to bypass strict Decimal serialization types for now
    pendingCount: number
}

export default function RestaurantsClient({ restaurants, pendingCount }: RestaurantsClientProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [activeTab, setActiveTab] = useState(searchParams.get("status") || "all")
    const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "")

    const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
    const [selectedRestaurantId, setSelectedRestaurantId] = useState<string | null>(null)
    const [rejectionReason, setRejectionReason] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    const [approveDialogOpen, setApproveDialogOpen] = useState(false)
    const [suspendDialogOpen, setSuspendDialogOpen] = useState(false)

    const handleTabChange = (value: string) => {
        setActiveTab(value)
        const params = new URLSearchParams(searchParams.toString())
        if (value === "all") {
            params.delete("status")
        } else {
            params.set("status", value)
        }
        router.push(`/admin/restaurants?${params.toString()}`)
    }

    const handleSearch = (value: string) => {
        setSearchTerm(value)
        const params = new URLSearchParams(searchParams.toString())
        if (value) {
            params.set("search", value)
        } else {
            params.delete("search")
        }
        // Debounce could be added here
        router.push(`/admin/restaurants?${params.toString()}`)
    }

    const handleApprove = async () => {
        if (!selectedRestaurantId) return
        setIsSubmitting(true)
        try {
            const result = await approveRestaurant(selectedRestaurantId)
            if (result.success) {
                toast.success("Restaurante aprovado com sucesso!")
                setApproveDialogOpen(false)
            } else {
                toast.error(result.message || "Erro ao aprovar restaurante")
            }
        } catch (error) {
            toast.error("Erro ao processar requisição")
        } finally {
            setIsSubmitting(false)
            setSelectedRestaurantId(null)
        }
    }

    const handleReject = async () => {
        if (!selectedRestaurantId) return
        if (rejectionReason.length < 20) {
            toast.error("O motivo deve ter pelo menos 20 caracteres")
            return
        }
        setIsSubmitting(true)
        try {
            const result = await rejectRestaurant(selectedRestaurantId, rejectionReason)
            if (result.success) {
                toast.success("Restaurante rejeitado com sucesso!")
                setRejectDialogOpen(false)
                setRejectionReason("")
            } else {
                toast.error(result.message || "Erro ao rejeitar restaurante")
            }
        } catch (error) {
            toast.error("Erro ao processar requisição")
        } finally {
            setIsSubmitting(false)
            setSelectedRestaurantId(null)
        }
    }

    const handleSuspend = async () => {
        if (!selectedRestaurantId) return
        setIsSubmitting(true)
        try {
            const result = await suspendRestaurant(selectedRestaurantId)
            if (result.success) {
                toast.success("Restaurante suspenso com sucesso!")
                setSuspendDialogOpen(false)
            } else {
                toast.error(result.message || "Erro ao suspender restaurante")
            }
        } catch (error) {
            toast.error("Erro ao processar requisição")
        } finally {
            setIsSubmitting(false)
            setSelectedRestaurantId(null)
        }
    }

    const getApprovalStatusBadge = (restaurant: Restaurant) => {
        if (restaurant.rejectedAt) {
            return <Badge variant="destructive">Rejeitado</Badge>
        }
        if (restaurant.isApproved) {
            return <Badge className="bg-green-500 hover:bg-green-600">Aprovado</Badge>
        }
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Pendente</Badge>
    }

    const filteredRestaurants = restaurants.filter(r => {
        const matchesSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.owner.email.toLowerCase().includes(searchTerm.toLowerCase())

        if (activeTab === "all") return matchesSearch
        if (activeTab === "pending") return matchesSearch && !r.isApproved && !r.rejectedAt
        if (activeTab === "approved") return matchesSearch && r.isApproved
        if (activeTab === "rejected") return matchesSearch && r.rejectedAt
        return matchesSearch
    })

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Restaurantes</h1>
                <Badge variant="secondary" className="text-sm">
                    {pendingCount} Pendentes
                </Badge>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Buscar por nome ou email..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                    />
                </div>
            </div>

            <Tabs defaultValue="all" value={activeTab} onValueChange={handleTabChange}>
                <TabsList>
                    <TabsTrigger value="all">Todos</TabsTrigger>
                    <TabsTrigger value="pending">Pendentes</TabsTrigger>
                    <TabsTrigger value="approved">Aprovados</TabsTrigger>
                    <TabsTrigger value="rejected">Rejeitados</TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="mt-4">
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Restaurante</TableHead>
                                    <TableHead>Proprietário</TableHead>
                                    <TableHead>Categoria</TableHead>
                                    <TableHead>Plano</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Data</TableHead>
                                    <TableHead className="text-right">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredRestaurants.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-24 text-center">
                                            Nenhum restaurante encontrado.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredRestaurants.map((restaurant) => (
                                        <TableRow key={restaurant.id}>
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-3">
                                                    {restaurant.logo ? (
                                                        <div className="relative h-10 w-10 rounded-full overflow-hidden">
                                                            <Image src={restaurant.logo} alt={restaurant.name} fill className="object-cover" />
                                                        </div>
                                                    ) : (
                                                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                                                            <span className="text-xs font-bold">{restaurant.name.substring(0, 2).toUpperCase()}</span>
                                                        </div>
                                                    )}
                                                    <span>{restaurant.name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{restaurant.owner.name}</span>
                                                    <span className="text-xs text-muted-foreground">{restaurant.owner.email}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>{restaurant.category.name}</TableCell>
                                            <TableCell>
                                                {restaurant.subscriptionPlan ? (
                                                    <Badge variant="outline">{restaurant.subscriptionPlan.name}</Badge>
                                                ) : (
                                                    <span className="text-muted-foreground text-sm">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {getApprovalStatusBadge(restaurant)}
                                            </TableCell>
                                            <TableCell>
                                                {format(new Date(restaurant.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/admin/restaurants/${restaurant.id}`}>
                                                                <Eye className="mr-2 h-4 w-4" />
                                                                Ver Detalhes
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        {!restaurant.isApproved && !restaurant.rejectedAt && (
                                                            <>
                                                                <DropdownMenuItem onClick={() => {
                                                                    setSelectedRestaurantId(restaurant.id)
                                                                    setApproveDialogOpen(true)
                                                                }}>
                                                                    <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                                                                    Aprovar
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => {
                                                                    setSelectedRestaurantId(restaurant.id)
                                                                    setRejectDialogOpen(true)
                                                                }}>
                                                                    <XCircle className="mr-2 h-4 w-4 text-red-600" />
                                                                    Rejeitar
                                                                </DropdownMenuItem>
                                                            </>
                                                        )}
                                                        {restaurant.isApproved && restaurant.isActive && (
                                                            <DropdownMenuItem onClick={() => {
                                                                setSelectedRestaurantId(restaurant.id)
                                                                setSuspendDialogOpen(true)
                                                            }}>
                                                                <Ban className="mr-2 h-4 w-4 text-orange-600" />
                                                                Suspender
                                                            </DropdownMenuItem>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </TabsContent>
            </Tabs>

            {/* Dialogs */}
            <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Rejeitar Restaurante</DialogTitle>
                        <DialogDescription>
                            Por favor, informe o motivo da rejeição. Isso será enviado ao proprietário.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Textarea
                            placeholder="Motivo da rejeição (mínimo 20 caracteres)"
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            rows={4}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>Cancelar</Button>
                        <Button
                            variant="destructive"
                            onClick={handleReject}
                            disabled={isSubmitting || rejectionReason.length < 20}
                        >
                            {isSubmitting ? "Rejeitando..." : "Confirmar Rejeição"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Aprovar Restaurante?</AlertDialogTitle>
                        <AlertDialogDescription>
                            O restaurante ficará visível na plataforma e o proprietário poderá começar a vender.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleApprove}
                            className="bg-green-600 hover:bg-green-700"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Aprovando..." : "Confirmar Aprovação"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={suspendDialogOpen} onOpenChange={setSuspendDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Suspender Restaurante?</AlertDialogTitle>
                        <AlertDialogDescription>
                            O restaurante ficará invisível na plataforma e não poderá receber novos pedidos.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleSuspend}
                            className="bg-orange-600 hover:bg-orange-700"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Suspendendo..." : "Confirmar Suspensão"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
