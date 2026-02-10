export default function TermsPage() {
    return (
        <div className="container mx-auto px-4 py-16 max-w-4xl">
            <h1 className="text-3xl font-bold mb-8">Termos de Uso</h1>
            <div className="prose prose-gray max-w-none space-y-6 text-gray-600">
                <p>Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>

                <h2 className="text-xl font-semibold text-gray-900">1. Aceitação dos Termos</h2>
                <p>Ao acessar e usar o DeliveryPlatform, você concorda em cumprir e ficar vinculado aos seguintes termos e condições de uso.</p>

                <h2 className="text-xl font-semibold text-gray-900">2. Uso da Plataforma</h2>
                <p>Você concorda em usar a plataforma apenas para fins legais e de maneira que não infrinja os direitos de terceiros ou restrinja o uso da plataforma por outros.</p>

                <h2 className="text-xl font-semibold text-gray-900">3. Contas de Usuário</h2>
                <p>Para acessar certos recursos, você pode precisar criar uma conta. Você é responsável por manter a confidencialidade de suas informações de login.</p>

                <h2 className="text-xl font-semibold text-gray-900">4. Pedidos e Pagamentos</h2>
                <p>Todos os pedidos estão sujeitos à disponibilidade. Os preços e taxas são exibidos claramente antes da confirmação do pedido.</p>

                <h2 className="text-xl font-semibold text-gray-900">5. Propriedade Intelectual</h2>
                <p>Todo o conteúdo presente na plataforma é propriedade exclusiva do DeliveryPlatform ou de seus licenciadores.</p>
            </div>
        </div>
    )
}
