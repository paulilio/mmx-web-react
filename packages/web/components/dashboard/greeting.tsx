"use client"

import { useMemo } from "react"
import { useAuth } from "@/hooks/use-auth"

function periodGreeting(hour: number): string {
  if (hour < 12) return "Bom dia"
  if (hour < 18) return "Boa tarde"
  return "Boa noite"
}

function formatPtBrFullDate(date: Date): string {
  const formatted = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date)
  return formatted.charAt(0).toUpperCase() + formatted.slice(1)
}

export function Greeting() {
  const { user } = useAuth()

  const { greet, fullDate } = useMemo(() => {
    const now = new Date()
    return {
      greet: periodGreeting(now.getHours()),
      fullDate: formatPtBrFullDate(now),
    }
  }, [])
  const firstName = user?.firstName?.trim() || "visitante"

  return (
    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
      <h1 className="text-base font-semibold text-foreground">
        {greet}, {firstName}
      </h1>
      <span className="text-xs text-muted-foreground">{fullDate}</span>
    </div>
  )
}
