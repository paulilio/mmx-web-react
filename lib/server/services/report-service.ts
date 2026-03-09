import type { DomainTransactionStatus, DomainTransactionType } from "@/lib/domain/transactions/transaction-entity"
import type { TransactionRepository } from "@/lib/server/repositories/transaction-repository"

interface SummaryTransaction {
  amount: number
  type: DomainTransactionType
  status: DomainTransactionStatus
}

interface AgingTransaction extends SummaryTransaction {
  date: Date
}

export interface DashboardSummaryRecord {
  totalOpen: number
  totalOverdue: number
  totalNext7Days: number
  totalNext30Days: number
  totalReceivables: number
  totalPayables: number
  completedReceivables: number
  completedPayables: number
  pendingReceivables: number
  pendingPayables: number
}

export interface AgingReportRecord {
  overdue: number
  next7Days: number
  next30Days: number
  future: number
  completedOverdue: number
  completedNext7Days: number
  completedNext30Days: number
  pendingOverdue: number
  pendingNext7Days: number
  pendingNext30Days: number
}

interface AgingFilters {
  dateFrom?: string
  dateTo?: string
}

type CashflowStatusFilter = "all" | "completed" | "pending" | "cancelled"

interface CashflowFilters {
  days?: number
  status?: CashflowStatusFilter
}

export interface CashflowItemRecord {
  date: string
  income: number
  expense: number
  balance: number
  completedIncome: number
  completedExpense: number
  completedBalance: number
  pendingIncome: number
  pendingExpense: number
  pendingBalance: number
}

export class ReportService {
  constructor(private readonly transactionRepository: TransactionRepository) {}

  private toAmount(value: unknown): number {
    if (typeof value === "number") {
      return value
    }

    if (typeof value === "string") {
      const parsed = Number(value)
      return Number.isFinite(parsed) ? parsed : 0
    }

    if (value && typeof value === "object" && "toString" in value) {
      const parsed = Number(String(value))
      return Number.isFinite(parsed) ? parsed : 0
    }

    return 0
  }

  private parseDateOrUndefined(value?: string): Date | undefined {
    if (!value) {
      return undefined
    }

    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) {
      throw new Error("Filtro de data invalido")
    }

    return parsed
  }

  private startOfToday(): Date {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return today
  }

  private toDateKey(value: Date): string {
    return value.toISOString().slice(0, 10)
  }

  async getSummary(userId: string): Promise<DashboardSummaryRecord> {
    const transactions = await this.transactionRepository.findAllByUser(userId)

    const normalized = transactions.map(
      (item) =>
        ({
          amount: this.toAmount(item.amount),
          type: item.type,
          status: item.status,
        }) as SummaryTransaction,
    )

    const completed = normalized.filter((item) => item.status === "COMPLETED")
    const pending = normalized.filter((item) => item.status === "PENDING")

    return {
      totalOpen: 0,
      totalOverdue: 0,
      totalNext7Days: 0,
      totalNext30Days: 0,
      totalReceivables: normalized.filter((item) => item.type === "INCOME").reduce((acc, item) => acc + item.amount, 0),
      totalPayables: normalized.filter((item) => item.type === "EXPENSE").reduce((acc, item) => acc + item.amount, 0),
      completedReceivables: completed
        .filter((item) => item.type === "INCOME")
        .reduce((acc, item) => acc + item.amount, 0),
      completedPayables: completed
        .filter((item) => item.type === "EXPENSE")
        .reduce((acc, item) => acc + item.amount, 0),
      pendingReceivables: pending.filter((item) => item.type === "INCOME").reduce((acc, item) => acc + item.amount, 0),
      pendingPayables: pending.filter((item) => item.type === "EXPENSE").reduce((acc, item) => acc + item.amount, 0),
    }
  }

  async getAging(userId: string, filters: AgingFilters = {}): Promise<AgingReportRecord> {
    const dateFrom = this.parseDateOrUndefined(filters.dateFrom)
    const dateTo = this.parseDateOrUndefined(filters.dateTo)

    if (dateFrom && dateTo && dateFrom.getTime() > dateTo.getTime()) {
      throw new Error("Intervalo de datas invalido")
    }

    const today = this.startOfToday()
    const next7 = new Date(today)
    next7.setDate(today.getDate() + 7)
    const next30 = new Date(today)
    next30.setDate(today.getDate() + 30)

    const transactions = await this.transactionRepository.findAllByUser(userId)
    const normalized = transactions
      .filter((item) => item.status !== "CANCELLED")
      .filter((item) => {
        if (dateFrom && item.date < dateFrom) return false
        if (dateTo && item.date > dateTo) return false
        return true
      })
      .map(
        (item) =>
          ({
            amount: this.toAmount(item.amount),
            type: item.type,
            status: item.status,
            date: item.date,
          }) as AgingTransaction,
      )

    const report: AgingReportRecord = {
      overdue: 0,
      next7Days: 0,
      next30Days: 0,
      future: 0,
      completedOverdue: 0,
      completedNext7Days: 0,
      completedNext30Days: 0,
      pendingOverdue: 0,
      pendingNext7Days: 0,
      pendingNext30Days: 0,
    }

    for (const item of normalized) {
      if (item.type !== "EXPENSE") {
        continue
      }

      const bucket =
        item.date < today ? "overdue" : item.date <= next7 ? "next7Days" : item.date <= next30 ? "next30Days" : "future"

      if (bucket === "overdue") report.overdue += item.amount
      if (bucket === "next7Days") report.next7Days += item.amount
      if (bucket === "next30Days") report.next30Days += item.amount
      if (bucket === "future") report.future += item.amount

      if (item.status === "COMPLETED") {
        if (bucket === "overdue") report.completedOverdue += item.amount
        if (bucket === "next7Days") report.completedNext7Days += item.amount
        if (bucket === "next30Days") report.completedNext30Days += item.amount
      }

      if (item.status === "PENDING") {
        if (bucket === "overdue") report.pendingOverdue += item.amount
        if (bucket === "next7Days") report.pendingNext7Days += item.amount
        if (bucket === "next30Days") report.pendingNext30Days += item.amount
      }
    }

    return report
  }

  async getCashflow(userId: string, filters: CashflowFilters = {}): Promise<CashflowItemRecord[]> {
    const status = filters.status ?? "all"
    const days = Number.isFinite(filters.days) && (filters.days ?? 0) > 0 ? Math.floor(filters.days as number) : 30

    const today = this.startOfToday()
    const fromDate = new Date(today)
    fromDate.setDate(today.getDate() - (days - 1))

    const transactions = await this.transactionRepository.findAllByUser(userId)

    const filtered = transactions
      .filter((item) => item.date >= fromDate)
      .filter((item) => {
        if (status === "all") return true
        if (status === "completed") return item.status === "COMPLETED"
        if (status === "pending") return item.status === "PENDING"
        return item.status === "CANCELLED"
      })

    const byDate = new Map<
      string,
      {
        income: number
        expense: number
        completedIncome: number
        completedExpense: number
        pendingIncome: number
        pendingExpense: number
      }
    >()

    for (const item of filtered) {
      const key = this.toDateKey(item.date)
      if (!byDate.has(key)) {
        byDate.set(key, {
          income: 0,
          expense: 0,
          completedIncome: 0,
          completedExpense: 0,
          pendingIncome: 0,
          pendingExpense: 0,
        })
      }

      const bucket = byDate.get(key)
      if (!bucket) continue

      const amount = this.toAmount(item.amount)
      const isIncome = item.type === "INCOME"
      const isCompleted = item.status === "COMPLETED"

      if (isIncome) {
        bucket.income += amount
        if (isCompleted) {
          bucket.completedIncome += amount
        } else {
          bucket.pendingIncome += amount
        }
      } else {
        bucket.expense += amount
        if (isCompleted) {
          bucket.completedExpense += amount
        } else {
          bucket.pendingExpense += amount
        }
      }
    }

    const sortedDates = Array.from(byDate.keys()).sort()
    let balance = 0
    let completedBalance = 0
    let pendingBalance = 0

    return sortedDates.map((date) => {
      const item = byDate.get(date)
      if (!item) {
        return {
          date,
          income: 0,
          expense: 0,
          balance,
          completedIncome: 0,
          completedExpense: 0,
          completedBalance,
          pendingIncome: 0,
          pendingExpense: 0,
          pendingBalance,
        }
      }

      balance += item.income - item.expense
      completedBalance += item.completedIncome - item.completedExpense
      pendingBalance += item.pendingIncome - item.pendingExpense

      return {
        date,
        income: item.income,
        expense: item.expense,
        balance,
        completedIncome: item.completedIncome,
        completedExpense: item.completedExpense,
        completedBalance,
        pendingIncome: item.pendingIncome,
        pendingExpense: item.pendingExpense,
        pendingBalance,
      }
    })
  }
}
