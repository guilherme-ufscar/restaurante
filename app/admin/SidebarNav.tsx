"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    LayoutDashboard,
    Store,
    Tag,
    CreditCard,
    Crown,
    Users,
    ShoppingCart
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface AdminSidebarNavProps {
    pendingRestaurantsCount: number
}

export default function AdminSidebarNav({ pendingRestaurantsCount }: AdminSidebarNavProps) {
    const pathname = usePathname()

    const navItems = [
        {
            title: "Dashboard",
            href: "/admin",
            icon: LayoutDashboard,
            exact: true
        },
        {
            title: "Restaurantes",
            href: "/admin/restaurants",
            icon: Store,
            exact: false,
            badge: pendingRestaurantsCount > 0 ? pendingRestaurantsCount : null
        },
        {
            title: "Categorias",
            href: "/admin/categories",
            icon: Tag,
            exact: false
        },
        {
            title: "Métodos de Pagamento",
            href: "/admin/payment-methods",
            icon: CreditCard,
            exact: false
        },
        {
            title: "Planos",
            href: "/admin/plans",
            icon: Crown,
            exact: false
        },
        {
            title: "Usuários",
            href: "/admin/users",
            icon: Users,
            exact: false
        },
        {
            title: "Pedidos",
            href: "/admin/orders",
            icon: ShoppingCart,
            exact: false
        },
    ]

    return (
        <nav className="space-y-1">
            {navItems.map((item) => {
                const isActive = item.exact
                    ? pathname === item.href
                    : pathname.startsWith(item.href) && item.href !== "/admin"

                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "flex items-center justify-between px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                            isActive
                                ? "bg-blue-800 text-white"
                                : "text-blue-100 hover:bg-blue-800/50 hover:text-white"
                        )}
                    >
                        <div className="flex items-center">
                            <item.icon className={cn("mr-3 h-5 w-5", isActive ? "text-white" : "text-blue-300 group-hover:text-white")} />
                            {item.title}
                        </div>
                        {item.badge && (
                            <Badge variant="destructive" className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px]">
                                {item.badge}
                            </Badge>
                        )}
                    </Link>
                )
            })}
        </nav>
    )
}
