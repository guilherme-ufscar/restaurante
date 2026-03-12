
import Container from "@/components/layout/Container"

export const metadata = {
    title: "Sobre Nós | DeliveryApp",
    description: "Conheça a história e a missão do DeliveryApp."
}

export default function AboutPage() {
    return (
        <div className="py-12">
            <Container>
                <div className="max-w-3xl mx-auto space-y-8">
                    <section className="text-center">
                        <h1 className="text-4xl font-bold mb-4">Sobre o DeliveryApp</h1>
                        <p className="text-xl text-muted-foreground">
                            Conectando pessoas a sabores inesquecíveis.
                        </p>
                    </section>

                    <section className="prose prose-orange max-w-none">
                        <h3>Nossa História</h3>
                        <p>
                            O DeliveryApp nasceu da paixão por gastronomia e tecnologia.
                            Fundado em 2026, nosso objetivo sempre foi simplificar a forma
                            como as pessoas pedem comida, garantindo que a experiência seja
                            tão prazerosa quanto a refeição em si.
                        </p>

                        <h3>Nossa Missão</h3>
                        <p>
                            Empoderar restaurantes locais e oferecer conveniência aos clientes,
                            criando um ecossistema onde todos prosperam. Acreditamos que a comida
                            tem o poder de unir pessoas e queremos ser a ponte para esses momentos.
                        </p>

                        <h3>Por que escolher o DeliveryApp?</h3>
                        <ul>
                            <li><strong>Variedade:</strong> Dos melhores restaurantes locais às grandes redes.</li>
                            <li><strong>Rapidez:</strong> Entregas otimizadas para chegar quentinho até você.</li>
                            <li><strong>Segurança:</strong> Pagamentos seguros e suporte dedicado.</li>
                        </ul>
                    </section>
                </div>
            </Container>
        </div>
    )
}
