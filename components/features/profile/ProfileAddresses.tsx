
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { MapPin, Plus, Trash2 } from "lucide-react"
import AddressModal from "@/components/features/checkout/AddressModal"
import { toast } from "react-hot-toast"

interface Address {
    id: string
    street: string
    number: string
    complement?: string | null
    neighborhood: string
    city: string
    state: string
    zipCode: string
}

export default function ProfileAddresses() {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [addresses, setAddresses] = useState<Address[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const fetchAddresses = async () => {
        try {
            const response = await fetch("/api/addresses")
            if (response.ok) {
                const data = await response.json()
                setAddresses(data)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchAddresses()
    }, [])

    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza que deseja remover este endereço?")) return

        try {
            const response = await fetch(`/api/addresses/${id}`, {
                method: "DELETE",
            })

            if (response.ok) {
                toast.success("Endereço removido")
                fetchAddresses()
            } else {
                toast.error("Erro ao remover endereço")
            }
        } catch (error) {
            toast.error("Erro ao remover endereço")
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Meus Endereços
                </h2>
                <Button size="sm" onClick={() => setIsModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar
                </Button>
            </div>

            {isLoading ? (
                <div className="text-center py-4">Carregando endereços...</div>
            ) : addresses.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed">
                    <p className="text-muted-foreground mb-2">Você ainda não tem endereços cadastrados.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addresses.map((address) => (
                        <div key={address.id} className="p-4 border rounded-lg relative group bg-white">
                            <div className="pr-8">
                                <p className="font-medium text-sm">
                                    {address.street}, {address.number}
                                </p>
                                {address.complement && (
                                    <p className="text-sm text-muted-foreground">{address.complement}</p>
                                )}
                                <p className="text-sm text-muted-foreground">
                                    {address.neighborhood} - {address.city}/{address.state}
                                </p>
                                <p className="text-sm text-muted-foreground">{address.zipCode}</p>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute top-2 right-2 text-red-500 hover:text-red-600 hover:bg-red-50"
                                onClick={() => handleDelete(address.id)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>
            )}

            <AddressModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => {
                    setIsModalOpen(false)
                    fetchAddresses()
                }}
            />
        </div>
    )
}
