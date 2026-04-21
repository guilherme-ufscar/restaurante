"use client"

import { useEffect, useRef } from "react"
import { toast } from "react-hot-toast"

export function useNewOrderNotification() {
    const audioRef = useRef<HTMLAudioElement | null>(null)

    useEffect(() => {
        audioRef.current = new Audio("/sounds/notification.mp3")
    }, [])

    useEffect(() => {
        const checkNewOrders = async () => {
            try {
                const res = await fetch("/api/restaurant/orders/new")
                if (res.ok) {
                    const data = await res.json()
                    if (data.hasNewOrders) {
                        toast("Novo pedido recebido!", {
                            icon: "🔔",
                            duration: 5000,
                            style: {
                                background: '#ea580c',
                                color: '#fff',
                            }
                        })
                        audioRef.current?.play().catch(e => console.error("Error playing sound:", e))
                    }
                }
            } catch (error) {
                console.error("Error checking new orders:", error)
            }
        }

        // Initial check
        checkNewOrders()

        const interval = setInterval(checkNewOrders, 30000) // Check every 30 seconds
        return () => clearInterval(interval)
    }, [])
}
