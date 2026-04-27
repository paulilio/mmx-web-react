"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { formatCurrency } from "@/lib/shared/utils"
import type { BudgetSummary } from "@/lib/shared/types"
import { DynamicIcon } from "@/components/ui/dynamic-icon"
import { Target } from "lucide-react"

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

  const groupColor = budgetSummary.categoryGroup.color
  const percentage = getSpentPercentage(budgetSummary.spent, budgetSummary.funded)

  return (
    <div className="space-y-4 mt-2">
      {/* Group Summary */}
      <Card className="gap-3 py-4">
        <CardHeader className="px-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-md flex items-center justify-center shrink-0"
              style={{
                backgroundColor: `${groupColor}1a`,
                color: groupColor,
              }}
            >
              <DynamicIcon iconName={budgetSummary.categoryGroup.icon} size={20} />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-sm font-semibold truncate">{budgetSummary.categoryGroup.name}</CardTitle>
              {budgetSummary.categoryGroup.description && (
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {budgetSummary.categoryGroup.description}
                </p>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-4 space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Financiado</p>
              <p className="text-base font-semibold tabular-nums mt-0.5">{formatCurrency(budgetSummary.funded)}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Gasto</p>
              <p className="text-base font-semibold tabular-nums mt-0.5">{formatCurrency(budgetSummary.spent)}</p>
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs text-muted-foreground">Progresso</span>
              <span className="text-xs font-medium tabular-nums">{percentage.toFixed(1)}%</span>
            </div>
            <Progress value={percentage} className="h-1.5" />
          </div>
        </CardContent>
      </Card>

      {/* Categories Breakdown */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Target className="h-4 w-4 text-primary" />
          Categorias ({budgetSummary.categories.length})
        </h3>

        {budgetSummary.categories.length > 0 ? (
          <div className="space-y-2">
            {budgetSummary.categories.map((category) => (
              <Card key={category.id} className="gap-2 py-3">
                <CardContent className="px-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium truncate">{category.name}</span>
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded-full shrink-0 ${
                            category.type === "income"
                              ? "bg-income/10 text-income"
                              : "bg-expense/10 text-expense"
                          }`}
                        >
                          {category.type === "income" ? "Receita" : "Despesa"}
                        </span>
                      </div>
                      {category.description && (
                        <p className="text-xs text-muted-foreground truncate mt-0.5">{category.description}</p>
                      )}
                    </div>
                    <span className="text-sm font-semibold tabular-nums shrink-0 text-foreground/85">
                      {formatCurrency(category.spent)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="gap-2 py-4">
            <CardContent className="text-center text-muted-foreground px-4">
              <Target className="h-7 w-7 mx-auto mb-2 opacity-40" />
              <p className="text-xs">Nenhuma categoria associada a este grupo</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
