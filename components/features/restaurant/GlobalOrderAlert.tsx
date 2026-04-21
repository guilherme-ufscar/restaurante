"use client"

import { useRealtimeOrders } from '@/hooks/useRealtimeOrders'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { Bell, ArrowRight } from 'lucide-react'

export default function GlobalOrderAlert({ restaurantId }: { restaurantId: string }) {
    const { newOrders, clearNewOrders } = useRealtimeOrders(restaurantId)
    const router = useRouter()

    useEffect(() => {
        const handleRefresh = () => {
            console.log("Refreshing data due to new order...")
            router.refresh()
        }
        window.addEventListener('refresh-orders', handleRefresh)
        return () => window.removeEventListener('refresh-orders', handleRefresh)
    }, [router])

    useEffect(() => {
        if (newOrders.length > 0) {
            newOrders.forEach(order => {
                toast.custom((t) => (
                    <div
                        className={`${t.visible ? 'animate-enter' : 'animate-leave'
                            } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 border-l-4 border-l-green-500`}
                    >
                        <div className="flex-1 w-0 p-4">
                            <div className="flex items-start">
                                <div className="flex-shrink-0 pt-0.5">
                                    <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center animate-pulse">
                                        <Bell className="h-6 w-6 text-green-600" />
                                    </div>
                                </div>
                                <div className="ml-3 flex-1">
                                    <p className="text-sm font-bold text-gray-900">
                                        Novo Pedido Recebido!
                                    </p>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Pedido #{order.orderNumber} acaba de chegar.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex border-l border-gray-200">
                            <button
                                onClick={() => {
                                    toast.dismiss(t.id)
                                    // Não limpamos todos, apenas removemos este do toast. 
                                    // Se limparmos todos aqui, outros toasts podem sumir logicamente, mas visualmente é ok.
                                    // O hook já gerencia os "vistos".
                                    router.push(`/restaurant/dashboard/orders/${order.orderNumber}`)
                                }}
                                className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-bold text-green-600 hover:text-green-800 hover:bg-green-50 focus:outline-none transition-colors"
                            >
                                ACEITAR
                            </button>
                        </div>
                    </div>
                ), {
                    duration: Infinity, // Não somem sozinhos até clicar, para garantir que o restaurante veja
                    position: 'top-right'
                })
            })

            // Limpa o estado interno de "novos" do hook para não disparar de novo no próximo render,
            // mas os toasts já foram disparados.
            // Nota: Se limparmos imediatamente, pode dar conflito se tiver lógica dependente. 
            // Mas como usamos o toast id, tudo bem.
        }
    }, [newOrders, router])

    return null
}
