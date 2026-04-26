"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Receipt, TrendingUp, TrendingDown } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Transaction, Area } from "@/lib/shared/types"

interface MonthlyResultProps {
  transactions: Transaction[]
  areas: Area[]
}

interface AreaTotal {
  areaId: string
  name: string
  amount: number
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)
}

function formatMonthYear(date: Date): string {
  const formatted = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(date)
  return formatted.charAt(0).toUpperCase() + formatted.slice(1)
}

export function MonthlyResult({ transactions, areas }: MonthlyResultProps) {
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth()
  const monthLabel = formatMonthYear(today)

  const { incomeTotal, expenseTotal, incomeByArea, expenseByArea } = useMemo(() => {
    const areaName = new Map(areas.map((a) => [a.id, a.name]))
    const inMap = new Map<string, number>()
    const outMap = new Map<string, number>()

    let incomeSum = 0
    let expenseSum = 0

    for (const t of transactions) {
      if (!t.date) continue
      const parsed = new Date(t.date)
      if (Number.isNaN(parsed.getTime())) continue
      if (parsed.getUTCFullYear() !== year || parsed.getUTCMonth() !== month) continue
      if (t.status?.trim().toLowerCase() === "cancelled") continue

      const amount = Number(t.amount || 0)
      const type = t.type?.trim().toLowerCase()
      const areaId = t.areaId || "uncategorized"
      const target = type === "income" ? inMap : outMap

      target.set(areaId, (target.get(areaId) ?? 0) + amount)
      if (type === "income") incomeSum += amount
      else if (type === "expense") expenseSum += amount
    }

    const toList = (map: Map<string, number>): AreaTotal[] =>
      Array.from(map.entries())
        .map(([areaId, amount]) => ({
          areaId,
          name: areaName.get(areaId) || "Sem área",
          amount,
        }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 3)

    return {
      incomeTotal: incomeSum,
      expenseTotal: expenseSum,
      incomeByArea: toList(inMap),
      expenseByArea: toList(outMap),
    }
  }, [transactions, areas, year, month])

  const result = incomeTotal - expenseTotal
  const resultPositive = result >= 0

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Receipt className="h-5 w-5 text-blue-600" />
          Resultado de {monthLabel}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <TrendingUp className="h-4 w-4 text-green-600" />
              Receitas
            </div>
            <p className="text-xl font-semibold text-slate-900 mt-1">{formatCurrency(incomeTotal)}</p>
            {incomeByArea.length > 0 && (
              <ul className="mt-2 space-y-0.5 text-xs text-slate-600">
                {incomeByArea.map((item) => (
                  <li key={item.areaId} className="flex items-center justify-between">
                    <span className="truncate">{item.name}</span>
                    <span className="font-medium text-slate-700 ml-2">{formatCurrency(item.amount)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <TrendingDown className="h-4 w-4 text-red-600" />
              Despesas
            </div>
            <p className="text-xl font-semibold text-slate-900 mt-1">{formatCurrency(expenseTotal)}</p>
            {expenseByArea.length > 0 && (
              <ul className="mt-2 space-y-0.5 text-xs text-slate-600">
                {expenseByArea.map((item) => (
                  <li key={item.areaId} className="flex items-center justify-between">
                    <span className="truncate">{item.name}</span>
                    <span className="font-medium text-slate-700 ml-2">{formatCurrency(item.amount)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="border-t border-slate-200 pt-3 flex items-center justify-between">
          <span className="text-sm font-medium text-slate-700">Resultado líquido</span>
          <span
            className={cn(
              "text-xl font-bold",
              resultPositive ? "text-green-700" : "text-red-700",
            )}
          >
            {resultPositive ? "+" : ""}
            {formatCurrency(result)}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
