"use client"

import { useEffect, useRef, useState } from 'react'

interface NewOrder {
    id: string
    orderNumber: string
    createdAt: string
}

interface UseRealtimeOrdersReturn {
    newOrders: NewOrder[]
    clearNewOrders: () => void
}

export function useRealtimeOrders(restaurantId: string): UseRealtimeOrdersReturn {
    const [newOrders, setNewOrders] = useState<NewOrder[]>([])
    const audioRef = useRef<HTMLAudioElement | null>(null)
    const lastCheckRef = useRef<Date>(new Date())
    const notifiedIdsRef = useRef<Set<string>>(new Set())
    const intervalRef = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
        // Criar elemento de áudio
        audioRef.current = new Audio('/sounds/new-order.mp3')
        audioRef.current.volume = 1.0

        // Pré-carregar o áudio
        audioRef.current.load()

        // Solicitar permissão de notificação
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission()
        }

        // Função para verificar novos pedidos
        const checkNewOrders = async () => {
            try {
                const response = await fetch(
                    `/api/restaurant/orders/check-new?restaurantId=${restaurantId}&since=${lastCheckRef.current.toISOString()}`,
                    {
                        method: 'GET',
                        cache: 'no-store',
                        headers: {
                            'Cache-Control': 'no-cache',
                            'Pragma': 'no-cache',
                        },
                    }
                )

                if (response.ok) {
                    const data = await response.json()

                    if (data.hasNewOrders && data.newOrders && data.newOrders.length > 0) {
                        // Filtrar apenas pedidos realmente novos
                        const trulyNew = data.newOrders.filter(
                            (order: NewOrder) => !notifiedIdsRef.current.has(order.id)
                        )

                        if (trulyNew.length > 0) {
                            console.log('🔔 Novos pedidos detectados:', trulyNew)

                            // Adicionar aos IDs notificados
                            trulyNew.forEach((order: NewOrder) => {
                                notifiedIdsRef.current.add(order.id)
                            })

                            // Atualizar state para forçar re-render
                            setNewOrders(prev => [...prev, ...trulyNew])

                            // Tocar som
                            if (audioRef.current) {
                                audioRef.current.currentTime = 0
                                audioRef.current.play().catch(err => {
                                    if (err.name === 'NotAllowedError') {
                                        console.warn('Autoplay bloqueado. Aguardando interação do usuário para tocar som.')
                                        // O navegador bloqueou o som. Vamos esperar um clique para habilitar.
                                        const playOnClick = () => {
                                            audioRef.current?.play().catch(() => { }) // Ignora erros subsequentes no click
                                            document.removeEventListener('click', playOnClick)
                                        }
                                        document.addEventListener('click', playOnClick, { once: true })
                                    } else {
                                        console.error('Erro ao tocar som:', err)
                                    }
                                })
                            }

                            // Mostrar notificação do navegador
                            if ('Notification' in window && Notification.permission === 'granted') {
                                const notification = new Notification('🔔 Novo Pedido!', {
                                    body: `Você recebeu ${trulyNew.length} novo${trulyNew.length > 1 ? 's' : ''} pedido${trulyNew.length > 1 ? 's' : ''}`,
                                    icon: '/icon.png',
                                    badge: '/icon.png',
                                    tag: 'new-order-' + Date.now(),
                                    requireInteraction: true,
                                    vibrate: [200, 100, 200],
                                })

                                notification.onclick = () => {
                                    window.focus()
                                    notification.close()
                                }
                            }

                            // Dispara atualização dos dados da página atual sem recarregar navegador
                            if (window.location.pathname.includes('/restaurant/dashboard')) {
                                // Pequeno delay para garantir que o banco já commitou
                                setTimeout(() => {
                                    window.dispatchEvent(new Event('refresh-orders'))
                                }, 500)
                            }
                        }
                    }

                    lastCheckRef.current = new Date()
                }
            } catch (error) {
                console.error('Erro ao verificar novos pedidos:', error)
            }
        }

        // Verificar a cada 5 segundos (mais rápido para melhor resposta)
        intervalRef.current = setInterval(checkNewOrders, 5000)

        // Verificar imediatamente
        checkNewOrders()

        // Cleanup
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
            }
        }
    }, [restaurantId])

    const clearNewOrders = () => {
        setNewOrders([])
    }

    return {
        newOrders,
        clearNewOrders,
    }
}
