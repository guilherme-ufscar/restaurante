import Link from "next/link"
import Image from "next/image"
import { Facebook, Instagram, Mail, Phone } from "lucide-react"
import Container from "./Container"

export default function Footer() {
    return (
        <footer className="bg-gray-900 text-gray-300 mt-20">
            <Container>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 py-12">
                    {/* Sobre */}
                    <div>
                        <div className="mb-4">
                            <Image
                                src="/logos/logo.webp"
                                alt="DeliveryApp Logo"
                                width={150}
                                height={50}
                                className="object-contain h-12 w-auto"
                            />
                        </div>
                        <p className="text-sm mb-4">
                            Peça comida dos melhores restaurantes da sua cidade com entrega rápida e segura.
                        </p>
                        <div className="flex gap-4">
                            <a
                                href="https://www.facebook.com/share/1EMqDbo5h8/?mibextid=wwXIfr"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-white transition-colors cursor-pointer"
                            >
                                <Facebook className="h-5 w-5" />
                            </a>
                            <a
                                href="https://www.instagram.com/ilicinea.com_oficial?igsh=MTk0Z3EyYzdkODRkag%3D%3D&utm_source=qr"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-white transition-colors cursor-pointer"
                            >
                                <Instagram className="h-5 w-5" />
                            </a>
                            <a
                                href="https://wa.me/5535984570053?text=Ol%C3%A1%2C%20tudo%20bem%3F%20Vim%20pelo%20site%20Ilic%C3%ADnea.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-white transition-colors cursor-pointer"
                            >
                                <Phone className="h-5 w-5" />
                            </a>
                        </div>
                    </div>

                    {/* Links Úteis */}
                    <div>
                        <h3 className="text-white font-bold text-lg mb-4">Links Úteis</h3>
                        <nav className="flex flex-col gap-2">
                            {[
                                { label: "Sobre", href: "/about" },
                                { label: "Como Funciona", href: "/how-it-works" },
                            ].map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="text-sm hover:text-white transition-colors"
                                >
                                    {link.label}
                                </Link>
                            ))}
                            <Link
                                href="/auth/signup/restaurant"
                                className="text-sm font-bold text-orange-500 hover:text-orange-400 transition-colors mt-2"
                            >
                                Cadastre seu Restaurante
                            </Link>
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
                                <span className="text-sm">contato@delivery.ilicinea.com</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-800 py-6 mt-8">
                    <p className="text-center text-sm">
                        Copyright © 2026 <a href="https://www.codermaster.com.br" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Coder Master</a>. Todos os direitos reservados.
                    </p>
                </div>
            </Container>
        </footer>
    )
}
