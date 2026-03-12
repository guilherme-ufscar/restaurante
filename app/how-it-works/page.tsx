
import Container from "@/components/layout/Container"
import { Search, ShoppingCart, Truck, Utensils } from "lucide-react"

export const metadata = {
    title: "Como Funciona | DeliveryApp",
    description: "Entenda como é fácil pedir sua comida favorita no DeliveryApp."
}

export default function HowItWorksPage() {
    const steps = [
        {
            icon: Search,
            title: "1. Encontre seu prato",
            description: "Navegue por centenas de menus e encontre a comida que combina com sua vontade."
        },
        {
            icon: ShoppingCart,
            title: "2. Faça o pedido",
            description: "Adicione os itens ao carrinho e escolha a melhor forma de pagamento em poucos cliques."
        },
        {
            icon: Utensils,
            title: "3. O restaurante prepara",
            description: "Seu pedido é enviado instantaneamente para a cozinha e preparado com carinho."
        },
        {
            icon: Truck,
            title: "4. Entrega rápida",
            description: "Nossos parceiros de entrega levam sua comida até você com agilidade e segurança."
        }
    ]

    return (
        <div className="py-12">
            <Container>
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-bold mb-4">Como Funciona</h1>
                    <p className="text-xl text-muted-foreground">
                        Pedir sua comida favorita nunca foi tão simples.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {steps.map((step, index) => (
                        <div key={index} className="flex flex-col items-center text-center p-6 bg-white rounded-lg shadow-sm border border-orange-100 hover:shadow-md transition-shadow">
                            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-6 text-orange-600">
                                <step.icon className="h-8 w-8" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                            <p className="text-muted-foreground text-sm leading-relaxed">
                                {step.description}
                            </p>
                        </div>
                    ))}
                </div>
            </Container>
        </div>
    )
}
