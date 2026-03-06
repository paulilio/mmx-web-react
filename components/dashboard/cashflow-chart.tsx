"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useCashflowData } from "@/hooks/use-dashboard-data"
import { Loader2 } from "lucide-react"

export function CashflowChart() {
  const { data: cashflowData, isLoading, error } = useCashflowData(30)

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Fluxo de Caixa (30 dias)</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-80">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </CardContent>
      </Card>
    )
  }

  if (error || !cashflowData || cashflowData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Fluxo de Caixa (30 dias)</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-80">
          <p className="text-slate-500">
            {error ? "Erro ao carregar dados do fluxo de caixa" : "Nenhum dado disponível para o período"}
          </p>
        </CardContent>
      </Card>
    )
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
    })
  }

  const chartWidth = 800
  const chartHeight = 400
  const padding = { top: 20, right: 60, bottom: 40, left: 80 }
  const innerWidth = chartWidth - padding.left - padding.right
  const innerHeight = chartHeight - padding.top - padding.bottom

  // Calculate scales
  const maxValue = Math.max(...cashflowData.map((d) => Math.max(d.income, d.expense, Math.abs(d.balance))))
  const minValue = Math.min(0, ...cashflowData.map((d) => d.balance))
  const valueRange = maxValue - minValue

  const xScale = (index: number) => (index / (cashflowData.length - 1)) * innerWidth
  const yScale = (value: number) => innerHeight - ((value - minValue) / valueRange) * innerHeight

  // Generate path data for lines
  const createPath = (dataKey: keyof (typeof cashflowData)[0]) => {
    return cashflowData.map((d, i) => `${i === 0 ? "M" : "L"} ${xScale(i)} ${yScale(d[dataKey] as number)}`).join(" ")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fluxo de Caixa (30 dias)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full overflow-x-auto">
          <svg width={chartWidth} height={chartHeight} className="border border-gray-200 rounded">
            {/* Grid lines */}
            <defs>
              <pattern id="grid" width="40" height="30" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 30" fill="none" stroke="#e2e8f0" strokeWidth="1" />
              </pattern>
            </defs>
            <rect x={padding.left} y={padding.top} width={innerWidth} height={innerHeight} fill="url(#grid)" />

            {/* Y-axis */}
            <line
              x1={padding.left}
              y1={padding.top}
              x2={padding.left}
              y2={padding.top + innerHeight}
              stroke="#64748b"
              strokeWidth="1"
            />

            {/* X-axis */}
            <line
              x1={padding.left}
              y1={padding.top + innerHeight}
              x2={padding.left + innerWidth}
              y2={padding.top + innerHeight}
              stroke="#64748b"
              strokeWidth="1"
            />

            {/* Y-axis labels */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
              const value = minValue + valueRange * ratio
              const y = padding.top + innerHeight - ratio * innerHeight
              return (
                <g key={ratio}>
                  <text x={padding.left - 10} y={y + 4} textAnchor="end" fontSize="12" fill="#64748b">
                    {formatCurrency(value)}
                  </text>
                  <line x1={padding.left - 5} y1={y} x2={padding.left} y2={y} stroke="#64748b" strokeWidth="1" />
                </g>
              )
            })}

            {/* X-axis labels */}
            {cashflowData.map((d, i) => (
              <g key={i}>
                <text
                  x={padding.left + xScale(i)}
                  y={padding.top + innerHeight + 20}
                  textAnchor="middle"
                  fontSize="12"
                  fill="#64748b"
                >
                  {formatDate(d.date)}
                </text>
                <line
                  x1={padding.left + xScale(i)}
                  y1={padding.top + innerHeight}
                  x2={padding.left + xScale(i)}
                  y2={padding.top + innerHeight + 5}
                  stroke="#64748b"
                  strokeWidth="1"
                />
              </g>
            ))}

            {/* Data lines */}
            <g transform={`translate(${padding.left}, ${padding.top})`}>
              {/* Income line */}
              <path d={createPath("income")} fill="none" stroke="#2563eb" strokeWidth="3" />

              {/* Expense line */}
              <path d={createPath("expense")} fill="none" stroke="#dc2626" strokeWidth="3" />

              {/* Balance line */}
              <path d={createPath("balance")} fill="none" stroke="#059669" strokeWidth="3" strokeDasharray="8,4" />

              {/* Data points */}
              {cashflowData.map((d, i) => (
                <g key={i}>
                  <circle cx={xScale(i)} cy={yScale(d.income)} r="4" fill="#2563eb" />
                  <circle cx={xScale(i)} cy={yScale(d.expense)} r="4" fill="#dc2626" />
                  <circle cx={xScale(i)} cy={yScale(d.balance)} r="4" fill="#059669" />
                </g>
              ))}
            </g>

            {/* Legend */}
            <g transform={`translate(${chartWidth - 150}, 30)`}>
              <rect x="0" y="0" width="140" height="80" fill="white" stroke="#e2e8f0" strokeWidth="1" rx="4" />
              <g transform="translate(10, 20)">
                <line x1="0" y1="0" x2="20" y2="0" stroke="#2563eb" strokeWidth="3" />
                <circle cx="10" cy="0" r="3" fill="#2563eb" />
                <text x="25" y="4" fontSize="12" fill="#374151">
                  Receitas
                </text>
              </g>
              <g transform="translate(10, 40)">
                <line x1="0" y1="0" x2="20" y2="0" stroke="#dc2626" strokeWidth="3" />
                <circle cx="10" cy="0" r="3" fill="#dc2626" />
                <text x="25" y="4" fontSize="12" fill="#374151">
                  Despesas
                </text>
              </g>
              <g transform="translate(10, 60)">
                <line x1="0" y1="0" x2="20" y2="0" stroke="#059669" strokeWidth="3" strokeDasharray="8,4" />
                <circle cx="10" cy="0" r="3" fill="#059669" />
                <text x="25" y="4" fontSize="12" fill="#374151">
                  Saldo
                </text>
              </g>
            </g>
          </svg>
        </div>

        {/* Data summary */}
        <div className="mt-4 text-sm text-gray-600">
          <p>
            Dados: {cashflowData.length} pontos • Período: {formatDate(cashflowData[0]?.date)} a{" "}
            {formatDate(cashflowData[cashflowData.length - 1]?.date)}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
