export type PaymentMethod = "pix" | "boleto" | "cartao" | "transf"

export interface Contact {
  id: string
  name: string
  email?: string
  phone?: string
  identifier?: string
  document?: string
  type: "customer" | "supplier"
  status: "active" | "inactive"
  createdAt: string
  updatedAt: string
}

export interface Category {
  id: string
  name: string
  description?: string
  type: "income" | "expense"
  categoryGroupId?: string
  areaId?: string
  status: "active" | "inactive"
  createdAt: string
  updatedAt: string
}

export interface AgingReport {
  overdue: number
  next7Days: number
  next30Days: number
  future: number
  consolidatedOverdue?: number
  consolidatedNext7Days?: number
  consolidatedNext30Days?: number
  forecastOverdue?: number
  forecastNext7Days?: number
  forecastNext30Days?: number
}

export interface CashflowData {
  date: string
  income: number
  expense: number
  balance: number
  consolidatedIncome?: number
  consolidatedExpense?: number
  consolidatedBalance?: number
  forecastIncome?: number
  forecastExpense?: number
  forecastBalance?: number
}

export interface CategoryGroup {
  id: string
  name: string
  description?: string
  color: string
  icon: string
  status: "active" | "inactive"
  areaId?: string
  categoryIds?: string[]
  createdAt: string
  updatedAt: string
}

export interface Area {
  id: string
  name: string
  description?: string
  type: "income" | "fixedExpenses" | "dailyExpenses" | "personal" | "taxesFees" | "fixed-expenses" | "daily-expenses" | "taxes-fees"
  color: string
  icon: string
  status: "active" | "inactive"
  createdAt: string
  updatedAt: string
}

export interface AreaFormData {
  name: string
  description?: string
  type: Area["type"]
  color: string
  icon: string
  status: Area["status"]
}

export interface Budget {
  id: string
  categoryGroupId: string
  month: number
  year: number
  planned: number
  funded: number
  spent: number
  rolloverEnabled: boolean
  rolloverAmount?: number
}

export interface BudgetAllocation {
  id: string
  budget_group_id: string
  category_group_id?: string
  month: string
  planned_amount: number
  funded_amount: number
  spent_amount: number
  available_amount: number
  created_at?: string
  updated_at?: string
}

export interface BudgetAllocationFormData {
  budget_group_id: string
  category_group_id?: string
  month: string
  planned_amount: number
  funded_amount: number
}

export interface BudgetFormData {
  categoryGroupId: string
  month: number
  year: number
  planned: number
  funded: number
  rolloverEnabled?: boolean
  rolloverAmount?: number
}

export interface FundTransferFormData {
  fromBudgetGroupId: string
  toBudgetGroupId: string
  amount: number
  month: number
  year: number
}

export interface BudgetGroup extends CategoryGroup {
  categoryIds?: string[]
}

export interface BudgetGroupFormData {
  name: string
  description?: string
  color: string
  icon: string
  status: "active" | "inactive"
  areaId?: string
  categoryIds?: string[]
}

export type CategoryGroupFormData = BudgetGroupFormData
export type GrupoCategoria = CategoryGroup
export type GrupoCategoriaFormData = CategoryGroupFormData

export interface BudgetSummary {
  categoryGroup: CategoryGroup
  planned: number
  funded: number
  spent: number
  available: number
  categories: CategoryWithSpent[]
}

export interface CategoryWithSpent extends Category {
  spent: number
  categoryGroupId?: string
}

export interface Transaction {
  id: string
  description?: string
  amount: number
  type: "income" | "expense"
  categoryId: string
  contactId?: string
  date: string
  status: "completed" | "pending" | "cancelled"
  notes?: string
  recurrence?: TransactionRecurrence
  templateId?: string | null
  template?: RecurringTemplate | null
  seriesIndex?: number | null
  skipped?: boolean
  isException?: boolean
  areaId?: string
  categoryGroupId?: string
  parentId?: string
  generatedFrom?: string
  createdAt: string
  updatedAt: string
}

export interface RecurringTemplate {
  id: string
  userId?: string
  frequency: "daily" | "weekly" | "monthly" | "yearly"
  interval: number
  daysOfWeek: DayOfWeek[]
  dayOfMonth: number | null
  weekOfMonth: "first" | "second" | "third" | "fourth" | "last" | null
  monthOfYear: number | null
  monthlyMode: string | null
  count: number | null
  startDate: string
  endDate: string | null
  paused: boolean
  pausedAt: string | null
  templateAmount: number
  templateDescription: string
  templateNotes: string | null
  templateType: "income" | "expense"
  templateCategoryId: string
  templateContactId: string | null
  templateAreaId: string | null
  templateCategoryGroupId: string | null
  createdAt: string
  updatedAt: string
}

export interface RecurringSeriesView {
  template: RecurringTemplate
  executions: Transaction[]
  counts: {
    total: number
    pending: number
    completed: number
    cancelled: number
    skipped: number
  }
}

export interface TransactionFormData {
  description: string
  amount: number
  type: "income" | "expense"
  categoryId: string
  contactId?: string
  date: string
  status: "completed" | "pending" | "cancelled"
  notes?: string
  recurrence?: TransactionRecurrence
  areaId?: string
  categoryGroupId?: string
}

export interface TransactionRecurrence {
  enabled: boolean
  frequency: "daily" | "weekly" | "monthly" | "yearly"
  interval: number // 1-99, repetir a cada X dias, semanas, meses, anos
  daysOfWeek?: DayOfWeek[] // usado quando diário ou semanal
  dayOfWeek?: DayOfWeek // usado no mensal por semana
  dayOfMonth?: number // usado no mensal (1-31)
  weekOfMonth?: "first" | "second" | "third" | "fourth" | "last" // usado no mensal por semana
  monthOfYear?: number // usado no anual (1-12)
  monthlyType?: "dayOfMonth" | "weekOfMonth"
  endType?: "count" | "date"
  count?: number // 1-100 repetições (opcional)
  endDate?: string // ISO 8601 date | null
  generatedFrom?: string // id of original transaction
  applyMode?: "single" | "future" | "all" // for editing recurrent transactions
}

export type DayOfWeek = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday"

export interface RecurrenceEditOptions {
  single: "Aplicar somente neste registro"
  future: "Aplicar neste registro e nos futuros"
  all: "Aplicar em todos os registros"
}

export interface TransactionHierarchy {
  area: Area
  categoryGroup: CategoryGroup
  category: Category
}

export interface AreaWithCategoryGroups extends Area {
  categoryGroups: CategoryGroup[]
}

export interface CategoryGroupWithCategories extends CategoryGroup {
  categories: Category[]
}

export interface DashboardSummary {
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

export interface StatusSummary {
  completedReceivables: number
  completedPayables: number
  pendingReceivables: number
  pendingPayables: number
}

export interface ConsolidationSummary {
  consolidatedReceivables: number
  consolidatedPayables: number
  forecastReceivables: number
  forecastPayables: number
}

export interface RecurrenceOption {
  id: string
  label: string
  frequency?: "daily" | "weekly" | "monthly" | "yearly"
  interval?: number
  daysOfWeek?: DayOfWeek[]
  dayOfMonth?: number
  weekOfMonth?: "first" | "second" | "third" | "fourth" | "last"
  monthOfYear?: number
}

export interface RecurrenceEndOption {
  type: "never" | "date" | "count"
  date?: string
  count?: number
}
