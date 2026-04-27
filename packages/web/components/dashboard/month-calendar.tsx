"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarDays } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Transaction } from "@/lib/shared/types"

interface MonthCalendarProps {
  transactions: Transaction[]
}

interface DayMarkers {
  income: boolean
  expense: boolean
}

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]

function formatMonthYear(date: Date): string {
  const formatted = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(date)
  return formatted.charAt(0).toUpperCase() + formatted.slice(1)
}

export function MonthCalendar({ transactions }: MonthCalendarProps) {
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth()
  const todayDate = today.getDate()

  const monthLabel = formatMonthYear(today)

  const txByDay = useMemo(() => {
    const map = new Map<number, DayMarkers>()
    for (const t of transactions) {
      if (!t.date) continue
      const parsed = new Date(t.date)
      if (Number.isNaN(parsed.getTime())) continue
      if (parsed.getUTCFullYear() !== year || parsed.getUTCMonth() !== month) continue

      const day = parsed.getUTCDate()
      const entry = map.get(day) ?? { income: false, expense: false }
      const type = t.type?.trim().toLowerCase()
      if (type === "income") entry.income = true
      if (type === "expense") entry.expense = true
      map.set(day, entry)
    }
    return map
  }, [transactions, year, month])

  const cells = useMemo(() => {
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startWeekday = firstDay.getDay()

    const result: Array<number | null> = []
    for (let i = 0; i < startWeekday; i++) result.push(null)
    for (let d = 1; d <= daysInMonth; d++) result.push(d)
    while (result.length % 7 !== 0) result.push(null)
    return result
  }, [year, month])

  return (
    <Card className="gap-3 py-4">
      <CardHeader className="px-4">
        <CardTitle className="flex items-center gap-2 text-sm">
          <CalendarDays className="h-4 w-4 text-primary" />
          {monthLabel}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4">
        <div className="grid grid-cols-7">
          {WEEKDAYS.map((label) => (
            <div
              key={label}
              className="text-[10px] uppercase tracking-wide font-medium text-muted-foreground py-1.5 text-center"
            >
              {label}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-px bg-border rounded-md overflow-hidden border">
          {cells.map((day, idx) => {
            if (day === null) {
              return <div key={`empty-${idx}`} className="bg-card h-9" />
            }
            const markers = txByDay.get(day)
            const isToday = day === todayDate
            return (
              <div
                key={day}
                className={cn(
                  "bg-card h-9 px-1.5 py-1 flex flex-col items-start justify-between transition-colors",
                  "hover:bg-accent",
                )}
              >
                <span
                  className={cn(
                    "text-[11px] leading-none tabular-nums",
                    isToday
                      ? "inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold text-[10px]"
                      : "text-foreground/80 px-1 pt-0.5",
                  )}
                >
                  {day}
                </span>
                {(markers?.income || markers?.expense) && (
                  <div className="flex items-center gap-1 self-end">
                    {markers?.income && <span className="h-1.5 w-1.5 rounded-full bg-income" />}
                    {markers?.expense && <span className="h-1.5 w-1.5 rounded-full bg-expense" />}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className="flex items-center gap-4 mt-3 text-[11px] text-muted-foreground border-t pt-3">
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-income" />
            Entradas
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-expense" />
            Saídas
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
