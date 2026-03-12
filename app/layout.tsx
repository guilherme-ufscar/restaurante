import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import AuthProvider from "@/components/providers/AuthProvider"
import { CartProvider } from "@/contexts/CartContext"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { Toaster } from "react-hot-toast"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
    title: {
        template: "%s | DeliveryPlatform",
        default: "DeliveryPlatform - Seu Delivery Favorito",
    },
    description: "A melhor plataforma de delivery para restaurantes e clientes. Peça agora!",
    openGraph: {
        type: "website",
        locale: "pt_BR",
        url: process.env.NEXT_PUBLIC_APP_URL,
        siteName: "DeliveryPlatform",
    },
}

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await getServerSession(authOptions)

    return (
        <html lang="pt-BR">
            <body className={inter.className}>
                <AuthProvider session={session}>
                    <CartProvider>
                        <div className="flex min-h-screen flex-col">
                            <Header />
                            <main className="flex-1">{children}</main>
                            <Footer />
                        </div>
                        <Toaster position="top-center" />
                    </CartProvider>
                </AuthProvider>
            </body>
        </html>
    )
}
