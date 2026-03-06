"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { formatCurrency } from "@/lib/utils"
import type { BudgetSummary } from "@/lib/types"
import { DynamicIcon } from "@/components/ui/dynamic-icon"
import { TrendingDown, Target } from "lucide-react"

interface CategoryDetailPanelProps {
  budgetSummary: BudgetSummary
  month: number
  year: number
}

export function CategoryDetailPanel({ budgetSummary }: CategoryDetailPanelProps) {
  const getSpentPercentage = (spent: number, funded: number) => {
    if (funded === 0) return 0
    return Math.min((spent / funded) * 100, 100)
  }

  const getProgressColor = (percentage: number) => {
    if (percentage <= 50) return "bg-green-500"
    if (percentage <= 80) return "bg-yellow-500"
    return "bg-red-500"
  }

  return (
    <div className="space-y-6 mt-6">
      {/* Group Summary */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
              style={{ backgroundColor: budgetSummary.budgetGroup.color }}
            >
              <DynamicIcon iconName={budgetSummary.budgetGroup.icon} size={20} className="text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">{budgetSummary.budgetGroup.name}</CardTitle>
              <p className="text-sm text-slate-600">{budgetSummary.budgetGroup.description}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-slate-600">Financiado</p>
              <p className="text-lg font-semibold">{formatCurrency(budgetSummary.funded)}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Gasto</p>
              <p className="text-lg font-semibold">{formatCurrency(budgetSummary.spent)}</p>
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-slate-600">Progresso</span>
              <span className="text-sm font-medium">
                {getSpentPercentage(budgetSummary.spent, budgetSummary.funded).toFixed(1)}%
              </span>
            </div>
            <Progress value={getSpentPercentage(budgetSummary.spent, budgetSummary.funded)} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Categories Breakdown */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Target className="h-5 w-5" />
          Categorias ({budgetSummary.categories.length})
        </h3>

        {budgetSummary.categories.length > 0 ? (
          <div className="space-y-3">
            {budgetSummary.categories.map((category) => (
              <Card key={category.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-medium">{category.name}</h4>
                      {category.description && <p className="text-sm text-slate-600">{category.description}</p>}
                    </div>
                    <Badge
                      className={
                        category.type === "income"
                          ? "bg-blue-100 text-blue-800 border-blue-200"
                          : "bg-slate-100 text-slate-800 border-slate-200"
                      }
                    >
                      {category.type === "income" ? "Receita" : "Despesa"}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <TrendingDown className="h-4 w-4" />
                      <span>Gasto: {formatCurrency(category.spent)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 text-center text-slate-500">
              <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Nenhuma categoria associada a este grupo</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
