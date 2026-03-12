import { redirect } from "next/navigation"
import Stripe from "stripe"
import Container from "@/components/layout/Container"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { getSiteSettings } from "@/actions/admin"

export default async function ReturnPage({
    searchParams,
}: {
    searchParams: Promise<{ session_id: string }>
}) {
    const { session_id } = await searchParams

    if (!session_id) {
        redirect("/")
    }

    // Config Stripe
    const settings = await getSiteSettings()
    const stripeKey = (settings?.isStripeSandbox ? settings.stripeTestSecretKey : settings?.stripeProdSecretKey)
        || process.env.STRIPE_SECRET_KEY

    if (!stripeKey) {
        return <div>Configuration error.</div>
    }

    const stripe = new Stripe(stripeKey, { typescript: true })
    const session = await stripe.checkout.sessions.retrieve(session_id)

    const isSuccess = session.status === "complete"
    const isProcessing = session.status === "open"

    return (
        <div className="min-h-screen bg-gray-50 flex items-center py-12">
            <Container>
                <Card className="max-w-md mx-auto">
                    <CardHeader className="text-center">
                        <div className="flex justify-center mb-4">
                            {isSuccess ? (
                                <CheckCircle2 className="h-16 w-16 text-green-500" />
                            ) : isProcessing ? (
                                <div className="h-16 w-16 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
                            ) : (
                                <XCircle className="h-16 w-16 text-red-500" />
                            )}
                        </div>
                        <CardTitle className="text-2xl font-bold">
                            {isSuccess ? "Pagamento Realizado!" : isProcessing ? "Processando..." : "Algo deu errado"}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-center space-y-6">
                        <p className="text-gray-600">
                            {isSuccess
                                ? "Sua assinatura foi ativada com sucesso. Você já pode acessar todos os recursos do seu plano."
                                : isProcessing
                                    ? "Estamos processando seu pagamento. Isso pode levar alguns segundos."
                                    : "Houve um problema ao processar seu pagamento. Por favor, tente novamente ou entre em contato com o suporte."}
                        </p>

                        <div className="flex flex-col gap-2">
                            {isSuccess ? (
                                <Button asChild className="w-full">
                                    <Link href="/restaurant/dashboard">Ir para o Painel</Link>
                                </Button>
                            ) : (
                                <Button asChild variant="outline" className="w-full">
                                    <Link href="/plans">Tentar Novamente</Link>
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </Container>
        </div>
    )
}
