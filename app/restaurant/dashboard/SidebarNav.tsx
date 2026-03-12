"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    LayoutDashboard,
    UtensilsCrossed,
    ShoppingCart,
    Star,
    CreditCard,
    Settings,
    Crown
} from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
    {
        title: "Dashboard",
        href: "/restaurant/dashboard",
        icon: LayoutDashboard,
        exact: true
    },
    {
        title: "Produtos",
        href: "/restaurant/dashboard/products",
        icon: UtensilsCrossed,
        exact: false
    },
    {
        title: "Pedidos",
        href: "/restaurant/dashboard/orders",
        icon: ShoppingCart,
        exact: false
    },
    {
        title: "Avaliações",
        href: "/restaurant/dashboard/reviews",
        icon: Star,
        exact: false
    },

    {
        title: "Assinatura",
        href: "/restaurant/dashboard/subscription",
        icon: Crown,
        exact: false
    },
    {
        title: "Configurações",
        href: "/restaurant/dashboard/settings",
        icon: Settings,
        exact: false
    },
]

export default function SidebarNav() {
    const pathname = usePathname()

    return (
        <nav className="space-y-1">
            {navItems.map((item) => {
                const isActive = item.exact
                    ? pathname === item.href
                    : pathname.startsWith(item.href)

                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                            isActive
                                ? "bg-primary text-primary-foreground"
                                : "text-slate-300 hover:bg-slate-800 hover:text-white"
                        )}
                    >
                        <item.icon className={cn("mr-3 h-5 w-5", isActive ? "text-white" : "text-slate-400 group-hover:text-white")} />
                        {item.title}
                    </Link>
                )
            })}
        </nav>
    )
}
