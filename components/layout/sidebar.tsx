"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/shared/utils"
import { LayoutDashboard, Users, FolderOpen, CreditCard, PiggyBank, ArrowRightLeft, Settings } from "lucide-react"
import { UserProfileButton } from "@/components/profile/user-profile-button"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Transações", href: "/transactions", icon: ArrowRightLeft },
  { name: "Contatos", href: "/contacts", icon: Users },
  { name: "Categorias", href: "/categories", icon: FolderOpen },
  { name: "Orçamento", href: "/budget", icon: PiggyBank },
  { name: "Configurações", href: "/settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col bg-slate-50 border-r border-slate-200">
      <div className="flex h-16 items-center px-6 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <CreditCard className="h-8 w-8 text-blue-600" />
          <span className="text-xl font-semibold text-slate-900">MoedaMix</span>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                    isActive ? "bg-blue-600 text-white" : "text-slate-700 hover:bg-slate-100 hover:text-slate-900",
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-slate-200">
        <UserProfileButton />
      </div>
    </div>
  )
}
