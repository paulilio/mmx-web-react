"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarDays, ArrowUp, ArrowDown } from "lucide-react"
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
      // Date strings stored as YYYY-MM-DD UTC. parse to UTC components
      // to avoid timezone bumping the date by ±1.
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
    const startWeekday = firstDay.getDay() // 0 = Sun

    const result: Array<number | null> = []
    for (let i = 0; i < startWeekday; i++) result.push(null)
    for (let d = 1; d <= daysInMonth; d++) result.push(d)
    while (result.length % 7 !== 0) result.push(null)
    return result
  }, [year, month])

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <CalendarDays className="h-5 w-5 text-blue-600" />
          {monthLabel}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1 text-center text-xs">
          {WEEKDAYS.map((label) => (
            <div key={label} className="font-medium text-slate-500 py-1">
              {label}
            </div>
          ))}
          {cells.map((day, idx) => {
            if (day === null) {
              return <div key={`empty-${idx}`} className="h-12" />
            }
            const markers = txByDay.get(day)
            const isToday = day === todayDate
            return (
              <div
                key={day}
                className={cn(
                  "h-12 rounded flex flex-col items-center justify-between py-1 px-0.5",
                  "border border-transparent",
                  isToday
                    ? "bg-blue-50 border-blue-300 text-blue-900 font-semibold"
                    : "hover:bg-slate-50",
                )}
              >
                <span className="text-sm leading-none">{day}</span>
                <div className="flex items-center gap-0.5 h-3">
                  {markers?.income && <ArrowUp className="h-3 w-3 text-green-600" strokeWidth={3} />}
                  {markers?.expense && <ArrowDown className="h-3 w-3 text-red-600" strokeWidth={3} />}
                </div>
              </div>
            )
          })}
        </div>
        <div className="flex items-center gap-4 mt-3 text-xs text-slate-600 border-t border-slate-100 pt-3">
          <span className="flex items-center gap-1">
            <ArrowUp className="h-3 w-3 text-green-600" strokeWidth={3} />
            Entradas
          </span>
          <span className="flex items-center gap-1">
            <ArrowDown className="h-3 w-3 text-red-600" strokeWidth={3} />
            Saídas
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
