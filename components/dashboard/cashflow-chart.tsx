"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
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

  if (error || !cashflowData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Fluxo de Caixa (30 dias)</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-80">
          <p className="text-slate-500">Erro ao carregar dados do fluxo de caixa</p>
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fluxo de Caixa (30 dias)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={cashflowData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="date" tickFormatter={formatDate} stroke="#64748b" fontSize={12} />
            <YAxis tickFormatter={formatCurrency} stroke="#64748b" fontSize={12} />
            <Tooltip
              formatter={(value: number, name: string) => [
                formatCurrency(value),
                name === "income" ? "Receitas" : name === "expense" ? "Despesas" : "Saldo",
              ]}
              labelFormatter={(label) => `Data: ${formatDate(label)}`}
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
              }}
            />
            <Legend
              formatter={(value) => (value === "income" ? "Receitas" : value === "expense" ? "Despesas" : "Saldo")}
            />
            <Line
              type="monotone"
              dataKey="income"
              stroke="#2563eb"
              strokeWidth={2}
              dot={{ fill: "#2563eb", strokeWidth: 2, r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="expense"
              stroke="#dc2626"
              strokeWidth={2}
              dot={{ fill: "#dc2626", strokeWidth: 2, r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="balance"
              stroke="#059669"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: "#059669", strokeWidth: 2, r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
