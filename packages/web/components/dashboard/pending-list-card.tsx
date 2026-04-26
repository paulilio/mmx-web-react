"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { AlertCircle, Calendar, ArrowRight, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { mutate as globalMutate } from "swr"
import { api } from "@/lib/client/api"
import { cn } from "@/lib/utils"
import type { Transaction } from "@/lib/shared/types"

interface PendingListCardProps {
  title: string
  variant: "danger" | "warning"
  transactions: Transaction[]
  emptyLabel: string
  maxItems?: number
  hrefViewAll?: string
}

const ICONS = {
  danger: AlertCircle,
  warning: Calendar,
}

const STYLES = {
  danger: {
    title: "text-red-700",
    icon: "text-red-600",
    badge: "bg-red-100 text-red-700",
    amount: "text-red-700",
  },
  warning: {
    title: "text-amber-700",
    icon: "text-amber-600",
    badge: "bg-amber-100 text-amber-700",
    amount: "text-amber-700",
  },
} as const

function formatBR(date: string): string {
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return date
  const dd = String(d.getUTCDate()).padStart(2, "0")
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0")
  return `${dd}/${mm}`
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(amount)
}

async function revalidatePendingCaches() {
  await Promise.all([
    globalMutate((key) => typeof key === "string" && key.startsWith("/transactions")),
    globalMutate("/reports/summary"),
    globalMutate("/reports/aging"),
    globalMutate((key) => typeof key === "string" && key.startsWith("/reports/cashflow")),
  ])
}

export function PendingListCard({
  title,
  variant,
  transactions,
  emptyLabel,
  maxItems = 5,
  hrefViewAll = "/transactions",
}: PendingListCardProps) {
  const Icon = ICONS[variant]
  const style = STYLES[variant]
  const visible = transactions.slice(0, maxItems)
  const hasMore = transactions.length > maxItems
  const total = transactions.reduce((sum, t) => sum + Number(t.amount || 0), 0)

  const [pendingId, setPendingId] = useState<string | null>(null)

  const handleMarkPaid = async (transaction: Transaction) => {
    if (pendingId) return
    setPendingId(transaction.id)
    try {
      await api.put<Transaction>(`/transactions/${transaction.id}`, { status: "completed" })
      await revalidatePendingCaches()
      toast.success(`"${transaction.description || "Transação"}" marcada como paga.`)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Tente novamente."
      toast.error(`Não foi possível marcar como pago. ${message}`)
    } finally {
      setPendingId(null)
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className={cn("flex items-center gap-2 text-base", style.title)}>
            <Icon className={cn("h-5 w-5", style.icon)} />
            {title}
            {transactions.length > 0 && (
              <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", style.badge)}>
                {transactions.length}
              </span>
            )}
          </CardTitle>
          {transactions.length > 0 && (
            <span className={cn("text-sm font-semibold", style.amount)}>{formatCurrency(total)}</span>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {visible.length === 0 ? (
          <p className="text-sm text-slate-500 py-4 text-center">{emptyLabel}</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {visible.map((t) => {
              const isProcessing = pendingId === t.id
              return (
                <li key={t.id} className="flex items-center justify-between py-2 text-sm">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {isProcessing ? (
                      <Loader2 className="h-4 w-4 animate-spin text-slate-400 shrink-0" />
                    ) : (
                      <Checkbox
                        checked={false}
                        onCheckedChange={() => handleMarkPaid(t)}
                        aria-label={`Marcar "${t.description || "transação"}" como paga`}
                        disabled={pendingId !== null}
                      />
                    )}
                    <span className="text-slate-500 font-mono text-xs whitespace-nowrap">{formatBR(t.date)}</span>
                    <span className="text-slate-800 truncate">{t.description || "(sem descrição)"}</span>
                  </div>
                  <span className={cn("font-medium whitespace-nowrap ml-2", style.amount)}>
                    {formatCurrency(Number(t.amount || 0))}
                  </span>
                </li>
              )
            })}
          </ul>
        )}
        {(hasMore || transactions.length > 0) && (
          <Link
            href={hrefViewAll}
            className="mt-3 inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
          >
            Ver todas
            <ArrowRight className="h-3 w-3" />
          </Link>
        )}
      </CardContent>
    </Card>
  )
}
