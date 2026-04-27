"use client"

import { useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useAreas } from "@/hooks/use-areas"
import { useCategoryGroups } from "@/hooks/use-category-groups"
import { useCategories } from "@/hooks/use-categories"
import { useTransactions } from "@/hooks/use-transactions"
import { AddFundsModal } from "@/components/budget/add-funds-modal"
import { TransferFundsModal } from "@/components/budget/transfer-funds-modal"
import { RolloverModal } from "@/components/budget/rollover-modal"
import { CategoryDetailPanel } from "@/components/budget/category-detail-panel"
import { formatCurrency } from "@/lib/shared/utils"
import type { Category, CategoryGroup, Area } from "@/lib/shared/types"
import { DynamicIcon } from "@/components/ui/dynamic-icon"
import {
  PiggyBank,
  Plus,
  ArrowRightLeft,
  Settings,
  Eye,
  Loader2,
  TrendingUp,
  TrendingDown,
  Calendar,
} from "lucide-react"

interface BudgetSummary {
  categoryGroup: CategoryGroup
  area: Area | null
  planned: number
  funded: number
  spent: number
  available: number
  categories: Array<Category & { spent: number }>
}

export default function BudgetPage() {
  const currentDate = new Date()
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear())
  const [selectedBudgetGroup, setSelectedBudgetGroup] = useState<BudgetSummary | null>(null)
  const [showAddFunds, setShowAddFunds] = useState(false)
  const [showTransferFunds, setShowTransferFunds] = useState(false)
  const [showRollover, setShowRollover] = useState(false)
  const [showCategoryDetail, setShowCategoryDetail] = useState(false)

  const monthString = `${selectedYear}-${selectedMonth.toString().padStart(2, "0")}`
  const { areas, isLoading: areasLoading } = useAreas()
  const { categoryGroups, isLoading: groupsLoading } = useCategoryGroups()
  const { categories } = useCategories()
  const { getSpentByCategory } = useTransactions({ month: monthString })

  const isLoading = areasLoading || groupsLoading

  const budgetSummaries: BudgetSummary[] = (categoryGroups || [])
    .filter((group) => group.status === "active")
    .map((group) => {
      const area = areas?.find((a) => a.id === group.areaId) ?? null
      const groupCategories = categories.filter((c) => c.categoryGroupId === group.id)

      const spent = groupCategories.reduce((sum, category) => {
        return sum + getSpentByCategory(category.id, monthString)
      }, 0)

      const planned = 0
      const funded = 0
      const available = funded - spent

      return {
        categoryGroup: group,
        area,
        planned,
        funded,
        spent,
        available,
        categories: groupCategories.map((cat) => ({
          ...cat,
          spent: getSpentByCategory(cat.id, monthString),
        })),
      }
    })

  const months = [
    { value: 1, label: "Janeiro" },
    { value: 2, label: "Fevereiro" },
    { value: 3, label: "Março" },
    { value: 4, label: "Abril" },
    { value: 5, label: "Maio" },
    { value: 6, label: "Junho" },
    { value: 7, label: "Julho" },
    { value: 8, label: "Agosto" },
    { value: 9, label: "Setembro" },
    { value: 10, label: "Outubro" },
    { value: 11, label: "Novembro" },
    { value: 12, label: "Dezembro" },
  ]

  const years = Array.from({ length: 10 }, (_, i) => currentDate.getFullYear() - 2 + i)

  const handleAddFunds = (budgetGroup: BudgetSummary) => {
    setSelectedBudgetGroup(budgetGroup)
    setShowAddFunds(true)
  }

  const handleTransferFunds = (budgetGroup: BudgetSummary) => {
    setSelectedBudgetGroup(budgetGroup)
    setShowTransferFunds(true)
  }

  const handleRollover = (budgetGroup: BudgetSummary) => {
    setSelectedBudgetGroup(budgetGroup)
    setShowRollover(true)
  }

  const handleViewDetails = (budgetGroup: BudgetSummary) => {
    setSelectedBudgetGroup(budgetGroup)
    setShowCategoryDetail(true)
  }

  const getAvailableColor = (available: number) => {
    if (available > 0) return "text-income"
    if (available < 0) return "text-expense"
    return "text-muted-foreground"
  }

  const totalPlanned = budgetSummaries.reduce((sum, item) => sum + item.planned, 0)
  const totalFunded = budgetSummaries.reduce((sum, item) => sum + item.funded, 0)
  const totalSpent = budgetSummaries.reduce((sum, item) => sum + item.spent, 0)
  const totalAvailable = budgetSummaries.reduce((sum, item) => sum + item.available, 0)

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <PiggyBank className="h-8 w-8 text-primary" />
              Orçamento
            </h1>
            <p className="text-muted-foreground mt-1">Gerencie seus grupos orçamentários e controle de gastos</p>
          </div>
        </div>

        <Card className="gap-3 py-4">
          <CardHeader className="px-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Período
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-foreground">Mês:</label>
                <Select value={selectedMonth.toString()} onValueChange={(v) => setSelectedMonth(Number.parseInt(v))}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month) => (
                      <SelectItem key={month.value} value={month.value.toString()}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-foreground">Ano:</label>
                <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(Number.parseInt(v))}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="gap-3 py-4">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Planejado</p>
                  <p className="text-2xl font-bold text-foreground">{formatCurrency(totalPlanned)}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="gap-3 py-4">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Financiado</p>
                  <p className="text-2xl font-bold text-foreground">{formatCurrency(totalFunded)}</p>
                </div>
                <PiggyBank className="h-8 w-8 text-income" />
              </div>
            </CardContent>
          </Card>

          <Card className="gap-3 py-4">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Gasto</p>
                  <p className="text-2xl font-bold text-foreground">{formatCurrency(totalSpent)}</p>
                </div>
                <TrendingDown className="h-8 w-8 text-expense" />
              </div>
            </CardContent>
          </Card>

          <Card className="gap-3 py-4">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Disponível</p>
                  <p className={`text-2xl font-bold ${getAvailableColor(totalAvailable)}`}>
                    {formatCurrency(totalAvailable)}
                  </p>
                </div>
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center ${
                    totalAvailable > 0 ? "bg-income/15" : totalAvailable < 0 ? "bg-expense/15" : "bg-accent"
                  }`}
                >
                  {totalAvailable > 0 ? "+" : totalAvailable < 0 ? "-" : "="}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="gap-3 py-4">
          <CardHeader className="px-4">
            <CardTitle className="text-lg">Grupos de Categorias</CardTitle>
          </CardHeader>
          <CardContent className="p-0 [&_td]:px-4 [&_th]:px-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : budgetSummaries && budgetSummaries.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Grupo de Categoria</TableHead>
                    <TableHead>Área</TableHead>
                    <TableHead className="text-right">Planejado</TableHead>
                    <TableHead className="text-right">Financiado</TableHead>
                    <TableHead className="text-right">Gasto</TableHead>
                    <TableHead className="text-right">Disponível</TableHead>
                    <TableHead className="text-center">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {budgetSummaries.map((summary) => (
                    <TableRow key={summary.categoryGroup.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: summary.categoryGroup.color }}
                          />
                          <DynamicIcon iconName={summary.categoryGroup.icon} size={18} />
                          <div>
                            <p className="font-medium">{summary.categoryGroup.name}</p>
                            <p className="text-sm text-muted-foreground">{summary.categories.length} categorias</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">{summary.area?.name || "Sem área"}</span>
                      </TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(summary.planned)}</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(summary.funded)}</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(summary.spent)}</TableCell>
                      <TableCell className={`text-right font-medium ${getAvailableColor(summary.available)}`}>
                        {formatCurrency(summary.available)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAddFunds(summary)}
                            className="h-8 w-8 p-0"
                            title="Adicionar fundos"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleTransferFunds(summary)}
                            className="h-8 w-8 p-0"
                            title="Transferir fundos"
                          >
                            <ArrowRightLeft className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRollover(summary)}
                            className="h-8 w-8 p-0"
                            title="Configurar rollover"
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewDetails(summary)}
                            className="h-8 w-8 p-0"
                            title="Ver detalhes"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                <PiggyBank className="h-12 w-12 mb-4" />
                <p className="text-lg font-medium">Nenhum grupo de categoria encontrado</p>
                <p className="text-sm">Crie grupos de categorias na seção de Categorias</p>
              </div>
            )}
          </CardContent>
        </Card>

        <AddFundsModal
          open={showAddFunds}
          onOpenChange={setShowAddFunds}
          budgetGroup={selectedBudgetGroup?.categoryGroup}
          month={selectedMonth}
          year={selectedYear}
        />

        <TransferFundsModal
          open={showTransferFunds}
          onOpenChange={setShowTransferFunds}
          budgetGroups={categoryGroups || []}
          month={selectedMonth}
          year={selectedYear}
        />

        <RolloverModal
          open={showRollover}
          onOpenChange={setShowRollover}
          budgetGroup={selectedBudgetGroup?.categoryGroup}
          month={selectedMonth}
          year={selectedYear}
        />

        <Sheet open={showCategoryDetail} onOpenChange={setShowCategoryDetail}>
          <SheetContent className="w-full sm:max-w-xl lg:max-w-2xl overflow-y-auto p-6 gap-4">
            <SheetHeader className="p-0">
              <SheetTitle className="text-base">Detalhes do Grupo</SheetTitle>
            </SheetHeader>
            {selectedBudgetGroup && (
              <CategoryDetailPanel budgetSummary={selectedBudgetGroup} month={selectedMonth} year={selectedYear} />
            )}
          </SheetContent>
        </Sheet>
      </div>
    </MainLayout>
  )
}
