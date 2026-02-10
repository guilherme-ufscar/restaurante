import Link from "next/link"
import { Button } from "@/components/ui/button"
import { XCircle } from "lucide-react"

export default function SubscriptionCancelledPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
            <XCircle className="h-24 w-24 text-red-500 mb-6" />
            <h1 className="text-3xl font-bold mb-4">Pagamento Cancelado</h1>
            <p className="text-xl text-gray-600 mb-8 max-w-md">
                O processo de pagamento foi interrompido. Nenhuma cobrança foi realizada.
            </p>
            <div className="flex gap-4">
                <Button variant="outline" asChild>
                    <Link href="/restaurant/dashboard">
                        Voltar ao Dashboard
                    </Link>
                </Button>
                <Button asChild>
                    <Link href="/plans">
                        Tentar Novamente
                    </Link>
                </Button>
            </div>
        </div>
    )
}
