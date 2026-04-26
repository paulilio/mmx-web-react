"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import type { User } from "@/types/auth"

const USER_ID = "dev-user-local"

const FAKE_USER: User = {
  id: USER_ID,
  email: "dev@mmx.local",
  firstName: "Dev",
  lastName: "User",
  isEmailConfirmed: true,
  createdAt: new Date().toISOString(),
  planType: "premium",
  preferences: {
    theme: "system",
    language: "pt-BR",
    notifications: { email: false, push: false, sms: false },
    layout: { sidebarCollapsed: false, compactMode: false },
    hasSeenWelcome: true,
  } as User["preferences"],
}

const NOW = new Date()
const ISO_NOW = NOW.toISOString()

function daysAgo(days: number): string {
  const d = new Date(NOW)
  d.setDate(d.getDate() - days)
  d.setUTCHours(12, 0, 0, 0)
  return d.toISOString().slice(0, 10)
}

function buildSeed() {
  const areas = [
    { id: "area-income", userId: USER_ID, name: "Renda", description: "Entradas", type: "income", color: "#10b981", icon: "trending-up", status: "active", createdAt: ISO_NOW, updatedAt: ISO_NOW },
    { id: "area-fixed", userId: USER_ID, name: "Despesas Fixas", description: "Recorrentes", type: "fixed-expenses", color: "#3b82f6", icon: "home", status: "active", createdAt: ISO_NOW, updatedAt: ISO_NOW },
    { id: "area-daily", userId: USER_ID, name: "Despesas Diárias", description: "Variáveis", type: "daily-expenses", color: "#f59e0b", icon: "shopping-cart", status: "active", createdAt: ISO_NOW, updatedAt: ISO_NOW },
  ]

  const categoryGroups = [
    { id: "cg-receitas", userId: USER_ID, name: "Receitas", description: "Entradas", color: "#10b981", icon: "trending-up", status: "active", areaId: "area-income", createdAt: ISO_NOW, updatedAt: ISO_NOW },
    { id: "cg-moradia", userId: USER_ID, name: "Moradia", description: "Casa", color: "#3b82f6", icon: "home", status: "active", areaId: "area-fixed", createdAt: ISO_NOW, updatedAt: ISO_NOW },
    { id: "cg-alimentacao", userId: USER_ID, name: "Alimentação", description: "Comida", color: "#f59e0b", icon: "shopping-cart", status: "active", areaId: "area-daily", createdAt: ISO_NOW, updatedAt: ISO_NOW },
    { id: "cg-transporte", userId: USER_ID, name: "Transporte", description: "Deslocamento", color: "#a855f7", icon: "car", status: "active", areaId: "area-daily", createdAt: ISO_NOW, updatedAt: ISO_NOW },
  ]

  const categories = [
    { id: "cat-salario", userId: USER_ID, name: "Salário", type: "income", categoryGroupId: "cg-receitas", areaId: "area-income", status: "active", createdAt: ISO_NOW, updatedAt: ISO_NOW },
    { id: "cat-freelance", userId: USER_ID, name: "Freelance", type: "income", categoryGroupId: "cg-receitas", areaId: "area-income", status: "active", createdAt: ISO_NOW, updatedAt: ISO_NOW },
    { id: "cat-aluguel", userId: USER_ID, name: "Aluguel", type: "expense", categoryGroupId: "cg-moradia", areaId: "area-fixed", status: "active", createdAt: ISO_NOW, updatedAt: ISO_NOW },
    { id: "cat-conta-luz", userId: USER_ID, name: "Conta de luz", type: "expense", categoryGroupId: "cg-moradia", areaId: "area-fixed", status: "active", createdAt: ISO_NOW, updatedAt: ISO_NOW },
    { id: "cat-mercado", userId: USER_ID, name: "Mercado", type: "expense", categoryGroupId: "cg-alimentacao", areaId: "area-daily", status: "active", createdAt: ISO_NOW, updatedAt: ISO_NOW },
    { id: "cat-restaurante", userId: USER_ID, name: "Restaurante", type: "expense", categoryGroupId: "cg-alimentacao", areaId: "area-daily", status: "active", createdAt: ISO_NOW, updatedAt: ISO_NOW },
    { id: "cat-uber", userId: USER_ID, name: "Uber", type: "expense", categoryGroupId: "cg-transporte", areaId: "area-daily", status: "active", createdAt: ISO_NOW, updatedAt: ISO_NOW },
    { id: "cat-combustivel", userId: USER_ID, name: "Combustível", type: "expense", categoryGroupId: "cg-transporte", areaId: "area-daily", status: "active", createdAt: ISO_NOW, updatedAt: ISO_NOW },
  ]

  const contacts = [
    { id: "contact-acme", userId: USER_ID, name: "ACME Ltda", type: "customer", status: "active", createdAt: ISO_NOW, updatedAt: ISO_NOW },
    { id: "contact-imob", userId: USER_ID, name: "Imobiliária Central", type: "supplier", status: "active", createdAt: ISO_NOW, updatedAt: ISO_NOW },
    { id: "contact-supermercado", userId: USER_ID, name: "Supermercado Bom Preço", type: "supplier", status: "active", createdAt: ISO_NOW, updatedAt: ISO_NOW },
  ]

  type Tx = {
    id: string
    userId: string
    description: string
    amount: number
    type: "income" | "expense"
    status: "completed" | "pending" | "cancelled"
    date: string
    categoryId: string
    categoryGroupId: string
    areaId: string
    contactId?: string
    createdAt: string
    updatedAt: string
  }

  const transactions: Tx[] = [
    // Receitas (completed e algumas pending)
    { id: "tx-1", userId: USER_ID, description: "Salário abril", amount: 12000, type: "income", status: "completed", date: daysAgo(5), categoryId: "cat-salario", categoryGroupId: "cg-receitas", areaId: "area-income", contactId: "contact-acme", createdAt: ISO_NOW, updatedAt: ISO_NOW },
    { id: "tx-2", userId: USER_ID, description: "Freelance projeto X", amount: 4500, type: "income", status: "completed", date: daysAgo(12), categoryId: "cat-freelance", categoryGroupId: "cg-receitas", areaId: "area-income", contactId: "contact-acme", createdAt: ISO_NOW, updatedAt: ISO_NOW },
    { id: "tx-3", userId: USER_ID, description: "Freelance projeto Y", amount: 2800, type: "income", status: "pending", date: daysAgo(2), categoryId: "cat-freelance", categoryGroupId: "cg-receitas", areaId: "area-income", contactId: "contact-acme", createdAt: ISO_NOW, updatedAt: ISO_NOW },
    { id: "tx-4", userId: USER_ID, description: "Salário maio", amount: 12000, type: "income", status: "pending", date: daysAgo(-25), categoryId: "cat-salario", categoryGroupId: "cg-receitas", areaId: "area-income", contactId: "contact-acme", createdAt: ISO_NOW, updatedAt: ISO_NOW },

    // Despesas concluídas no mês
    { id: "tx-5", userId: USER_ID, description: "Mercado semana 1", amount: 380, type: "expense", status: "completed", date: daysAgo(20), categoryId: "cat-mercado", categoryGroupId: "cg-alimentacao", areaId: "area-daily", contactId: "contact-supermercado", createdAt: ISO_NOW, updatedAt: ISO_NOW },
    { id: "tx-6", userId: USER_ID, description: "Mercado semana 2", amount: 420, type: "expense", status: "completed", date: daysAgo(13), categoryId: "cat-mercado", categoryGroupId: "cg-alimentacao", areaId: "area-daily", contactId: "contact-supermercado", createdAt: ISO_NOW, updatedAt: ISO_NOW },
    { id: "tx-7", userId: USER_ID, description: "Mercado semana 3", amount: 290, type: "expense", status: "completed", date: daysAgo(6), categoryId: "cat-mercado", categoryGroupId: "cg-alimentacao", areaId: "area-daily", contactId: "contact-supermercado", createdAt: ISO_NOW, updatedAt: ISO_NOW },
    { id: "tx-8", userId: USER_ID, description: "Aluguel abril", amount: 2500, type: "expense", status: "completed", date: daysAgo(8), categoryId: "cat-aluguel", categoryGroupId: "cg-moradia", areaId: "area-fixed", contactId: "contact-imob", createdAt: ISO_NOW, updatedAt: ISO_NOW },
    { id: "tx-9", userId: USER_ID, description: "Conta de luz", amount: 240, type: "expense", status: "completed", date: daysAgo(10), categoryId: "cat-conta-luz", categoryGroupId: "cg-moradia", areaId: "area-fixed", createdAt: ISO_NOW, updatedAt: ISO_NOW },
    { id: "tx-10", userId: USER_ID, description: "Combustível", amount: 200, type: "expense", status: "completed", date: daysAgo(15), categoryId: "cat-combustivel", categoryGroupId: "cg-transporte", areaId: "area-daily", createdAt: ISO_NOW, updatedAt: ISO_NOW },
    { id: "tx-11", userId: USER_ID, description: "Combustível", amount: 180, type: "expense", status: "completed", date: daysAgo(3), categoryId: "cat-combustivel", categoryGroupId: "cg-transporte", areaId: "area-daily", createdAt: ISO_NOW, updatedAt: ISO_NOW },
    { id: "tx-12", userId: USER_ID, description: "Uber semana", amount: 95, type: "expense", status: "completed", date: daysAgo(7), categoryId: "cat-uber", categoryGroupId: "cg-transporte", areaId: "area-daily", createdAt: ISO_NOW, updatedAt: ISO_NOW },
    { id: "tx-13", userId: USER_ID, description: "Restaurante", amount: 145, type: "expense", status: "completed", date: daysAgo(4), categoryId: "cat-restaurante", categoryGroupId: "cg-alimentacao", areaId: "area-daily", createdAt: ISO_NOW, updatedAt: ISO_NOW },

    // Em atraso (overdue: date < hoje, pending) — 3 itens
    { id: "tx-14", userId: USER_ID, description: "Conta de luz fevereiro", amount: 280, type: "expense", status: "pending", date: daysAgo(45), categoryId: "cat-conta-luz", categoryGroupId: "cg-moradia", areaId: "area-fixed", createdAt: ISO_NOW, updatedAt: ISO_NOW },
    { id: "tx-15", userId: USER_ID, description: "Mercado mês passado", amount: 510, type: "expense", status: "pending", date: daysAgo(35), categoryId: "cat-mercado", categoryGroupId: "cg-alimentacao", areaId: "area-daily", contactId: "contact-supermercado", createdAt: ISO_NOW, updatedAt: ISO_NOW },
    { id: "tx-16", userId: USER_ID, description: "IPTU março", amount: 320, type: "expense", status: "pending", date: daysAgo(25), categoryId: "cat-aluguel", categoryGroupId: "cg-moradia", areaId: "area-fixed", createdAt: ISO_NOW, updatedAt: ISO_NOW },

    // Próximos 7 dias (pending) — 4 itens
    { id: "tx-17", userId: USER_ID, description: "Aluguel maio", amount: 2500, type: "expense", status: "pending", date: daysAgo(-2), categoryId: "cat-aluguel", categoryGroupId: "cg-moradia", areaId: "area-fixed", contactId: "contact-imob", createdAt: ISO_NOW, updatedAt: ISO_NOW },
    { id: "tx-18", userId: USER_ID, description: "Internet", amount: 120, type: "expense", status: "pending", date: daysAgo(-3), categoryId: "cat-conta-luz", categoryGroupId: "cg-moradia", areaId: "area-fixed", createdAt: ISO_NOW, updatedAt: ISO_NOW },
    { id: "tx-19", userId: USER_ID, description: "Conta de luz abril", amount: 260, type: "expense", status: "pending", date: daysAgo(-5), categoryId: "cat-conta-luz", categoryGroupId: "cg-moradia", areaId: "area-fixed", createdAt: ISO_NOW, updatedAt: ISO_NOW },
    { id: "tx-20", userId: USER_ID, description: "Mercado semana 4", amount: 350, type: "expense", status: "pending", date: daysAgo(-6), categoryId: "cat-mercado", categoryGroupId: "cg-alimentacao", areaId: "area-daily", contactId: "contact-supermercado", createdAt: ISO_NOW, updatedAt: ISO_NOW },

    // Mês anterior (para histórico no cashflow)
    { id: "tx-21", userId: USER_ID, description: "Salário março", amount: 12000, type: "income", status: "completed", date: daysAgo(28), categoryId: "cat-salario", categoryGroupId: "cg-receitas", areaId: "area-income", contactId: "contact-acme", createdAt: ISO_NOW, updatedAt: ISO_NOW },
    { id: "tx-22", userId: USER_ID, description: "Aluguel março", amount: 2500, type: "expense", status: "completed", date: daysAgo(38), categoryId: "cat-aluguel", categoryGroupId: "cg-moradia", areaId: "area-fixed", contactId: "contact-imob", createdAt: ISO_NOW, updatedAt: ISO_NOW },
    { id: "tx-23", userId: USER_ID, description: "Mercado março A", amount: 410, type: "expense", status: "completed", date: daysAgo(33), categoryId: "cat-mercado", categoryGroupId: "cg-alimentacao", areaId: "area-daily", contactId: "contact-supermercado", createdAt: ISO_NOW, updatedAt: ISO_NOW },
    { id: "tx-24", userId: USER_ID, description: "Mercado março B", amount: 380, type: "expense", status: "completed", date: daysAgo(40), categoryId: "cat-mercado", categoryGroupId: "cg-alimentacao", areaId: "area-daily", contactId: "contact-supermercado", createdAt: ISO_NOW, updatedAt: ISO_NOW },
  ]

  return { areas, categoryGroups, categories, contacts, transactions }
}

const STORAGE_MAP = {
  mmx_areas: "areas",
  mmx_category_groups: "categoryGroups",
  mmx_categories: "categories",
  mmx_contacts: "contacts",
  mmx_transactions: "transactions",
} as const

function seedLocalStorage() {
  const seed = buildSeed() as Record<string, Array<Record<string, unknown>>>
  for (const [storageKey, seedKey] of Object.entries(STORAGE_MAP)) {
    const records = seed[seedKey] ?? []
    localStorage.setItem(storageKey, JSON.stringify(records))
  }
}

export default function DevLoginPage() {
  const router = useRouter()
  const [status, setStatus] = useState("Preparando sessão dev…")

  useEffect(() => {
    if (process.env.NODE_ENV === "production") {
      router.replace("/auth")
      return
    }
    if (typeof window === "undefined") return

    try {
      localStorage.setItem("auth_user", JSON.stringify(FAKE_USER))
      localStorage.setItem(
        "auth_session",
        JSON.stringify({
          token: "dev-token",
          userId: FAKE_USER.id,
          expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
        }),
      )
      seedLocalStorage()
      setStatus("Pronto. Redirecionando…")
      window.location.href = "/dashboard"
    } catch (error) {
      console.error("[dev-login] failed", error)
      setStatus("Erro ao seed — confira o console")
    }
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center p-6 text-sm text-muted-foreground">
      {status}
    </div>
  )
}
