import { Badge } from "@/components/ui/badge"
import type { EntryStatus } from "@/lib/types"
import { isAfter, isBefore, addDays } from "date-fns"

interface EntryStatusBadgeProps {
  status: EntryStatus
  dueDate: string
}

export function EntryStatusBadge({ status, dueDate }: EntryStatusBadgeProps) {
  const today = new Date()
  const due = new Date(dueDate)
  const next7Days = addDays(today, 7)

  // Check if overdue
  const isOverdue = status === "open" && isBefore(due, today)

  // Check if due in next 7 days
  const isDueSoon = status === "open" && isAfter(due, today) && isBefore(due, next7Days)

  if (isOverdue) {
    return (
      <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200">
        Vencido
      </Badge>
    )
  }

  if (isDueSoon) {
    return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Vence em breve</Badge>
  }

  const statusMap = {
    open: { label: "Em aberto", className: "bg-blue-100 text-blue-800 border-blue-200" },
    partial: { label: "Parcial", className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
    paid: { label: "Pago", className: "bg-slate-100 text-slate-800 border-slate-200" },
    canceled: { label: "Cancelado", className: "bg-slate-100 text-slate-600 border-slate-200" },
  }

  const config = statusMap[status]

  return <Badge className={config.className}>{config.label}</Badge>
}
