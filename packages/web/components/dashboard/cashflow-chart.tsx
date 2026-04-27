"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useCashflowData } from "@/hooks/use-dashboard-data"

export function CashflowChart() {
  const { data: cashflowData, isLoading, error } = useCashflowData(30)

  if (isLoading) {
    return (
      <Card className="gap-3 py-4">
        <CardHeader className="px-4">
          <CardTitle className="text-sm">Fluxo de Caixa (30 dias)</CardTitle>
        </CardHeader>
        <CardContent className="px-4">
          <Skeleton className="h-72 w-full rounded" />
        </CardContent>
      </Card>
    )
  }

  if (error || !cashflowData || cashflowData.length === 0) {
    return (
      <Card className="gap-3 py-4">
        <CardHeader className="px-4">
          <CardTitle className="text-sm">Fluxo de Caixa (30 dias)</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-72 px-4">
          <p className="text-muted-foreground">
            {error ? "Erro ao carregar dados do fluxo de caixa" : "Nenhum dado disponível para o período"}
          </p>
        </CardContent>
      </Card>
    )
  }

  const formatCurrencyShort = (value: number) => {
    const abs = Math.abs(value)
    const sign = value < 0 ? "-" : ""
    if (abs >= 1000) {
      return `${sign}R$ ${(abs / 1000).toFixed(abs >= 10000 ? 0 : 1)}k`
    }
    return `${sign}R$ ${abs.toFixed(0)}`
  }

  const formatDateShort = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })
  }

  const chartWidth = 800
  const chartHeight = 280
  const padding = { top: 16, right: 24, bottom: 32, left: 64 }
  const innerWidth = chartWidth - padding.left - padding.right
  const innerHeight = chartHeight - padding.top - padding.bottom

  const maxValue = Math.max(...cashflowData.map((d) => Math.max(d.income, d.expense, Math.abs(d.balance))))
  const minValue = Math.min(0, ...cashflowData.map((d) => d.balance))
  const valueRange = maxValue - minValue || 1

  const xScale = (i: number) => (i / Math.max(cashflowData.length - 1, 1)) * innerWidth
  const yScale = (value: number) => innerHeight - ((value - minValue) / valueRange) * innerHeight

  const periodStart = cashflowData[0]?.date ?? ""
  const periodEnd = cashflowData[cashflowData.length - 1]?.date ?? ""

  const createPath = (dataKey: keyof (typeof cashflowData)[0]) =>
    cashflowData.map((d, i) => `${i === 0 ? "M" : "L"} ${xScale(i)} ${yScale(d[dataKey] as number)}`).join(" ")

  // Show ~6-8 x-axis labels max
  const labelStride = Math.max(1, Math.ceil(cashflowData.length / 7))
  const xLabelIndices = cashflowData
    .map((_, i) => i)
    .filter((i) => i === 0 || i === cashflowData.length - 1 || i % labelStride === 0)

  // 5 y-axis grid lines
  const yTicks = [0, 0.25, 0.5, 0.75, 1]

  return (
    <Card className="gap-3 py-4">
      <CardHeader className="px-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Fluxo de Caixa (30 dias)</CardTitle>
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="h-0.5 w-3 bg-income rounded-full" />
              Receitas
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-0.5 w-3 bg-expense rounded-full" />
              Despesas
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-px w-3 border-t border-dashed border-muted-foreground" />
              Saldo
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-4">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          preserveAspectRatio="xMidYMid meet"
          className="w-full h-auto max-h-72"
          role="img"
          aria-label="Gráfico de fluxo de caixa"
        >
          {/* Y-axis grid lines + labels */}
          {yTicks.map((ratio) => {
            const value = minValue + valueRange * ratio
            const y = padding.top + innerHeight - ratio * innerHeight
            return (
              <g key={ratio}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={padding.left + innerWidth}
                  y2={y}
                  className="stroke-border"
                  strokeWidth="1"
                />
                <text
                  x={padding.left - 8}
                  y={y + 3}
                  textAnchor="end"
                  fontSize="11"
                  className="fill-muted-foreground"
                  vectorEffect="non-scaling-stroke"
                >
                  {formatCurrencyShort(value)}
                </text>
              </g>
            )
          })}

          {/* X-axis labels (cherry-picked indices) */}
          {xLabelIndices.map((i) => (
            <text
              key={i}
              x={padding.left + xScale(i)}
              y={padding.top + innerHeight + 18}
              textAnchor="middle"
              fontSize="11"
              className="fill-muted-foreground"
            >
              {formatDateShort(cashflowData[i].date)}
            </text>
          ))}

          {/* X-axis baseline */}
          <line
            x1={padding.left}
            y1={padding.top + innerHeight}
            x2={padding.left + innerWidth}
            y2={padding.top + innerHeight}
            className="stroke-border"
            strokeWidth="1"
          />

          {/* Data lines */}
          <g transform={`translate(${padding.left}, ${padding.top})`}>
            {/* Saldo (third level — quiet, dashed, thin) */}
            <path
              d={createPath("balance")}
              fill="none"
              className="stroke-muted-foreground/50"
              strokeWidth="1.25"
              strokeDasharray="4,3"
            />

            {/* Receitas + Despesas (primary visual focus) */}
            <path d={createPath("income")} fill="none" className="stroke-income" strokeWidth="2" strokeLinecap="round" />
            <path d={createPath("expense")} fill="none" className="stroke-expense" strokeWidth="2" strokeLinecap="round" />

            {/* Data points (no points on saldo to keep it quiet) */}
            {cashflowData.map((d, i) => (
              <g key={i}>
                <circle cx={xScale(i)} cy={yScale(d.income)} r="2.5" className="fill-income" />
                <circle cx={xScale(i)} cy={yScale(d.expense)} r="2.5" className="fill-expense" />
              </g>
            ))}
          </g>
        </svg>

        <div className="mt-3 text-[11px] text-muted-foreground border-t pt-2">
          {cashflowData.length} pontos · Período {formatDateShort(periodStart)} a {formatDateShort(periodEnd)}
        </div>
      </CardContent>
    </Card>
  )
}
