"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error(error)
    }, [error])

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
            <AlertTriangle className="h-16 w-16 text-red-500 mb-6" />
            <h2 className="text-3xl font-bold mb-4">Algo deu errado!</h2>
            <p className="text-xl text-gray-600 mb-8 max-w-md">
                Desculpe, encontramos um erro inesperado. Nossa equipe já foi notificada.
            </p>
            <div className="flex gap-4">
                <Button onClick={() => reset()} variant="default">
                    Tentar Novamente
                </Button>
                <Button onClick={() => window.location.href = "/"} variant="outline">
                    Voltar para Home
                </Button>
            </div>
        </div>
    )
}
