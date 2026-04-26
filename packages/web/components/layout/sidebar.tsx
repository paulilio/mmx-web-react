"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/shared/utils"
import {
  LayoutDashboard,
  Users,
  FolderOpen,
  CreditCard,
  PiggyBank,
  ArrowRightLeft,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react"
import { UserProfileButton } from "@/components/profile/user-profile-button"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Transações", href: "/transactions", icon: ArrowRightLeft },
  { name: "Contatos", href: "/contacts", icon: Users },
  { name: "Categorias", href: "/categories", icon: FolderOpen },
  { name: "Orçamento", href: "/budget", icon: PiggyBank },
  { name: "Configurações", href: "/settings", icon: Settings },
]

const STORAGE_KEY = "mmx_sidebar_collapsed"

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      setCollapsed(window.localStorage.getItem(STORAGE_KEY) === "true")
    } catch {
      // ignore
    }
    setHydrated(true)
  }, [])

  const toggle = () => {
    setCollapsed((prev) => {
      const next = !prev
      try {
        window.localStorage.setItem(STORAGE_KEY, String(next))
      } catch {
        // ignore
      }
      return next
    })
  }

  return (
    <div
      className={cn(
        "flex h-full flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-[width] duration-200",
        collapsed ? "w-14" : "w-52",
        !hydrated && "invisible",
      )}
    >
      <div className={cn("flex h-14 items-center border-b border-sidebar-border", collapsed ? "px-2 justify-center" : "px-4 justify-between gap-2")}>
        <div className={cn("flex items-center gap-2 min-w-0", collapsed && "justify-center w-full")}>
          <CreditCard className="h-6 w-6 shrink-0 text-primary" />
          {!collapsed && (
            <span className="text-sm font-semibold text-sidebar-foreground truncate">MoedaMix</span>
          )}
        </div>
        {!collapsed && (
          <button
            type="button"
            onClick={toggle}
            aria-label="Recolher menu"
            className="shrink-0 rounded-md p-1 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        )}
      </div>

      {collapsed && (
        <button
          type="button"
          onClick={toggle}
          aria-label="Expandir menu"
          className="mx-auto mt-2 rounded-md p-1.5 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
        >
          <PanelLeftOpen className="h-4 w-4" />
        </button>
      )}

      <nav className={cn("flex-1 py-4", collapsed ? "px-2" : "px-3")}>
        <ul className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  title={collapsed ? item.name : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-md text-xs font-medium transition-colors",
                    collapsed ? "justify-center p-2" : "px-3 py-2",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {!collapsed && <span className="truncate">{item.name}</span>}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className={cn("border-t border-sidebar-border overflow-hidden", collapsed ? "p-2" : "p-3")}>
        <UserProfileButton />
      </div>
    </div>
  )
}
