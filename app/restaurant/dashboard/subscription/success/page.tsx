import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"

export default function SubscriptionSuccessPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
            <CheckCircle className="h-24 w-24 text-green-500 mb-6" />
            <h1 className="text-3xl font-bold mb-4">Pagamento Realizado com Sucesso!</h1>
            <p className="text-xl text-gray-600 mb-8 max-w-md">
                Sua assinatura foi ativada e seu restaurante já está visível para milhares de clientes.
            </p>
            <Button asChild size="lg">
                <Link href="/restaurant/dashboard">
                    Ir para o Dashboard
                </Link>
            </Button>
        </div>
    )
}
