import Link from "next/link"
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from "lucide-react"
import Container from "./Container"

export default function Footer() {
    return (
        <footer className="bg-gray-900 text-gray-300 mt-20">
            <Container>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 py-12">
                    {/* Sobre */}
                    <div>
                        <h3 className="text-white font-bold text-lg mb-4">DeliveryApp</h3>
                        <p className="text-sm mb-4">
                            Peça comida dos melhores restaurantes da sua cidade com entrega rápida e segura.
                        </p>
                        <div className="flex gap-4">
                            <div className="hover:text-white transition-colors cursor-pointer">
                                <Facebook className="h-5 w-5" />
                            </div>
                            <div className="hover:text-white transition-colors cursor-pointer">
                                <Instagram className="h-5 w-5" />
                            </div>
                            <div className="hover:text-white transition-colors cursor-pointer">
                                <Twitter className="h-5 w-5" />
                            </div>
                        </div>
                    </div>

                    {/* Links Úteis */}
                    <div>
                        <h3 className="text-white font-bold text-lg mb-4">Links Úteis</h3>
                        <nav className="flex flex-col gap-2">
                            {[
                                { label: "Sobre", href: "/about" },
                                { label: "Como Funciona", href: "/how-it-works" },
                                { label: "Restaurantes Parceiros", href: "/partners" },
                                { label: "Trabalhe Conosco", href: "/careers" },
                            ].map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="text-sm hover:text-white transition-colors"
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    {/* Categorias Populares */}
                    <div>
                        <h3 className="text-white font-bold text-lg mb-4">Categorias Populares</h3>
                        <nav className="flex flex-col gap-2">
                            {[
                                { label: "Pizza", href: "/category/pizza" },
                                { label: "Hamburguer", href: "/category/hamburguer" },
                                { label: "Japonesa", href: "/category/japonesa" },
                                { label: "Italiana", href: "/category/italiana" },
                            ].map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="text-sm hover:text-white transition-colors"
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    {/* Contato */}
                    <div>
                        <h3 className="text-white font-bold text-lg mb-4">Contato</h3>
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4" />
                                <span className="text-sm">contato@deliveryapp.com</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4" />
                                <span className="text-sm">(11) 9999-9999</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                <span className="text-sm">São Paulo, SP</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-800 py-6 mt-8">
                    <p className="text-center text-sm">
                        Copyright © 2025 DeliveryApp. Todos os direitos reservados.
                    </p>
                </div>
            </Container>
        </footer>
    )
}
