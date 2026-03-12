import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { getSiteSettings } from "@/actions/admin"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Check, Crown } from "lucide-react"
import PlanCheckoutButton from "@/components/features/plans/PlanCheckoutButton"

export default async function PlansPage() {
    const session = await getServerSession(authOptions)
    const settings = await getSiteSettings()
    const stripePublishableKey = settings?.isStripeSandbox
        ? settings.stripeTestPublishableKey
        : settings?.stripeProdPublishableKey

    const plans = await prisma.subscriptionPlan.findMany({
        where: { isActive: true },
        orderBy: { price: "asc" }
    })

    const isRestaurant = session?.user?.role === "RESTAURANT"

    const getIntervalLabel = (interval: string) => {
        switch (interval) {
            case "MONTHLY": return "/mês"
            case "QUARTERLY": return "/trimestre"
            case "SEMIANNUAL": return "/semestre"
            case "ANNUAL": return "/ano"
            default: return ""
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 py-16 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
                        Escolha o Plano Ideal para seu Restaurante
                    </h1>
                    <p className="text-xl text-gray-600">
                        Comece a vender hoje mesmo e alcance milhares de clientes com nossas soluções.
                    </p>
                </div>

                <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
                    {plans.map((plan) => {
                        const isPopular = plan.name.toLowerCase().includes("profissional") || plan.name.toLowerCase().includes("pro")
                        const price = Number(plan.price)

                        return (
                            <Card
                                key={plan.id}
                                className={`relative flex flex-col h-full overflow-hidden hover:shadow-2xl transition-all duration-300 border-2 ${isPopular ? 'border-orange-500 scale-105 z-10' : 'border-transparent hover:border-gray-100'}`}
                            >
                                {isPopular && (
                                    <div className="absolute top-0 right-0 bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-1 text-sm font-bold rounded-bl-lg z-10 shadow-sm">
                                        Mais Popular
                                    </div>
                                )}

                                <CardHeader className="text-center pt-8 pb-4">
                                    <div className="h-12 w-12 mx-auto mb-4 flex items-center justify-center">
                                        {isPopular ? (
                                            <Crown className="w-12 h-12 text-orange-500" />
                                        ) : (
                                            <div className="w-12 h-12" /> /* Placeholder para manter alinhamento */
                                        )}
                                    </div>
                                    <h3 className="text-2xl font-bold mb-2 text-gray-800">{plan.name}</h3>
                                    <div className="flex items-baseline justify-center gap-1">
                                        <span className="text-sm font-medium text-gray-500">R$</span>
                                        <span className="text-5xl font-extrabold text-gray-900">
                                            {new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2 }).format(price)}
                                        </span>
                                    </div>
                                    <p className="text-gray-500 font-medium tracking-wide">
                                        {getIntervalLabel(plan.interval)}
                                    </p>
                                </CardHeader>

                                <CardContent className="flex flex-col flex-grow">
                                    <p className="text-gray-600 mb-8 text-center min-h-[3rem] px-4 leading-relaxed">
                                        {plan.description}
                                    </p>

                                    <ul className="space-y-4 mb-8 flex-grow">
                                        {plan.features.map((feature, index) => (
                                            <li key={index} className="flex items-start gap-3">
                                                <div className="flex-shrink-0 mt-1">
                                                    <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center">
                                                        <Check className="w-3.5 h-3.5 text-green-600" />
                                                    </div>
                                                </div>
                                                <span className="text-gray-700 text-sm leading-tight">{feature}</span>
                                            </li>
                                        ))}
                                        {/* Manter a lógica de exibição de limites como itens da lista, se desejar, ou integrar aos features no backend. 
                                            Como o backend separa, mantemos aqui. */}
                                        <li className="flex items-start gap-3">
                                            <div className="flex-shrink-0 mt-1">
                                                <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center">
                                                    <Check className="w-3.5 h-3.5 text-green-600" />
                                                </div>
                                            </div>
                                            <span className="text-gray-700 text-sm leading-tight">
                                                {plan.maxProducts ? `Até ${plan.maxProducts} produtos` : "Produtos ilimitados"}
                                            </span>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <div className="flex-shrink-0 mt-1">
                                                <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center">
                                                    <Check className="w-3.5 h-3.5 text-green-600" />
                                                </div>
                                            </div>
                                            <span className="text-gray-700 text-sm leading-tight">
                                                {plan.maxOrders ? `Até ${plan.maxOrders} pedidos/mês` : "Pedidos ilimitados"}
                                            </span>
                                        </li>
                                    </ul>

                                    <div className="mt-auto pt-4">
                                        <PlanCheckoutButton
                                            planId={plan.id}
                                            isRestaurant={isRestaurant}
                                            stripePublishableKey={stripePublishableKey}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
