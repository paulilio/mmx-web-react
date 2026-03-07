import { USE_API, API_BASE } from "../shared/config"
import { areasStorage, categoryGroupsStorage, categoriesStorage, transactionsStorage, contactsStorage } from "../server/storage"

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
    this.name = "ApiError"
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorText = await response.text()
    throw new ApiError(response.status, errorText || response.statusText)
  }
  return response.json()
}

// Mock delay to simulate API calls
const mockDelay = () => new Promise((resolve) => setTimeout(resolve, 100))

const MOCK_BUDGET_ALLOCATIONS_KEY = "mmx_budget_allocations"
const LEGACY_BUDGET_ALLOCATIONS_KEY = "budget_allocations"

type MockBudgetAllocationRecord = {
  id: string
  userId: string
  budget_group_id: string
  category_group_id?: string
  month: string
  planned_amount: number
  funded_amount: number
  spent_amount: number
  available_amount: number
  created_at: string
  updated_at: string
}

function resolveCanonicalEndpoint(endpoint: string): string {
  if (endpoint.startsWith("/budget-groups")) {
    return endpoint.replace("/budget-groups", "/category-groups")
  }

  if (endpoint.startsWith("/grupos-categorias")) {
    return endpoint.replace("/grupos-categorias", "/category-groups")
  }

  return endpoint
}

function getMockCurrentUserId(): string {
  if (typeof window === "undefined" || typeof localStorage === "undefined") {
    return "mock-user"
  }

  try {
    const userData = localStorage.getItem("auth_user")
    if (!userData) return "mock-user"

    const user = JSON.parse(userData) as { id?: string }
    return user.id || "mock-user"
  } catch {
    return "mock-user"
  }
}

function toNumber(value: unknown): number {
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : 0
}

function normalizeBudgetAllocation(input: Partial<MockBudgetAllocationRecord> & Record<string, unknown>): MockBudgetAllocationRecord {
  const now = new Date().toISOString()
  const plannedAmount = toNumber(input.planned_amount ?? input.plannedAmount)
  const fundedAmount = toNumber(input.funded_amount ?? input.fundedAmount)
  const spentAmount = toNumber(input.spent_amount ?? input.spentAmount)
  const availableAmount =
    input.available_amount != null || input.availableAmount != null
      ? toNumber(input.available_amount ?? input.availableAmount)
      : fundedAmount - spentAmount

  return {
    id: (input.id as string) || `alloc_${Math.random().toString(36).slice(2)}`,
    userId: (input.userId as string) || getMockCurrentUserId(),
    budget_group_id: (input.budget_group_id as string) || (input.budgetGroupId as string) || "",
    category_group_id: (input.category_group_id as string) || (input.categoryGroupId as string) || undefined,
    month: (input.month as string) || "",
    planned_amount: plannedAmount,
    funded_amount: fundedAmount,
    spent_amount: spentAmount,
    available_amount: availableAmount,
    created_at: (input.created_at as string) || (input.createdAt as string) || now,
    updated_at: (input.updated_at as string) || (input.updatedAt as string) || now,
  }
}

function readMockBudgetAllocations(): MockBudgetAllocationRecord[] {
  if (typeof window === "undefined" || typeof localStorage === "undefined") {
    return []
  }

  const raw = localStorage.getItem(MOCK_BUDGET_ALLOCATIONS_KEY) || localStorage.getItem(LEGACY_BUDGET_ALLOCATIONS_KEY)
  if (!raw) return []

  try {
    const parsed = JSON.parse(raw) as Array<Partial<MockBudgetAllocationRecord> & Record<string, unknown>>
    if (!Array.isArray(parsed)) return []
    return parsed.map((item) => normalizeBudgetAllocation(item))
  } catch {
    return []
  }
}

function writeMockBudgetAllocations(items: MockBudgetAllocationRecord[]) {
  if (typeof window === "undefined" || typeof localStorage === "undefined") {
    return
  }

  localStorage.setItem(MOCK_BUDGET_ALLOCATIONS_KEY, JSON.stringify(items))
  localStorage.setItem(LEGACY_BUDGET_ALLOCATIONS_KEY, JSON.stringify(items))
}

function resolveApiUrl(endpoint: string): string {
  // Migrated domains already have first-party Next.js handlers in app/api.
  if (
    endpoint.startsWith("/transactions") ||
    endpoint.startsWith("/categories") ||
    endpoint.startsWith("/contacts") ||
    endpoint.startsWith("/auth") ||
    endpoint.startsWith("/areas") ||
    endpoint.startsWith("/budget") ||
    endpoint.startsWith("/budget-allocations")
  ) {
    return `/api${endpoint}`
  }

  return `${API_BASE}${endpoint}`
}

export async function getJSON<T>(endpoint: string): Promise<T> {
  if (!USE_API) {
    await mockDelay()
    const canonicalEndpoint = resolveCanonicalEndpoint(endpoint)

    const parseAmount = (amount: any): number => {
      if (typeof amount === "number") return amount
      if (typeof amount === "string") {
        // Remove dots (thousands separator) and replace comma with dot (decimal separator)
        const cleaned = amount.replace(/\./g, "").replace(",", ".")
        const parsed = Number.parseFloat(cleaned)
        return isNaN(parsed) ? 0 : parsed
      }
      return 0
    }

    if (canonicalEndpoint === "/areas") {
      return areasStorage.getAll() as T
    }
    if (canonicalEndpoint.includes("/areas/")) {
      const id = canonicalEndpoint.split("/").pop()!
      return areasStorage.getById(id) as T
    }
    if (canonicalEndpoint === "/category-groups") {
      return categoryGroupsStorage.getAll() as T
    }
    if (canonicalEndpoint.includes("/category-groups/")) {
      const id = canonicalEndpoint.split("/").pop()!
      return categoryGroupsStorage.getById(id) as T
    }
    if (canonicalEndpoint === "/categories") {
      return categoriesStorage.getAll() as T
    }
    if (canonicalEndpoint.includes("/categories/")) {
      const id = canonicalEndpoint.split("/").pop()!
      return categoriesStorage.getById(id) as T
    }
    if (canonicalEndpoint === "/contacts") {
      return contactsStorage.getAll() as T
    }
    if (canonicalEndpoint.startsWith("/transactions")) {
      return transactionsStorage.getAll() as T
    }

    if (canonicalEndpoint.startsWith("/budget-allocations")) {
      const allocations = readMockBudgetAllocations()
      const currentUserId = getMockCurrentUserId()

      const month = canonicalEndpoint.includes("?")
        ? new URL(`http://localhost${canonicalEndpoint}`).searchParams.get("month")
        : null

      const filtered = allocations.filter((item) => {
        if (item.userId !== currentUserId) return false
        if (month && item.month !== month) return false
        return true
      })

      return filtered as T
    }

    if (canonicalEndpoint.startsWith("/budget/")) {
      // Budget summary in mock mode is built by the page composition logic.
      return [] as T
    }

    if (canonicalEndpoint === "/reports/summary") {
      const transactions = await transactionsStorage.getAll()
      console.log("[v0] Reports summary - transactions count:", transactions?.length)
      console.log("[v0] Reports summary - transactions data:", transactions)

      const completedTransactions = transactions?.filter((t) => t.status === "completed") || []
      const pendingTransactions = transactions?.filter((t) => t.status === "pending") || []

      const summary = {
        totalOpen: 0,
        totalOverdue: 0,
        totalNext7Days: 0,
        totalNext30Days: 0,
        totalReceivables:
          transactions?.filter((t) => t.type === "income").reduce((sum, t) => sum + parseAmount(t.amount), 0) || 0,
        totalPayables:
          transactions?.filter((t) => t.type === "expense").reduce((sum, t) => sum + parseAmount(t.amount), 0) || 0,
        completedReceivables: completedTransactions
          .filter((t) => t.type === "income")
          .reduce((sum, t) => sum + parseAmount(t.amount), 0),
        completedPayables: completedTransactions
          .filter((t) => t.type === "expense")
          .reduce((sum, t) => sum + parseAmount(t.amount), 0),
        pendingReceivables: pendingTransactions
          .filter((t) => t.type === "income")
          .reduce((sum, t) => sum + parseAmount(t.amount), 0),
        pendingPayables: pendingTransactions
          .filter((t) => t.type === "expense")
          .reduce((sum, t) => sum + parseAmount(t.amount), 0),
      }
      console.log("[v0] Reports summary result:", summary)
      return summary as T
    }

    if (canonicalEndpoint === "/reports/aging") {
      const transactions = await transactionsStorage.getAll()
      console.log("[v0] Reports aging - transactions count:", transactions?.length)

      const aging = {
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
      console.log("[v0] Reports aging result:", aging)
      return aging as T
    }

    if (canonicalEndpoint.startsWith("/reports/cashflow")) {
      const url = new URL(`http://localhost${canonicalEndpoint}`)
      const statusFilter = url.searchParams.get("status") // all, completed, pending, cancelled

      const transactions = await transactionsStorage.getAll()
      console.log("[v0] Reports cashflow - transactions count:", transactions?.length)
      console.log("[v0] Reports cashflow - status filter:", statusFilter)

      if (!transactions || transactions.length === 0) {
        console.log("[v0] Reports cashflow result: 0 items")
        return [] as T
      }

      let filteredTransactions = transactions
      if (statusFilter === "completed") {
        filteredTransactions = transactions.filter((t) => t.status === "completed")
      } else if (statusFilter === "pending") {
        filteredTransactions = transactions.filter((t) => t.status === "pending")
      } else if (statusFilter === "cancelled") {
        filteredTransactions = transactions.filter((t) => t.status === "cancelled")
      }

      const dailyData = new Map<
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

      filteredTransactions.forEach((t) => {
        const date = t.date
        if (!dailyData.has(date)) {
          dailyData.set(date, {
            income: 0,
            expense: 0,
            completedIncome: 0,
            completedExpense: 0,
            pendingIncome: 0,
            pendingExpense: 0,
          })
        }
        const dayData = dailyData.get(date)!
        const isCompleted = t.status === "completed"
        const amount = parseAmount(t.amount)

        if (t.type === "income") {
          dayData.income += amount
          if (isCompleted) {
            dayData.completedIncome += amount
          } else {
            dayData.pendingIncome += amount
          }
        } else {
          dayData.expense += amount
          if (isCompleted) {
            dayData.completedExpense += amount
          } else {
            dayData.pendingExpense += amount
          }
        }
      })

      const sortedDates = Array.from(dailyData.keys()).sort()
      let runningBalance = 0
      let completedBalance = 0
      let pendingBalance = 0

      const cashflowData = sortedDates.map((date) => {
        const dayData = dailyData.get(date)!
        runningBalance += dayData.income - dayData.expense
        completedBalance += dayData.completedIncome - dayData.completedExpense
        pendingBalance += dayData.pendingIncome - dayData.pendingExpense

        return {
          date,
          income: dayData.income,
          expense: dayData.expense,
          balance: runningBalance,
          completedIncome: dayData.completedIncome,
          completedExpense: dayData.completedExpense,
          completedBalance,
          pendingIncome: dayData.pendingIncome,
          pendingExpense: dayData.pendingExpense,
          pendingBalance,
        }
      })

      console.log("[v0] Reports cashflow result:", cashflowData.length, "items")
      console.log("[v0] Reports cashflow data structure:", cashflowData)
      return cashflowData as T
    }

    throw new Error(`Mock endpoint not implemented: ${canonicalEndpoint}`)
  }

  const response = await fetch(resolveApiUrl(endpoint), {
    headers: {
      "Content-Type": "application/json",
    },
  })
  return handleResponse<T>(response)
}

export async function postJSON<T>(endpoint: string, data: any): Promise<T> {
  if (!USE_API) {
    await mockDelay()
    const canonicalEndpoint = resolveCanonicalEndpoint(endpoint)

    if (canonicalEndpoint === "/areas") {
      return areasStorage.create(data) as T
    }
    if (canonicalEndpoint === "/category-groups") {
      return categoryGroupsStorage.create(data) as T
    }
    if (canonicalEndpoint === "/categories") {
      return categoriesStorage.create(data) as T
    }
    if (canonicalEndpoint === "/contacts") {
      return contactsStorage.create(data) as T
    }
    if (canonicalEndpoint === "/transactions") {
      return transactionsStorage.create(data) as T
    }

    if (canonicalEndpoint === "/budget-allocations") {
      const allocations = readMockBudgetAllocations()
      const allocation = normalizeBudgetAllocation(data)
      allocations.push(allocation)
      writeMockBudgetAllocations(allocations)
      return allocation as T
    }

    if (canonicalEndpoint === "/budget/transfer-funds") {
      const fromBudgetGroupId = data.fromBudgetGroupId as string
      const toBudgetGroupId = data.toBudgetGroupId as string
      const amount = toNumber(data.amount)
      const month = `${data.year}-${String(data.month).padStart(2, "0")}`
      const currentUserId = getMockCurrentUserId()

      const allocations = readMockBudgetAllocations()
      const from = allocations.find(
        (item) => item.userId === currentUserId && item.budget_group_id === fromBudgetGroupId && item.month === month,
      )
      const to = allocations.find(
        (item) => item.userId === currentUserId && item.budget_group_id === toBudgetGroupId && item.month === month,
      )

      if (!from || !to) {
        throw new Error("Alocacao nao encontrada para transferencia")
      }

      if (from.available_amount < amount) {
        throw new Error("Fundos insuficientes")
      }

      from.funded_amount -= amount
      from.available_amount -= amount
      from.updated_at = new Date().toISOString()

      to.funded_amount += amount
      to.available_amount += amount
      to.updated_at = new Date().toISOString()

      writeMockBudgetAllocations(allocations)

      return { from, to } as T
    }

    const addFundsMatch = canonicalEndpoint.match(/^\/budget\/([^/]+)\/(\d{4})\/(\d{1,2})\/add-funds$/)
    if (addFundsMatch) {
      const budgetGroupId = addFundsMatch[1]
      const year = addFundsMatch[2]
      const month = addFundsMatch[3]
      if (!budgetGroupId || !year || !month) {
        throw new Error("Endpoint de add-funds invalido")
      }

      const monthString = `${year}-${month.padStart(2, "0")}`
      const currentUserId = getMockCurrentUserId()
      const amount = toNumber(data.amount)
      const allocations = readMockBudgetAllocations()

      let target = allocations.find(
        (item) => item.userId === currentUserId && item.budget_group_id === budgetGroupId && item.month === monthString,
      )

      if (!target) {
        target = normalizeBudgetAllocation({
          budget_group_id: budgetGroupId,
          month: monthString,
          planned_amount: 0,
          funded_amount: amount,
          spent_amount: 0,
          userId: currentUserId,
        })
        allocations.push(target)
      } else {
        target.funded_amount += amount
        target.available_amount = target.funded_amount - target.spent_amount
        target.updated_at = new Date().toISOString()
      }

      writeMockBudgetAllocations(allocations)
      return target as T
    }

    throw new Error(`Mock endpoint not implemented: ${canonicalEndpoint}`)
  }

  const response = await fetch(resolveApiUrl(endpoint), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
  return handleResponse<T>(response)
}

export async function putJSON<T>(endpoint: string, data: any): Promise<T> {
  if (!USE_API) {
    await mockDelay()
    const canonicalEndpoint = resolveCanonicalEndpoint(endpoint)

    console.log("[v0] PUT endpoint:", canonicalEndpoint)
    console.log("[v0] PUT data:", data)

    const id = canonicalEndpoint.split("/").pop()!
    console.log("[v0] Extracted ID:", id)

    if (canonicalEndpoint.includes("/areas/")) {
      console.log("[v0] Routing to areas update")
      return areasStorage.update(id, data) as T
    }
    if (canonicalEndpoint.includes("/category-groups/")) {
      console.log("[v0] Routing to category groups update")
      return categoryGroupsStorage.update(id, data) as T
    }
    if (canonicalEndpoint.includes("/categories/")) {
      console.log("[v0] Routing to categories update")
      try {
        const result = categoriesStorage.update(id, data)
        console.log("[v0] Categories update successful:", result)
        return result as T
      } catch (error) {
        console.log("[v0] Categories update error:", error)
        throw error
      }
    }
    if (canonicalEndpoint.includes("/contacts/")) {
      console.log("[v0] Routing to contacts update")
      return contactsStorage.update(id, data) as T
    }
    if (canonicalEndpoint.includes("/transactions/")) {
      console.log("[v0] Routing to transactions update")
      return transactionsStorage.update(id, data) as T
    }

    if (canonicalEndpoint.includes("/budget-allocations/")) {
      const allocations = readMockBudgetAllocations()
      const index = allocations.findIndex((item) => item.id === id)
      if (index === -1) {
        throw new Error("Alocacao nao encontrada")
      }

      const current = allocations[index]
      if (!current) {
        throw new Error("Alocacao nao encontrada")
      }

      allocations[index] = normalizeBudgetAllocation({
        ...current,
        ...data,
        id: current.id,
        userId: current.userId,
        budget_group_id: data.budget_group_id ?? data.budgetGroupId ?? current.budget_group_id,
        category_group_id: data.category_group_id ?? data.categoryGroupId ?? current.category_group_id,
        month: data.month ?? current.month,
        planned_amount: data.planned_amount ?? data.plannedAmount ?? current.planned_amount,
        funded_amount: data.funded_amount ?? data.fundedAmount ?? current.funded_amount,
        spent_amount: data.spent_amount ?? data.spentAmount ?? current.spent_amount,
        available_amount: data.available_amount ?? data.availableAmount ?? current.available_amount,
        created_at: current.created_at,
        updated_at: new Date().toISOString(),
      })

      writeMockBudgetAllocations(allocations)
      return allocations[index] as T
    }

    const budgetUpdateMatch = canonicalEndpoint.match(/^\/budget\/([^/]+)\/(\d{4})\/(\d{1,2})$/)
    if (budgetUpdateMatch) {
      const [, budgetGroupId, year, month] = budgetUpdateMatch
      return {
        id: `budget_${budgetGroupId}_${year}_${month}`,
        userId: getMockCurrentUserId(),
        categoryGroupId: budgetGroupId,
        month: Number(month),
        year: Number(year),
        planned: toNumber(data.planned),
        funded: toNumber(data.funded),
        spent: 0,
        rolloverEnabled: Boolean(data.rolloverEnabled),
        rolloverAmount: data.rolloverAmount ?? null,
      } as T
    }

    const rolloverMatch = canonicalEndpoint.match(/^\/budget\/([^/]+)\/(\d{4})\/(\d{1,2})\/rollover$/)
    if (rolloverMatch) {
      const [, budgetGroupId, year, month] = rolloverMatch
      return {
        id: `budget_${budgetGroupId}_${year}_${month}`,
        userId: getMockCurrentUserId(),
        categoryGroupId: budgetGroupId,
        month: Number(month),
        year: Number(year),
        planned: 0,
        funded: 0,
        spent: 0,
        rolloverEnabled: Boolean(data.enabled ?? data.rolloverEnabled),
        rolloverAmount: data.amount ?? data.rolloverAmount ?? null,
      } as T
    }

    console.log("[v0] No matching endpoint found for:", canonicalEndpoint)
    throw new Error(`Mock endpoint not implemented: ${canonicalEndpoint}`)
  }

  const response = await fetch(resolveApiUrl(endpoint), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
  return handleResponse<T>(response)
}

export async function deleteJSON<T>(endpoint: string): Promise<T> {
  if (!USE_API) {
    await mockDelay()
    const canonicalEndpoint = resolveCanonicalEndpoint(endpoint)

    const id = canonicalEndpoint.split("/").pop()!

    if (canonicalEndpoint.includes("/areas/")) {
      areasStorage.delete(id)
      return {} as T
    }
    if (canonicalEndpoint.includes("/category-groups/")) {
      categoryGroupsStorage.delete(id)
      return {} as T
    }
    if (canonicalEndpoint.includes("/categories/")) {
      categoriesStorage.delete(id)
      return {} as T
    }
    if (canonicalEndpoint.includes("/contacts/")) {
      contactsStorage.delete(id)
      return {} as T
    }
    if (canonicalEndpoint.includes("/transactions/")) {
      transactionsStorage.delete(id)
      return {} as T
    }

    if (canonicalEndpoint.includes("/budget-allocations/")) {
      const allocations = readMockBudgetAllocations().filter((item) => item.id !== id)
      writeMockBudgetAllocations(allocations)
      return {} as T
    }

    throw new Error(`Mock endpoint not implemented: ${canonicalEndpoint}`)
  }

  const response = await fetch(resolveApiUrl(endpoint), {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  })
  return handleResponse<T>(response)
}

export const api = {
  get: getJSON,
  post: postJSON,
  put: putJSON,
  delete: deleteJSON,
}
