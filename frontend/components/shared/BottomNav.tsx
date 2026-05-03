"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Package, ShoppingCart, FileText } from "lucide-react"
import { cn } from "@/lib/utils"

const tabs = [
  { href: "/dashboard", matchPrefix: "/dashboard", icon: LayoutDashboard, label: "Home"     },
  { href: "/products",  matchPrefix: "/products",  icon: Package,         label: "Products" },
  { href: "/orders",    matchPrefix: "/orders",    icon: ShoppingCart,    label: "Orders"   },
  { href: "/invoices",  matchPrefix: "/invoices",  icon: FileText,        label: "Invoices" },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="sticky bottom-0 z-50 bg-white/80 backdrop-blur-lg border-t border-gray-100 flex md:hidden">
      {tabs.map(({ href, matchPrefix, icon: Icon, label }) => {
        const active = pathname === matchPrefix || pathname.startsWith(matchPrefix + "/")
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex-1 flex flex-col items-center justify-center gap-1 py-2 transition-colors",
              active ? "text-blue-600" : "text-gray-400",
            )}
          >
            <Icon strokeWidth={2} className="w-5 h-5 shrink-0" />
            <span className="text-[10px] font-medium leading-none">{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
