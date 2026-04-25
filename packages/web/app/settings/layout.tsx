"use client"

import { ReactNode } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { MainLayout } from "@/components/layout/main-layout"
import { cn } from "@/lib/utils"
import { Settings, Lock, Shield } from "lucide-react"

const settingsNav = [
  {
    title: "Geral",
    href: "/settings",
    icon: Settings,
  },
  {
    title: "Segurança",
    href: "/settings/security",
    icon: Lock,
  },
  {
    title: "Autenticação 2FA",
    href: "/settings/two-factor",
    icon: Shield,
  },
]

export default function SettingsLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  return (
    <MainLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
          <p className="text-muted-foreground mt-2">Gerencie sua conta e preferências.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <aside className="md:col-span-1">
            <nav className="space-y-1 sticky top-20">
              {settingsNav.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href || (item.href !== "/settings" && pathname.startsWith(item.href))

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.title}
                  </Link>
                )
              })}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="md:col-span-3">{children}</main>
        </div>
      </div>
    </MainLayout>
  )
}
