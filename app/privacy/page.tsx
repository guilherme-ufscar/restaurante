export default function PrivacyPage() {
    return (
        <div className="container mx-auto px-4 py-16 max-w-4xl">
            <h1 className="text-3xl font-bold mb-8">Política de Privacidade</h1>
            <div className="prose prose-gray max-w-none space-y-6 text-gray-600">
                <p>Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>

                <h2 className="text-xl font-semibold text-gray-900">1. Coleta de Dados</h2>
                <p>Coletamos informações que você nos fornece diretamente, como nome, email, endereço e dados de pagamento, para processar seus pedidos.</p>

                <h2 className="text-xl font-semibold text-gray-900">2. Uso das Informações</h2>
                <p>Usamos suas informações para operar, manter e melhorar nossos serviços, processar transações e comunicar novidades.</p>

                <h2 className="text-xl font-semibold text-gray-900">3. Compartilhamento de Dados</h2>
                <p>Compartilhamos dados estritamente necessários com restaurantes parceiros e entregadores para cumprir seu pedido.</p>

                <h2 className="text-xl font-semibold text-gray-900">4. Segurança</h2>
                <p>Implementamos medidas de segurança técnicas e organizacionais para proteger seus dados pessoais.</p>

                <h2 className="text-xl font-semibold text-gray-900">5. Seus Direitos (LGPD)</h2>
                <p>Você tem direito de acessar, corrigir ou solicitar a exclusão de seus dados pessoais a qualquer momento.</p>
            </div>
        </div>
    )
}
