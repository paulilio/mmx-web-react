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

function resolveApiUrl(endpoint: string): string {
  // Transactions already have first-party Next.js handlers in app/api.
  if (endpoint.startsWith("/transactions")) {
    return `/api${endpoint}`
  }

  return `${API_BASE}${endpoint}`
}

export async function getJSON<T>(endpoint: string): Promise<T> {
  if (!USE_API) {
    await mockDelay()

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

    if (endpoint === "/areas") {
      return areasStorage.getAll() as T
    }
    if (endpoint.includes("/areas/")) {
      const id = endpoint.split("/").pop()!
      return areasStorage.getById(id) as T
    }
    if (endpoint === "/category-groups") {
      return categoryGroupsStorage.getAll() as T
    }
    if (endpoint.includes("/category-groups/")) {
      const id = endpoint.split("/").pop()!
      return categoryGroupsStorage.getById(id) as T
    }
    if (endpoint === "/categories") {
      return categoriesStorage.getAll() as T
    }
    if (endpoint.includes("/categories/")) {
      const id = endpoint.split("/").pop()!
      return categoriesStorage.getById(id) as T
    }
    if (endpoint === "/contacts") {
      return contactsStorage.getAll() as T
    }
    if (endpoint.startsWith("/transactions")) {
      return transactionsStorage.getAll() as T
    }

    if (endpoint === "/reports/summary") {
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

    if (endpoint === "/reports/aging") {
      const transactions = await transactionsStorage.getAll()
      console.log("[v0] Reports aging - transactions count:", transactions?.length)

      const completedTransactions = transactions?.filter((t) => t.status === "completed") || []
      const pendingTransactions = transactions?.filter((t) => t.status === "pending") || []

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

    if (endpoint.startsWith("/reports/cashflow")) {
      const url = new URL(`http://localhost${endpoint}`)
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

    throw new Error(`Mock endpoint not implemented: ${endpoint}`)
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

    if (endpoint === "/areas") {
      return areasStorage.create(data) as T
    }
    if (endpoint === "/category-groups") {
      return categoryGroupsStorage.create(data) as T
    }
    if (endpoint === "/categories") {
      return categoriesStorage.create(data) as T
    }
    if (endpoint === "/contacts") {
      return contactsStorage.create(data) as T
    }
    if (endpoint === "/transactions") {
      return transactionsStorage.create(data) as T
    }

    throw new Error(`Mock endpoint not implemented: ${endpoint}`)
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

    console.log("[v0] PUT endpoint:", endpoint)
    console.log("[v0] PUT data:", data)

    const id = endpoint.split("/").pop()!
    console.log("[v0] Extracted ID:", id)

    if (endpoint.includes("/areas/")) {
      console.log("[v0] Routing to areas update")
      return areasStorage.update(id, data) as T
    }
    if (endpoint.includes("/category-groups/")) {
      console.log("[v0] Routing to category groups update")
      return categoryGroupsStorage.update(id, data) as T
    }
    if (endpoint.includes("/categories/")) {
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
    if (endpoint.includes("/contacts/")) {
      console.log("[v0] Routing to contacts update")
      return contactsStorage.update(id, data) as T
    }
    if (endpoint.includes("/transactions/")) {
      console.log("[v0] Routing to transactions update")
      return transactionsStorage.update(id, data) as T
    }

    console.log("[v0] No matching endpoint found for:", endpoint)
    throw new Error(`Mock endpoint not implemented: ${endpoint}`)
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

    const id = endpoint.split("/").pop()!

    if (endpoint.includes("/areas/")) {
      areasStorage.delete(id)
      return {} as T
    }
    if (endpoint.includes("/category-groups/")) {
      categoryGroupsStorage.delete(id)
      return {} as T
    }
    if (endpoint.includes("/categories/")) {
      categoriesStorage.delete(id)
      return {} as T
    }
    if (endpoint.includes("/contacts/")) {
      contactsStorage.delete(id)
      return {} as T
    }
    if (endpoint.includes("/transactions/")) {
      transactionsStorage.delete(id)
      return {} as T
    }

    throw new Error(`Mock endpoint not implemented: ${endpoint}`)
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
