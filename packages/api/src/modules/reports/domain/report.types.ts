export type CashflowStatusFilter = "all" | "completed" | "pending" | "cancelled"

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
