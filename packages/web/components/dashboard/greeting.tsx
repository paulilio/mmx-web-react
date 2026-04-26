"use client"

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

  const now = new Date()
  const greet = periodGreeting(now.getHours())
  const fullDate = formatPtBrFullDate(now)
  const firstName = user?.firstName?.trim() || "visitante"

  return (
    <div className="border-b border-slate-200 pb-4">
      <h1 className="text-3xl font-bold text-slate-900">
        {greet}, {firstName}!
      </h1>
      <p className="text-slate-600 mt-1">{fullDate}</p>
    </div>
  )
}
