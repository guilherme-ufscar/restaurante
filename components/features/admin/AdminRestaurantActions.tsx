"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
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
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "react-hot-toast"
import { approveRestaurant, rejectRestaurant, suspendRestaurant, activateRestaurant } from "@/actions/admin"
import { CheckCircle, XCircle, Ban, PlayCircle } from "lucide-react"

interface AdminRestaurantActionsProps {
    restaurantId: string
    isApproved: boolean
    isRejected: boolean
    isActive: boolean
}

export default function AdminRestaurantActions({
    restaurantId,
    isApproved,
    isRejected,
    isActive
}: AdminRestaurantActionsProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
    const [rejectionReason, setRejectionReason] = useState("")

    const handleApprove = async () => {
        setIsLoading(true)
        try {
            const result = await approveRestaurant(restaurantId)
            if (result.success) {
                toast.success("Restaurante aprovado!")
                router.refresh()
            } else {
                toast.error(result.message || "Erro ao aprovar")
            }
        } catch (error) {
            toast.error("Erro inesperado")
        } finally {
            setIsLoading(false)
        }
    }

    const handleReject = async () => {
        if (rejectionReason.length < 10) {
            toast.error("Motivo muito curto")
            return
        }
        setIsLoading(true)
        try {
            const result = await rejectRestaurant(restaurantId, rejectionReason)
            if (result.success) {
                toast.success("Restaurante rejeitado")
                setRejectDialogOpen(false)
                router.refresh()
            } else {
                toast.error(result.message || "Erro ao rejeitar")
            }
        } catch (error) {
            toast.error("Erro inesperado")
        } finally {
            setIsLoading(false)
        }
    }

    const handleSuspend = async () => {
        setIsLoading(true)
        try {
            const result = await suspendRestaurant(restaurantId)
            if (result.success) {
                toast.success("Restaurante suspenso")
                router.refresh()
            } else {
                toast.error(result.message || "Erro ao suspender")
            }
        } catch (error) {
            toast.error("Erro inesperado")
        } finally {
            setIsLoading(false)
        }
    }

    const handleActivate = async () => {
        setIsLoading(true)
        try {
            const result = await activateRestaurant(restaurantId)
            if (result.success) {
                toast.success("Restaurante ativado")
                router.refresh()
            } else {
                toast.error(result.message || "Erro ao ativar")
            }
        } catch (error) {
            toast.error("Erro inesperado")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex gap-2">
            {!isApproved && !isRejected && (
                <>
                    <Button className="bg-green-600 hover:bg-green-700" onClick={handleApprove} disabled={isLoading}>
                        <CheckCircle className="mr-2 h-4 w-4" /> Aprovar
                    </Button>
                    <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="destructive" disabled={isLoading}>
                                <XCircle className="mr-2 h-4 w-4" /> Rejeitar
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Rejeitar Restaurante</DialogTitle>
                                <DialogDescription>
                                    Explique o motivo da rejeição. O proprietário receberá esta mensagem.
                                </DialogDescription>
                            </DialogHeader>
                            <Textarea
                                placeholder="Motivo da rejeição (mínimo 10 caracteres)"
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                            />
                            <DialogFooter>
                                <Button variant="ghost" onClick={() => setRejectDialogOpen(false)}>Cancelar</Button>
                                <Button variant="destructive" onClick={handleReject} disabled={isLoading}>
                                    Confirmar Rejeição
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </>
            )}

            {isApproved && isActive && (
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" disabled={isLoading}>
                            <Ban className="mr-2 h-4 w-4" /> Suspender
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Suspender Restaurante?</AlertDialogTitle>
                            <AlertDialogDescription>
                                O restaurante deixará de aparecer na plataforma e não poderá receber novos pedidos.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={handleSuspend} className="bg-red-600 hover:bg-red-700">
                                Suspender
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}

            {isApproved && !isActive && (
                <Button variant="outline" className="text-green-600 border-green-200 hover:bg-green-50" onClick={handleActivate} disabled={isLoading}>
                    <PlayCircle className="mr-2 h-4 w-4" /> Reativar
                </Button>
            )}
        </div>
    )
}
