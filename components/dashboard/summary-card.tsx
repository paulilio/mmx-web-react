import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface SummaryCardProps {
  title: string
  value: number
  icon: LucideIcon
  variant?: "default" | "warning" | "danger"
  currency?: boolean
}

export function SummaryCard({ title, value, icon: Icon, variant = "default", currency = true }: SummaryCardProps) {
  const formatValue = (val: number) => {
    if (currency) {
      return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(val)
    }
    return val.toString()
  }

  const getVariantStyles = () => {
    switch (variant) {
      case "warning":
        return "border-amber-200 bg-amber-50"
      case "danger":
        return "border-red-200 bg-red-50"
      default:
        return "border-slate-200 bg-white"
    }
  }

  const getIconStyles = () => {
    switch (variant) {
      case "warning":
        return "text-amber-600"
      case "danger":
        return "text-red-600"
      default:
        return "text-blue-600"
    }
  }

  return (
    <Card className={cn("transition-all hover:shadow-md", getVariantStyles())}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-600">{title}</CardTitle>
        <Icon className={cn("h-5 w-5", getIconStyles())} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-slate-900">{formatValue(value)}</div>
      </CardContent>
    </Card>
  )
}
