import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/shared/utils"

interface SummaryCardProps {
  title: string
  value: number
  icon: LucideIcon
  variant?: "default" | "warning" | "danger"
  currency?: boolean
}

const VARIANT_STYLES: Record<NonNullable<SummaryCardProps["variant"]>, { card: string; icon: string }> = {
  default: { card: "", icon: "text-primary" },
  warning: { card: "border-warning/30 bg-warning/5", icon: "text-warning" },
  danger: { card: "border-expense/30 bg-expense/5", icon: "text-expense" },
}

export function SummaryCard({ title, value, icon: Icon, variant = "default", currency = true }: SummaryCardProps) {
  const formatValue = (val: number) =>
    currency
      ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val)
      : val.toString()

  const styles = VARIANT_STYLES[variant]

  return (
    <Card className={cn("gap-2 py-4", styles.card)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4">
        <CardTitle className="text-xs font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className={cn("h-4 w-4", styles.icon)} />
      </CardHeader>
      <CardContent className="px-4">
        <div className="text-xl font-bold text-foreground tabular-nums">{formatValue(value)}</div>
      </CardContent>
    </Card>
  )
}
