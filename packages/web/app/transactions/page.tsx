"use client"

import { useState, useMemo, useEffect, Fragment } from "react"
import {
  Plus,
  TrendingUp,
  TrendingDown,
  Filter,
  Edit,
  Trash2,
  Check,
  X,
  Repeat,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  Settings,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { useTransactions } from "@/hooks/use-transactions"
import { useCategories } from "@/hooks/use-categories"
import { useCategoryGroups } from "@/hooks/use-category-groups"
import { useAreas } from "@/hooks/use-areas"
import { useContacts } from "@/hooks/use-contacts"
import { TransactionFormModal } from "@/components/transactions/transaction-form-modal"
import { RecurringDeleteModal } from "@/components/transactions/recurring-delete-modal"
import { TransactionDetailRow } from "@/components/transactions/transaction-detail-row"
import { formatCurrency } from "@/lib/shared/utils"
import { formatDateToPtBR, isSameMonth } from "@/lib/shared/date-utils"
import { MainLayout } from "@/components/layout/main-layout"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import type { Category, Transaction, TransactionFormData as TransactionPayloadFormData } from "@/lib/shared/types"
import type { TransactionFormData as TransactionModalFormData } from "@/lib/shared/validations"
import { DatePicker } from "@/components/ui/date-picker"

// Custom SVG Pie Chart Component
const CustomPieChart = ({ percentage, color = "#10B981" }: { percentage: number; color?: string }) => {
  const safePercentage = isNaN(percentage) || !isFinite(percentage) ? 0 : Math.max(0, Math.min(100, percentage))

  const radius = 36
  const circumference = 2 * Math.PI * radius
  const strokeDasharray = `${(safePercentage / 100) * circumference} ${circumference}`

  return (
    <div className="relative w-20 h-20">
      <svg width="80" height="80" className="transform -rotate-90">
        {/* Background circle */}
        <circle cx="40" cy="40" r={radius} fill="none" stroke="#E5E7EB" strokeWidth="3" />
        {/* Progress circle */}
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeDasharray={strokeDasharray}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm" style={{ color }}>
          {Math.round(safePercentage)}%
        </span>
      </div>
    </div>
  )
}

// Custom SVG Bar Chart Component
const CustomBarChart = ({ data }: { data: Array<{ name: string; atual: number; falta: number }> }) => {
  const safeData = data.map((item) => ({
    ...item,
    atual: isNaN(item.atual) || !isFinite(item.atual) ? 0 : Math.max(0, item.atual),
    falta: isNaN(item.falta) || !isFinite(item.falta) ? 0 : Math.max(0, item.falta),
  }))

  const maxValue = Math.max(...safeData.map((d) => d.atual + d.falta), 1)
  const barWidth = 32
  const spacing = 40
  const chartHeight = 60
  const chartWidth = safeData.length * (barWidth + spacing)

  return (
    <div className="flex flex-col items-center">
      <div className="h-16 mb-2 flex items-end justify-center" style={{ width: chartWidth }}>
        <svg width={chartWidth} height={chartHeight} className="overflow-visible">
          {safeData.map((item, index) => {
            const x = index * (barWidth + spacing) + spacing / 2
            const totalHeight = ((item.atual + item.falta) / maxValue) * chartHeight
            const atualHeight = (item.atual / maxValue) * chartHeight

            const isReceitas = item.name === "Recebimentos"
            const barColor = isReceitas ? "#10B981" : "#2563EB"

            return (
              <g key={item.name}>
                {/* Background bar (total) */}
                <rect x={x} y={chartHeight - totalHeight} width={barWidth} height={totalHeight} fill="#E2E8F0" rx="4" />
                {/* Foreground bar (atual) */}
                <rect
                  x={x}
                  y={chartHeight - atualHeight}
                  width={barWidth}
                  height={atualHeight}
                  fill={barColor}
                  rx="4"
                />
              </g>
            )
          })}
        </svg>
      </div>

      <div className="grid grid-cols-2 gap-8 text-center text-xs w-full">
        {safeData.map((item) => {
          const isReceitas = item.name === "Recebimentos"
          const labelColor = isReceitas ? "text-green-600" : "text-blue-600"

          return (
            <div key={item.name} className="flex flex-col">
              <div className={`font-semibold text-xs mb-1 ${labelColor}`}>{item.name}</div>
              <div className={`font-semibold text-sm ${labelColor}`}>R$ {item.atual.toFixed(0)}k</div>
              <div className="text-slate-500 text-xs mt-1">FALTA R$ {item.falta.toFixed(0)}k</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

void CustomPieChart
void CustomBarChart

type EditableValue = string | number

const getSafeDate = (dateValue: unknown): Date => {
  if (!dateValue) return new Date()

  if (dateValue instanceof Date) {
    return isNaN(dateValue.getTime()) ? new Date() : dateValue
  }

  if (typeof dateValue !== "string" && typeof dateValue !== "number") {
    return new Date()
  }

  const date = new Date(dateValue)
  return isNaN(date.getTime()) ? new Date() : date
}

const isValidDateString = (dateValue: unknown): boolean => {
  if (!dateValue) return false

  if (dateValue instanceof Date) {
    return !isNaN(dateValue.getTime())
  }

  if (typeof dateValue !== "string" && typeof dateValue !== "number") {
    return false
  }

  const date = new Date(dateValue)
  return !isNaN(date.getTime())
}

export default function TransactionsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1)
  const [activeTab, setActiveTab] = useState("income")
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "completed" | "cancelled">("all")

  const [editingTransaction, setEditingTransaction] = useState<string | null>(null)
  const [editingField, setEditingField] = useState<string | null>(null)
  const [editingValue, setEditingValue] = useState<EditableValue>("")

  const [showRecurringDeleteModal, setShowRecurringDeleteModal] = useState(false)
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null)

  const [sortField, setSortField] = useState<string>("date")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [showColumnConfig, setShowColumnConfig] = useState(false)
  const [visibleColumns, setVisibleColumns] = useState({
    id: false,
    date: true,
    description: true,
    categoryId: true,
    status: true,
    amount: true,
    actions: true,
  })

  type VisibleColumnKey = keyof typeof visibleColumns

  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const toggleColumn = (column: VisibleColumnKey) => {
    if (column === "date") return // Date field cannot be disabled
    setVisibleColumns((prev) => ({
      ...prev,
      [column]: !prev[column],
    }))
  }

  const handleDataChange = async () => {
    // Keep callback for hook contract; SWR handles the revalidation.
  }

  const {
    transactions,
    isLoading: transactionsLoading,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    deleteRecurrence,
  } = useTransactions({ pageSize: 500 }, handleDataChange)

  const { categories, isLoading: categoriesLoading } = useCategories()
  const { categoryGroups, isLoading: categoryGroupsLoading } = useCategoryGroups()
  const { areas, isLoading: areasLoading } = useAreas()
  const { contacts } = useContacts()
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const isLoading = transactionsLoading || categoriesLoading || categoryGroupsLoading || areasLoading
  const hasData = transactions.length > 0 && categories.length > 0

  const latestTransactionDate = useMemo(() => {
    if (!hasData || transactions.length === 0) return new Date()

    const validTransactions = transactions.filter((t) => {
      const date = new Date(t.date)
      return !isNaN(date.getTime())
    })

    if (validTransactions.length === 0) return new Date()

    const sortedTransactions = [...validTransactions].sort((a, b) => {
      const dateA = new Date(a.date)
      const dateB = new Date(b.date)
      return dateB.getTime() - dateA.getTime()
    })
    return new Date(sortedTransactions[0]?.date || new Date().toISOString())
  }, [transactions, hasData])

  useEffect(() => {
    if (hasData && transactions.length > 0) {
      if (latestTransactionDate && !isNaN(latestTransactionDate.getTime())) {
        setSelectedYear(latestTransactionDate.getFullYear())
        setSelectedMonth(latestTransactionDate.getMonth() + 1)
      }
    }
  }, [hasData, transactions.length, latestTransactionDate])

  const currentMonthTransactions = useMemo(() => {
    if (!hasData) return []
    return transactions.filter((t) => {
      return isSameMonth(t.date, selectedYear, selectedMonth)
    })
  }, [transactions, hasData, selectedMonth, selectedYear])

  const previousMonthTransactions = useMemo(() => {
    if (!hasData) return []
    return transactions.filter((t) => {
      const prevMonth = selectedMonth === 1 ? 12 : selectedMonth - 1
      const prevYear = selectedMonth === 1 ? selectedYear - 1 : selectedYear
      return isSameMonth(t.date, prevYear, prevMonth)
    })
  }, [transactions, hasData, selectedMonth, selectedYear])

  const availableYears = useMemo(() => {
    if (!hasData) return [new Date().getFullYear()]

    const years = new Set<number>()
    transactions.forEach((t) => {
      years.add(new Date(t.date).getFullYear())
    })

    return Array.from(years).sort((a, b) => b - a)
  }, [transactions, hasData])

  const monthNames = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ]

  const dashboardData = useMemo(() => {
    if (!hasData || isLoading || !transactions || !categories) {
      return {
        currentIncome: 0,
        currentExpenses: 0,
        incomeChange: 0,
        expenseChange: 0,
        incomePercentage: 0,
        expensePercentage: 0,
        totalIncome: 0,
        consolidatedIncome: 0,
        totalExpenses: 0,
        consolidatedExpenses: 0,
      }
    }

    if (currentMonthTransactions.length === 0) {
      return {
        currentIncome: 0,
        currentExpenses: 0,
        incomeChange: 0,
        expenseChange: 0,
        incomePercentage: 0,
        expensePercentage: 0,
        totalIncome: 0,
        consolidatedIncome: 0,
        totalExpenses: 0,
        consolidatedExpenses: 0,
      }
    }

    const activeTransactions = currentMonthTransactions.filter((t) => t.status !== "cancelled")

    const currentMonthIncomeTransactions = activeTransactions.filter((t) => {
      const category = categories.find((c) => c.id === t.categoryId)
      return category?.type === "income"
    })

    const currentMonthExpenseTransactions = activeTransactions.filter((t) => {
      const category = categories.find((c) => c.id === t.categoryId)
      return category?.type === "expense"
    })

    const totalIncome = currentMonthIncomeTransactions.reduce((sum, t) => {
      const amount = Number(t.amount) || 0
      return sum + amount
    }, 0)

    const totalExpenses = currentMonthExpenseTransactions.reduce((sum, t) => {
      const amount = Number(t.amount) || 0
      return sum + amount
    }, 0)

    const consolidatedIncome = currentMonthIncomeTransactions
      .filter((t) => {
        const isCompleted = t.status?.trim().toLowerCase() === "completed"
        return isCompleted
      })
      .reduce((sum, t) => {
        const amount = Number(t.amount) || 0
        return sum + amount
      }, 0)

    const consolidatedExpenses = currentMonthExpenseTransactions
      .filter((t) => {
        const isCompleted = t.status?.trim().toLowerCase() === "completed"
        return isCompleted
      })
      .reduce((sum, t) => {
        const amount = Number(t.amount) || 0
        return sum + amount
      }, 0)

    const activePreviousTransactions = previousMonthTransactions.filter((t) => t.status !== "cancelled")
    const previousIncomeTransactions = activePreviousTransactions.filter((t) => {
      const category = categories.find((c) => c.id === t.categoryId)
      return category?.type === "income"
    })

    const previousExpenseTransactions = activePreviousTransactions.filter((t) => {
      const category = categories.find((c) => c.id === t.categoryId)
      return category?.type === "expense"
    })

    const previousIncome = previousIncomeTransactions.reduce((sum, t) => {
      const amount = Number(t.amount) || 0
      return sum + amount
    }, 0)

    const previousExpenses = previousExpenseTransactions.reduce((sum, t) => {
      const amount = Number(t.amount) || 0
      return sum + amount
    }, 0)

    const incomeChange = previousIncome > 0 ? ((consolidatedIncome - previousIncome) / previousIncome) * 100 : 0
    const expenseChange =
      previousExpenses > 0 ? ((consolidatedExpenses - previousExpenses) / previousExpenses) * 100 : 0

    const incomePercentage = totalIncome > 0 ? Math.min(100, (consolidatedIncome / totalIncome) * 100) : 0
    const expensePercentage = totalExpenses > 0 ? Math.min(100, (consolidatedExpenses / totalExpenses) * 100) : 0

    return {
      currentIncome: consolidatedIncome,
      currentExpenses: consolidatedExpenses,
      incomeChange: isNaN(incomeChange) ? 0 : incomeChange,
      expenseChange: isNaN(expenseChange) ? 0 : expenseChange,
      incomePercentage: isNaN(incomePercentage) ? 0 : incomePercentage,
      expensePercentage: isNaN(expensePercentage) ? 0 : expensePercentage,
      totalIncome,
      consolidatedIncome,
      totalExpenses,
      consolidatedExpenses,
    }
  }, [transactions, currentMonthTransactions, previousMonthTransactions, categories, hasData, isLoading])

  const filteredTransactions = useMemo(() => {
    if (!hasData) return []

    let filtered = currentMonthTransactions.filter((transaction) => {
      const category = categories.find((c) => c.id === transaction.categoryId)
      if (!category) return false

      const categoryGroup = categoryGroups.find((cg) => cg.id === category.categoryGroupId)
      if (!categoryGroup) return false

      const area = areas.find((a) => a.id === categoryGroup.areaId)
      return area?.type === activeTab
    })

    if (statusFilter !== "all") {
      filtered = filtered.filter((transaction) => transaction.status === statusFilter)
    }

    filtered.sort((a, b) => {
      let aValue: string | number | Date
      let bValue: string | number | Date

      switch (sortField) {
        case "date":
          aValue = new Date(a.date)
          bValue = new Date(b.date)
          break
        case "description":
          aValue = a.description?.toLowerCase() || ""
          bValue = b.description?.toLowerCase() || ""
          break
        case "amount":
          aValue = a.amount
          bValue = b.amount
          break
        case "status":
          aValue = a.status || "pending"
          bValue = b.status || "pending"
          break
        case "categoryId":
          const categoryA = categories.find((c) => c.id === a.categoryId)
          const categoryB = categories.find((c) => c.id === b.categoryId)
          aValue = categoryA?.name?.toLowerCase() || ""
          bValue = categoryB?.name?.toLowerCase() || ""
          break
        default:
          aValue = ""
          bValue = ""
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1
      return 0
    })

    return filtered
  }, [
    activeTab,
    statusFilter,
    currentMonthTransactions,
    categories,
    categoryGroups,
    areas,
    hasData,
    sortField,
    sortDirection,
  ])

  const chartData = useMemo(() => {
    if (!hasData) {
      return [
        { name: "Recebimentos", atual: 0, falta: 0 },
        { name: "Despesas", atual: 0, falta: 0 },
      ]
    }

    return [
      {
        name: "Recebimentos",
        atual: dashboardData.consolidatedIncome / 1000,
        falta: (dashboardData.totalIncome - dashboardData.consolidatedIncome) / 1000,
      },
      {
        name: "Despesas",
        atual: dashboardData.consolidatedExpenses / 1000,
        falta: (dashboardData.totalExpenses - dashboardData.consolidatedExpenses) / 1000,
      },
    ]
  }, [dashboardData, hasData])

  void chartData

  const normalizeTransactionPayload = (data: TransactionModalFormData): TransactionPayloadFormData => {
    const recurrence = data.recurrence
      ? {
          ...data.recurrence,
          interval: data.recurrence.interval ?? 1,
        }
      : undefined

    return {
      ...data,
      description: data.description ?? "",
      recurrence,
    }
  }

  const handleCreateTransaction = async (data: TransactionModalFormData) => {
    try {
      await createTransaction(normalizeTransactionPayload(data))
      setIsModalOpen(false)
    } catch {
      // Error is handled by the hook/UI feedback.
    }
  }

  const handleUpdateTransaction = async (data: TransactionModalFormData) => {
    if (selectedTransaction) {
      try {
        await updateTransaction(selectedTransaction.id, normalizeTransactionPayload(data))
        setSelectedTransaction(null)
        setIsModalOpen(false)
      } catch {
        // Error is handled by the hook/UI feedback.
      }
    }
  }

  const handleEditTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setIsModalOpen(true)
  }

  const handleDeleteTransaction = async (id: string) => {
    const transaction = transactions.find((t) => t.id === id)
    const isRecurring = transaction?.recurrence?.enabled || transaction?.recurrence?.generatedFrom

    if (isRecurring) {
      setTransactionToDelete(transaction)
      setShowRecurringDeleteModal(true)
    } else {
      if (confirm("Tem certeza que deseja excluir esta transação?")) {
        try {
          await deleteTransaction(id)
        } catch {
          // Error is handled by the hook/UI feedback.
        }
      }
    }
  }

  const handleRecurringDeleteConfirm = async (mode: "single" | "future" | "all") => {
    if (!transactionToDelete) return

    try {
      const modeMapping = {
        single: "thisEvent" as const,
        future: "followingEvents" as const,
        all: "allEvents" as const,
      }

      await deleteRecurrence(transactionToDelete, modeMapping[mode])
      setShowRecurringDeleteModal(false)
      setTransactionToDelete(null)
    } catch {
      // Error is handled by the hook/UI feedback.
    }
  }

  const handleDeleteRecurrence = async (
    transaction: Transaction,
    applyMode: "thisAndFollowing" | "keepThisDeleteFollowing" | "allRecords",
  ) => {
    try {
      const mappedMode =
        applyMode === "thisAndFollowing"
          ? "followingEvents"
          : applyMode === "keepThisDeleteFollowing"
            ? "thisEvent"
            : "allEvents"
      await deleteRecurrence(transaction, mappedMode)
    } catch {
      // Error is handled by the hook/UI feedback.
    }
  }

  const startEditing = (transactionId: string, field: string, value: EditableValue) => {
    let processedValue = value

    // Convert ISO date to pt-BR format for display when editing dates
    if (field === "date" && typeof value === "string" && value.includes("-")) {
      const [year, month, day] = value.split("-")
      processedValue = `${day}/${month}/${year}`
    }

    setEditingTransaction(transactionId)
    setEditingField(field)
    setEditingValue(processedValue)
  }

  const cancelEditing = () => {
    setEditingTransaction(null)
    setEditingField(null)
    setEditingValue("")
  }

  const handleDateChange = (formattedDate: string) => {
    setEditingValue(formattedDate)
  }

  const handleCalendarSelect = (isoDate: string) => {
    // Format ISO date to pt-BR for display (same as modal)
    const [year, month, day] = isoDate.split("-")
    const ptBRDate = `${day}/${month}/${year}`
    setEditingValue(ptBRDate)
  }

  const toggleTransactionStatus = async (transaction: Transaction) => {
    const next: Transaction["status"] =
      transaction.status === "completed" ? "pending" : "completed"
    try {
      await updateTransaction(transaction.id, { ...transaction, status: next })
    } catch {
      // Error surfaced via toast no hook.
    }
  }

  const saveInlineEdit = async () => {
    if (!editingTransaction || !editingField) return

    const transaction = filteredTransactions.find((t) => t.id === editingTransaction)
    if (!transaction) return

    try {
      let processedValue = editingValue

      if (editingField === "date" && typeof editingValue === "string") {
        if (editingValue.includes("/") && editingValue.length === 10) {
          processedValue = formatDateToISO(editingValue)
        } else if (editingValue.length < 10) {
          // Don't save incomplete dates
          return
        } else {
          processedValue = editingValue // Already in ISO format from calendar
        }
      }

      const cleanUpdateData = {
        id: transaction.id,
        date: editingField === "date" ? String(processedValue) : transaction.date,
        amount:
          editingField === "amount"
            ? typeof editingValue === "number"
              ? editingValue
              : parseValueFromEdit(editingValue)
            : transaction.amount,
        categoryId: editingField === "categoryId" ? String(editingValue) : transaction.categoryId,
        contactId: editingField === "contactId" ? String(editingValue) : transaction.contactId,
        description: editingField === "description" ? String(editingValue) : transaction.description,
        type: editingField === "type" ? (String(editingValue) as Transaction["type"]) : transaction.type,
        status:
          editingField === "status" ? (String(editingValue) as Transaction["status"]) : transaction.status,
        notes: editingField === "notes" ? String(editingValue) : transaction.notes,
        recurrence: transaction.recurrence,
        areaId: editingField === "areaId" ? String(editingValue) : transaction.areaId,
        categoryGroupId:
          editingField === "categoryGroupId" ? String(editingValue) : transaction.categoryGroupId,
      } as Partial<Transaction>

      await updateTransaction(editingTransaction, cleanUpdateData)
      cancelEditing()
    } catch {
      // Error is handled by the hook/UI feedback.
    }
  }

  const formatValueForEdit = (value: number) => {
    return value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  const parseValueFromEdit = (value: string | number) => {
    // Remove all dots (thousands separator) and replace comma with dot (decimal separator)
    const cleanValue = value.toString().replace(/\./g, "").replace(",", ".")
    const parsed = Number.parseFloat(cleanValue)
    return isNaN(parsed) ? 0 : parsed
  }

  const groupedCategories = useMemo(() => {
    if (!categories || !categoryGroups || !areas) return { income: [], expensesByArea: {} }

    const incomeCategories = categories
      .filter((cat) => cat.type === "income")
      .sort((a, b) => a.name.localeCompare(b.name))

    // Group expense categories by area
    const expensesByArea: Record<string, Category[]> = {}

    categories
      .filter((cat) => cat.type === "expense")
      .forEach((category) => {
        const categoryGroup = categoryGroups.find((cg) => cg.id === category.categoryGroupId)
        const area = areas.find((a) => a.id === categoryGroup?.areaId)
        const areaName = area?.name || "Outras"

        if (!expensesByArea[areaName]) {
          expensesByArea[areaName] = []
        }
        expensesByArea[areaName].push(category)
      })

    // Sort categories within each area
    Object.keys(expensesByArea).forEach((areaName) => {
      if (expensesByArea[areaName]) {
        expensesByArea[areaName].sort((a, b) => a.name.localeCompare(b.name))
      }
    })

    return {
      income: incomeCategories,
      expensesByArea,
    }
  }, [categories, categoryGroups, areas])

  const renderCategorySelect = (transaction: Transaction) => {
    const currentCategory = categories.find((c) => c.id === transaction.categoryId)

    const areaNameMapping: { [key: string]: string } = {
      "Dia a Dia": "Despesas variáveis",
      "Encargos e Taxas": "Encargos/Taxas",
      "Despesas Fixas": "Despesas fixas",
    }

    return (
      <Select
        value={transaction.categoryId}
        onValueChange={(value) => handleFieldUpdate(transaction.id, "categoryId", value)}
      >
        <SelectTrigger className="w-full h-8 text-xs border-0 bg-transparent hover:bg-slate-50">
          <SelectValue placeholder="Categoria">{currentCategory?.name || "Selecionar categoria"}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <div className="font-bold text-xs text-slate-600 bg-slate-100 px-2 py-1 pointer-events-none">Receitas</div>
          {groupedCategories.income.map((category) => (
            <SelectItem key={category.id} value={category.id} className="pl-4">
              {category.name}
            </SelectItem>
          ))}
          <div className="font-bold text-xs text-slate-600 bg-slate-100 px-2 py-1 pointer-events-none mt-1">
            Despesas
          </div>
          {Object.entries(groupedCategories.expensesByArea).map(([areaName, areaCategories]) => (
            <div key={areaName}>
              <div className="font-bold text-xs text-slate-700 px-4 py-1 pointer-events-none">
                {areaNameMapping[areaName] || areaName}
              </div>
              {areaCategories.map((category) => (
                <SelectItem key={category.id} value={category.id} className="pl-8">
                  {category.name}
                </SelectItem>
              ))}
            </div>
          ))}
        </SelectContent>
      </Select>
    )
  }

  const handleFieldUpdate = async (transactionId: string, field: string, value: EditableValue) => {
    setEditingTransaction(transactionId)
    setEditingField(field)
    setEditingValue(value)

    const transaction = filteredTransactions.find((t) => t.id === transactionId)
    if (!transaction) {
      return
    }

    try {
      const updateData = {
        [field]: value,
      } as Partial<Transaction>

      await updateTransaction(transactionId, updateData)
      cancelEditing()
    } catch {
      // Error is handled by the hook/UI feedback.
    }
  }

  const formatDateToISO = (dateString: string): string => {
    if (!dateString || !dateString.includes("/") || dateString.length < 10) {
      return dateString // Return as-is if not a complete date
    }

    const [day, month, year] = dateString.split("/")
    if (!day || !month || !year || day.length !== 2 || month.length !== 2 || year.length !== 4) {
      return dateString // Return as-is if incomplete
    }

    return `${year}-${month}-${day}`
  }

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-slate-500 mb-1">Dashboard / Transações</div>
            <h1 className="text-3xl font-bold text-slate-900">Transações</h1>
          </div>
          <Button onClick={() => setIsModalOpen(true)} className="bg-green-600 hover:bg-green-700">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar registro
          </Button>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900">Recebimentos</h3>
                  <div className="text-2xl font-bold text-slate-900 mt-1">
                    {formatCurrency(dashboardData.consolidatedIncome)}
                  </div>
                  <div className="flex items-center mt-1">
                    <span className="text-sm text-slate-500">vs mês anterior</span>
                    <div
                      className={`flex items-center ml-2 ${
                        dashboardData.incomeChange >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {dashboardData.incomeChange >= 0 ? (
                        <TrendingUp className="h-4 w-4 mr-1" />
                      ) : (
                        <TrendingDown className="h-4 w-4 mr-1" />
                      )}
                      <span className="text-sm font-medium">
                        {dashboardData.incomeChange >= 0 ? "+" : ""}
                        {dashboardData.incomeChange.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-center ml-6">
                  <div className="relative w-12 h-12">
                    <svg width="48" height="48" className="transform -rotate-90">
                      <circle cx="24" cy="24" r="20" fill="none" stroke="#E5E7EB" strokeWidth="2" />
                      <circle
                        cx="24"
                        cy="24"
                        r="20"
                        fill="none"
                        stroke="#22c55e"
                        strokeWidth="2"
                        strokeDasharray={`${(dashboardData.incomePercentage / 100) * 125.66} 125.66`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs text-green-600">{Math.round(dashboardData.incomePercentage)}%</span>
                    </div>
                  </div>
                  <div className="text-xs text-slate-500 mt-1 text-center">
                    <div>recebimentos</div>
                    <div>meta {formatCurrency(dashboardData.totalIncome)}</div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-green-500 h-3 rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(100, dashboardData.totalIncome > 0 ? (dashboardData.consolidatedIncome / dashboardData.totalIncome) * 100 : 0)}%`,
                    }}
                  />
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-green-600 font-medium">{formatCurrency(dashboardData.consolidatedIncome)}</span>
                  <span className="text-slate-500">
                    Falta {formatCurrency(Math.max(0, dashboardData.totalIncome - dashboardData.consolidatedIncome))} do
                    previsto
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900">Despesas</h3>
                  <div className="text-2xl font-bold text-slate-900 mt-1">
                    {formatCurrency(dashboardData.consolidatedExpenses)}
                  </div>
                  <div className="flex items-center mt-1">
                    <span className="text-sm text-slate-500">vs mês anterior</span>
                    <div
                      className={`flex items-center ml-2 ${
                        dashboardData.expenseChange >= 0 ? "text-red-600" : "text-green-600"
                      }`}
                    >
                      {dashboardData.expenseChange >= 0 ? (
                        <TrendingUp className="h-4 w-4 mr-1" />
                      ) : (
                        <TrendingDown className="h-4 w-4 mr-1" />
                      )}
                      <span className="text-sm font-medium">
                        {dashboardData.expenseChange >= 0 ? "+" : ""}
                        {dashboardData.expenseChange.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-center ml-6">
                  <div className="relative w-12 h-12">
                    <svg width="48" height="48" className="transform -rotate-90">
                      <circle cx="24" cy="24" r="20" fill="none" stroke="#E5E7EB" strokeWidth="2" />
                      <circle
                        cx="24"
                        cy="24"
                        r="20"
                        fill="none"
                        stroke="#ef4444"
                        strokeWidth="2"
                        strokeDasharray={`${(dashboardData.expensePercentage / 100) * 125.66} 125.66`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs text-red-500">{Math.round(dashboardData.expensePercentage)}%</span>
                    </div>
                  </div>
                  <div className="text-xs text-slate-500 mt-1 text-center">
                    <div>despesas</div>
                    <div>meta {formatCurrency(dashboardData.totalExpenses)}</div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-red-500 h-3 rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(100, dashboardData.totalExpenses > 0 ? (dashboardData.consolidatedExpenses / dashboardData.totalExpenses) * 100 : 0)}%`,
                    }}
                  />
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-red-600 font-medium">{formatCurrency(dashboardData.consolidatedExpenses)}</span>
                  <span className="text-slate-500">
                    Restam{" "}
                    {formatCurrency(Math.max(0, dashboardData.totalExpenses - dashboardData.consolidatedExpenses))} do
                    previsto
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
              <TabsList className="grid w-full max-w-2xl grid-cols-5 gap-1">
                <TabsTrigger
                  value="income"
                  className="text-xs data-[state=active]:bg-green-50 data-[state=active]:text-green-700 data-[state=active]:border-green-200"
                >
                  Recebimentos
                </TabsTrigger>
                <TabsTrigger
                  value="fixed-expenses"
                  className="text-xs data-[state=active]:bg-red-50 data-[state=active]:text-red-700 data-[state=active]:border-red-200"
                >
                  Despesas fixas
                </TabsTrigger>
                <TabsTrigger
                  value="daily-expenses"
                  className="text-xs data-[state=active]:bg-red-50 data-[state=active]:text-red-700 data-[state=active]:border-red-200"
                >
                  Despesas variáveis
                </TabsTrigger>
                <TabsTrigger
                  value="personal"
                  className="text-xs data-[state=active]:bg-red-50 data-[state=active]:text-red-700 data-[state=active]:border-red-200"
                >
                  Pessoais
                </TabsTrigger>
                <TabsTrigger
                  value="taxes-fees"
                  className="text-xs data-[state=active]:bg-red-50 data-[state=active]:text-red-700 data-[state=active]:border-red-200"
                >
                  Encargos/Taxas
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex items-center gap-1">
              <Select
                value={statusFilter}
                onValueChange={(value: "all" | "pending" | "completed" | "cancelled") => setStatusFilter(value)}
              >
                <SelectTrigger className="w-32 h-8 text-xs">
                  <Filter className="h-3 w-3 mr-1" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="completed">Concluída</SelectItem>
                  <SelectItem value="cancelled">Cancelada</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={selectedYear.toString()}
                onValueChange={(value) => setSelectedYear(Number.parseInt(value))}
              >
                <SelectTrigger className="w-20 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableYears.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={selectedMonth.toString()}
                onValueChange={(value) => setSelectedMonth(Number.parseInt(value))}
              >
                <SelectTrigger className="w-24 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {monthNames.map((month, index) => (
                    <SelectItem key={index + 1} value={(index + 1).toString()}>
                      {month.slice(0, 3)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Transações</h3>
                <div className="relative">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowColumnConfig(!showColumnConfig)}
                    className="flex items-center gap-2"
                  >
                    <Settings className="h-4 w-4" />
                    Configurar Colunas
                  </Button>
                  {showColumnConfig && (
                    <div className="absolute right-0 top-full mt-2 bg-white border rounded-lg shadow-lg p-4 z-10 min-w-48">
                      <h4 className="font-medium mb-3">Colunas Visíveis</h4>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={visibleColumns.id}
                            onChange={() => toggleColumn("id")}
                            className="rounded"
                          />
                          <span className="text-sm">ID</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={visibleColumns.date}
                            disabled
                            className="rounded opacity-50"
                          />
                          <span className="text-sm text-gray-500">Data (obrigatório)</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={visibleColumns.description}
                            onChange={() => toggleColumn("description")}
                            className="rounded"
                          />
                          <span className="text-sm">Descrição</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={visibleColumns.categoryId}
                            onChange={() => toggleColumn("categoryId")}
                            className="rounded"
                          />
                          <span className="text-sm">Categoria</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={visibleColumns.status}
                            onChange={() => toggleColumn("status")}
                            className="rounded"
                          />
                          <span className="text-sm">Status</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={visibleColumns.amount}
                            onChange={() => toggleColumn("amount")}
                            className="rounded"
                          />
                          <span className="text-sm">Valor</span>
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="w-8 py-3 px-2" aria-label="Expandir detalhes" />
                      {visibleColumns.id && (
                        <th className="text-left py-3 px-4 font-medium text-slate-600">
                          <button
                            onClick={() => handleSort("id")}
                            className="flex items-center gap-1 hover:text-slate-900"
                          >
                            ID
                            {sortField === "id" &&
                              (sortDirection === "asc" ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              ))}
                          </button>
                        </th>
                      )}
                      {visibleColumns.date && (
                        <th className="text-left py-3 px-4 font-medium text-slate-600">
                          <button
                            onClick={() => handleSort("date")}
                            className="flex items-center gap-1 hover:text-slate-900"
                          >
                            Data
                            {sortField === "date" &&
                              (sortDirection === "asc" ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              ))}
                          </button>
                        </th>
                      )}
                      {visibleColumns.description && (
                        <th className="text-left py-3 px-4 font-medium text-slate-600">
                          <button
                            onClick={() => handleSort("description")}
                            className="flex items-center gap-1 hover:text-slate-900"
                          >
                            Descrição
                            {sortField === "description" &&
                              (sortDirection === "asc" ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              ))}
                          </button>
                        </th>
                      )}
                      {visibleColumns.categoryId && (
                        <th className="text-left py-3 px-4 font-medium text-slate-600">
                          <button
                            onClick={() => handleSort("categoryId")}
                            className="flex items-center gap-1 hover:text-slate-900"
                          >
                            Categoria
                            {sortField === "categoryId" &&
                              (sortDirection === "asc" ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              ))}
                          </button>
                        </th>
                      )}
                      {visibleColumns.status && (
                        <th className="text-left py-3 px-4 font-medium text-slate-600">
                          <button
                            onClick={() => handleSort("status")}
                            className="flex items-center gap-1 hover:text-slate-900"
                          >
                            Status
                            {sortField === "status" &&
                              (sortDirection === "asc" ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              ))}
                          </button>
                        </th>
                      )}
                      {visibleColumns.amount && (
                        <th className="text-right py-3 px-4 font-medium text-slate-600">
                          <button
                            onClick={() => handleSort("amount")}
                            className="flex items-center gap-1 hover:text-slate-900 ml-auto"
                          >
                            Valor
                            {sortField === "amount" &&
                              (sortDirection === "asc" ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              ))}
                          </button>
                        </th>
                      )}
                      {visibleColumns.actions && (
                        <th className="text-center py-3 px-4 font-medium text-slate-600">Ações</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td
                          colSpan={Object.values(visibleColumns).filter(Boolean).length + 1}
                          className="text-center py-8 text-slate-500"
                        >
                          Carregando transações...
                        </td>
                      </tr>
                    ) : filteredTransactions.length === 0 ? (
                      <tr>
                        <td
                          colSpan={Object.values(visibleColumns).filter(Boolean).length + 1}
                          className="text-center py-8 text-slate-500"
                        >
                          Nenhuma transação encontrada para este período.
                        </td>
                      </tr>
                    ) : (
                      filteredTransactions.map((transaction) => {
                        const category = categories.find((c) => c.id === transaction.categoryId)
                        const isIncome = category?.type === "income"
                        const transactionStatus = transaction.status || "pending"
                        const isEditing = editingTransaction === transaction.id
                        const isExpanded = expandedIds.has(transaction.id)
                        const visibleColumnCount = Object.values(visibleColumns).filter(Boolean).length + 1

                        return (
                          <Fragment key={transaction.id}>
                          <tr className="border-b border-slate-100 hover:bg-slate-50">
                            <td className="w-8 py-3 px-2">
                              <button
                                type="button"
                                onClick={() => toggleExpanded(transaction.id)}
                                aria-expanded={isExpanded}
                                aria-controls={`tx-detail-${transaction.id}`}
                                aria-label={isExpanded ? "Colapsar detalhes" : "Expandir detalhes"}
                                className="flex h-5 w-5 items-center justify-center rounded text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors"
                              >
                                <ChevronRight
                                  className={`h-4 w-4 transition-transform ${
                                    isExpanded ? "rotate-90" : ""
                                  }`}
                                />
                              </button>
                            </td>
                            {visibleColumns.id && (
                              <td className="py-3 px-4 text-slate-500 text-xs font-mono">{transaction.id}</td>
                            )}

                            {visibleColumns.date && (
                              <td className="py-3 px-4 text-slate-600">
                                <div className="flex items-center gap-2">
                                  {editingTransaction === transaction.id && editingField === "date" ? (
                                    <div className="flex items-center gap-1">
                                      <div className="flex-1">
                                        <DatePicker
                                          value={
                                            typeof editingValue === "string" && editingValue.includes("/")
                                              ? editingValue
                                              : isValidDateString(editingValue)
                                                ? format(getSafeDate(editingValue), "dd/MM/yyyy", { locale: ptBR })
                                                : ""
                                          }
                                          onChange={handleDateChange}
                                          onCalendarSelect={handleCalendarSelect}
                                          placeholder="dd/mm/aaaa"
                                        />
                                      </div>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={saveInlineEdit}
                                        className="h-6 w-6 p-0"
                                      >
                                        <Check className="h-3 w-3 text-green-600" />
                                      </Button>
                                      <Button size="sm" variant="ghost" onClick={cancelEditing} className="h-6 w-6 p-0">
                                        <X className="h-3 w-3 text-red-600" />
                                      </Button>
                                    </div>
                                  ) : (
                                    <>
                                      <button
                                        onClick={() => startEditing(transaction.id, "date", transaction.date)}
                                        className="text-left hover:bg-slate-100 px-2 py-1 rounded text-xs"
                                      >
                                        {formatDateToPtBR(transaction.date)}
                                      </button>
                                      {(transaction.recurrence?.enabled || transaction.recurrence?.generatedFrom) && (
                                        <Repeat className="h-3 w-3 text-blue-500 flex-shrink-0" />
                                      )}
                                    </>
                                  )}
                                </div>
                              </td>
                            )}

                            {visibleColumns.description && (
                              <td className="py-3 px-4">
                                {isEditing && editingField === "description" ? (
                                  <div className="flex items-center gap-2">
                                    <Input
                                      value={editingValue}
                                      onChange={(e) => setEditingValue(e.target.value)}
                                      className="h-8 text-xs"
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter") saveInlineEdit()
                                        if (e.key === "Escape") cancelEditing()
                                      }}
                                      autoFocus
                                    />
                                    <Button size="sm" variant="ghost" onClick={saveInlineEdit} className="h-6 w-6 p-0">
                                      <Check className="h-3 w-3 text-green-600" />
                                    </Button>
                                    <Button size="sm" variant="ghost" onClick={cancelEditing} className="h-6 w-6 p-0">
                                      <X className="h-3 w-3 text-red-600" />
                                    </Button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => startEditing(transaction.id, "description", transaction.description || "")}
                                    className="text-left hover:bg-slate-100 px-2 py-1 rounded font-medium text-slate-900 text-sm"
                                  >
                                    {transaction.description || "Sem descrição"}
                                  </button>
                                )}
                              </td>
                            )}

                            {visibleColumns.categoryId && (
                              <td className="py-3 px-4">
                                {isEditing && editingField === "categoryId" ? (
                                  <div className="flex items-center gap-2">
                                    {renderCategorySelect(transaction)}
                                    <Button size="sm" variant="ghost" onClick={saveInlineEdit} className="h-6 w-6 p-0">
                                      <Check className="h-3 w-3 text-green-600" />
                                    </Button>
                                    <Button size="sm" variant="ghost" onClick={cancelEditing} className="h-6 w-6 p-0">
                                      <X className="h-3 w-3 text-red-600" />
                                    </Button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => startEditing(transaction.id, "categoryId", transaction.categoryId)}
                                    className="flex items-center hover:bg-slate-100 px-2 py-1 rounded"
                                  >
                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                                      <span className="text-xs font-medium text-blue-600">
                                        {category?.name?.charAt(0) || "?"}
                                      </span>
                                    </div>
                                    <span className="text-slate-600 text-sm">{category?.name || "Categoria"}</span>
                                  </button>
                                )}
                              </td>
                            )}

                            {visibleColumns.status && (
                              <td className="py-3 px-4">
                                {isEditing && editingField === "status" ? (
                                  <div className="flex items-center gap-2">
                                    <Select
                                      value={typeof editingValue === "string" ? editingValue : undefined}
                                      onValueChange={setEditingValue}
                                    >
                                      <SelectTrigger className="h-8 text-xs w-28">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="pending">Pendente</SelectItem>
                                        <SelectItem value="completed">Concluída</SelectItem>
                                        <SelectItem value="cancelled">Cancelada</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <Button size="sm" variant="ghost" onClick={saveInlineEdit} className="h-6 w-6 p-0">
                                      <Check className="h-3 w-3 text-green-600" />
                                    </Button>
                                    <Button size="sm" variant="ghost" onClick={cancelEditing} className="h-6 w-6 p-0">
                                      <X className="h-3 w-3 text-red-600" />
                                    </Button>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      role="checkbox"
                                      aria-checked={transactionStatus === "completed"}
                                      aria-label={
                                        transactionStatus === "completed"
                                          ? "Marcar como pendente"
                                          : "Marcar como concluída"
                                      }
                                      onClick={() => toggleTransactionStatus(transaction)}
                                      disabled={transactionStatus === "cancelled"}
                                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                                        transactionStatus === "completed"
                                          ? "border-green-600 bg-green-600 text-white hover:bg-green-700 hover:border-green-700"
                                          : transactionStatus === "pending"
                                            ? "border-slate-300 bg-white hover:border-green-500 hover:bg-green-50"
                                            : "border-slate-200 bg-slate-100 cursor-not-allowed"
                                      }`}
                                    >
                                      {transactionStatus === "completed" && (
                                        <Check className="h-3 w-3" strokeWidth={3} />
                                      )}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => startEditing(transaction.id, "status", transactionStatus)}
                                      className={`text-xs hover:underline ${
                                        transactionStatus === "completed"
                                          ? "text-green-700"
                                          : transactionStatus === "pending"
                                            ? "text-slate-500"
                                            : "text-red-600 line-through"
                                      }`}
                                    >
                                      {transactionStatus === "completed"
                                        ? "Concluída"
                                        : transactionStatus === "pending"
                                          ? "Pendente"
                                          : "Cancelada"}
                                    </button>
                                  </div>
                                )}
                              </td>
                            )}

                            {visibleColumns.amount && (
                              <td className="py-3 px-4 text-right">
                                {isEditing && editingField === "amount" ? (
                                  <div className="flex items-center gap-2 justify-end">
                                    <Input
                                      value={editingValue}
                                      onChange={(e) => setEditingValue(e.target.value)}
                                      className="h-8 text-xs w-24 text-right"
                                      placeholder="0,00"
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                          const parsedValue = parseValueFromEdit(editingValue)
                                          setEditingValue(parsedValue)
                                          saveInlineEdit()
                                        }
                                        if (e.key === "Escape") cancelEditing()
                                      }}
                                      autoFocus
                                    />
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => {
                                        const parsedValue = parseValueFromEdit(editingValue)
                                        setEditingValue(parsedValue)
                                        saveInlineEdit()
                                      }}
                                      className="h-6 w-6 p-0"
                                    >
                                      <Check className="h-3 w-3 text-green-600" />
                                    </Button>
                                    <Button size="sm" variant="ghost" onClick={cancelEditing} className="h-6 w-6 p-0">
                                      <X className="h-3 w-3 text-red-600" />
                                    </Button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() =>
                                      startEditing(transaction.id, "amount", formatValueForEdit(transaction.amount))
                                    }
                                    className="text-right hover:bg-slate-100 px-2 py-1 rounded"
                                  >
                                    <span className={`font-semibold ${isIncome ? "text-green-600" : "text-slate-900"}`}>
                                      {isIncome ? "+" : ""}
                                      {formatCurrency(transaction.amount)}
                                    </span>
                                  </button>
                                )}
                              </td>
                            )}

                            {visibleColumns.actions && (
                              <td className="py-3 px-4">
                                <div className="flex items-center justify-center gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditTransaction(transaction)}
                                    className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-600"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteTransaction(transaction.id)}
                                    className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            )}
                          </tr>
                          {isExpanded && (
                            <tr id={`tx-detail-${transaction.id}`} className="border-b border-slate-100">
                              <td colSpan={visibleColumnCount} className="p-0">
                                <TransactionDetailRow
                                  transaction={transaction}
                                  allTransactions={transactions}
                                  categories={categories}
                                  categoryGroups={categoryGroups}
                                  areas={areas}
                                  contacts={contacts}
                                />
                              </td>
                            </tr>
                          )}
                          </Fragment>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <TransactionFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedTransaction(null)
        }}
        onSubmit={selectedTransaction ? handleUpdateTransaction : handleCreateTransaction}
        onDeleteRecurrence={handleDeleteRecurrence}
        transaction={selectedTransaction}
      />

      <RecurringDeleteModal
        isOpen={showRecurringDeleteModal}
        onClose={() => {
          setShowRecurringDeleteModal(false)
          setTransactionToDelete(null)
        }}
        onConfirm={handleRecurringDeleteConfirm}
        transactionDescription={transactionToDelete?.description}
      />
    </MainLayout>
  )
}
