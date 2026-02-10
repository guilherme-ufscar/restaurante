
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, Crown, AlertTriangle } from "lucide-react"
import SubscriptionHandler from "@/components/features/subscription/SubscriptionHandler"
import PlanCheckoutButton from "@/components/features/plans/PlanCheckoutButton"
import { getSiteSettings } from "@/actions/admin"

export const metadata = {
    title: "Assinatura | Dashboard",
}

export default async function SubscriptionPage() {
    const session = await getServerSession(authOptions)
    const settings = await getSiteSettings()
    const stripePublishableKey = settings?.isStripeSandbox
        ? settings.stripeTestPublishableKey
        : settings?.stripeProdPublishableKey

    if (!session?.user || session.user.role !== "RESTAURANT") {
        redirect("/")
    }

    const restaurant = await prisma.restaurant.findUnique({
        where: { ownerId: session.user.id },
        include: { subscriptionPlan: true }
    })

    if (!restaurant) {
        return <div>Restaurante não encontrado.</div>
    }

    const plans = await prisma.subscriptionPlan.findMany({
        where: { isActive: true },
        orderBy: { price: "asc" }
    })

    const currentPlanId = restaurant.subscriptionPlanId

    // Helper to determine if button should be disabled
    const isPlanDisabled = (plan: any) => {
        // Cannot buy current plan
        if (plan.id === currentPlanId) return true

        // If current is Professional (assuming higher price means higher tier or by name checking)
        const isCurrentProfessional = restaurant.subscriptionPlan?.name.toLowerCase().includes("profissional")
        const isTargetBasic = plan.name.toLowerCase().includes("básico") || plan.name.toLowerCase().includes("basico")

        if (isCurrentProfessional && isTargetBasic) return true // Cannot downgrade

        return false
    }

    const getButtonText = (plan: any) => {
        if (plan.id === currentPlanId) return "Plano Atual"
        const isCurrentProfessional = restaurant.subscriptionPlan?.name.toLowerCase().includes("profissional")
        const isTargetBasic = plan.name.toLowerCase().includes("básico") || plan.name.toLowerCase().includes("basico")

        if (isCurrentProfessional && isTargetBasic) return "Indisponível"

        if (currentPlanId && !isPlanDisabled(plan)) return "Fazer Upgrade"

        return "Assinar Agora"
    }

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Assinatura</h2>
                <p className="text-muted-foreground">
                    Gerencie seu plano e funcionalidades
                </p>
            </div>

            {/* Current Plan Status */}
            <Card>
                <CardHeader>
                    <CardTitle>Status da Assinatura</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg bg-slate-50">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Plano Atual</p>
                            <p className="text-xl font-bold text-slate-900">
                                {restaurant.subscriptionPlan?.name || "Nenhum plano ativo"}
                            </p>
                        </div>
                        <div>
                            {restaurant.subscriptionStatus === "ACTIVE" && (
                                <Badge className="bg-green-600">Ativo</Badge>
                            )}
                            {restaurant.subscriptionStatus === "PENDING" && (
                                <Badge className="bg-yellow-600">Pendente</Badge>
                            )}
                            {(restaurant.subscriptionStatus === "EXPIRED" || restaurant.subscriptionStatus === "CANCELLED") && (
                                <Badge className="bg-red-600">Expirado</Badge>
                            )}
                        </div>
                    </div>
                    {restaurant.subscriptionStatus !== "ACTIVE" && (
                        <div className="flex items-center gap-2 text-yellow-700 bg-yellow-50 p-3 rounded-md">
                            <AlertTriangle className="h-5 w-5" />
                            <p className="text-sm">
                                Seu restaurante não está visível para clientes. Assine um plano para ativar.
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Plans List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {plans.map((plan) => {
                    const isPopular = plan.name.toLowerCase().includes("profissional")
                    const isDisabled = isPlanDisabled(plan)

                    return (
                        <Card
                            key={plan.id}
                            className={`flex flex-col relative ${isPopular ? "border-orange-500 shadow-md scale-100 md:scale-105" : "border-gray-200"}`}
                        >
                            {isPopular && (
                                <div className="absolute top-0 right-0 bg-orange-500 text-white px-3 py-1 text-xs font-bold rounded-bl-lg">
                                    Recomendado
                                </div>
                            )}
                            <CardHeader className="text-center pb-2">
                                <CardTitle className="text-xl">{plan.name}</CardTitle>
                                <div className="mt-4 flex items-baseline justify-center text-4xl font-extrabold tracking-tight text-gray-900">
                                    R$ {Number(plan.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    <span className="ml-1 text-xl font-medium text-gray-500">/mês</span>
                                </div>
                                <CardDescription className="pt-2">{plan.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1">
                                <ul className="space-y-3 mt-4">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-start">
                                            <div className="flex-shrink-0">
                                                <Check className="h-5 w-5 text-green-500" />
                                            </div>
                                            <p className="ml-3 text-sm text-gray-700">{feature}</p>
                                        </li>
                                    ))}
                                    <li className="flex items-start">
                                        <div className="flex-shrink-0">
                                            <Check className="h-5 w-5 text-green-500" />
                                        </div>
                                        <p className="ml-3 text-sm text-gray-700">
                                            {plan.maxProducts ? `Até ${plan.maxProducts} produtos` : "Produtos ilimitados"}
                                        </p>
                                    </li>
                                </ul>
                            </CardContent>
                            <CardFooter>
                                <div className="w-full">
                                    {isDisabled ? (
                                        <Button className="w-full" variant="outline" disabled>
                                            {getButtonText(plan)}
                                        </Button>
                                    ) : (
                                        <PlanCheckoutButton planId={plan.id} isRestaurant={true} />
                                    )}
                                </div>
                            </CardFooter>
                        </Card>
                    )
                })}
            </div>

            {/* Auto Checkout Handler */}
            <SubscriptionHandler />
        </div>
    )
}
