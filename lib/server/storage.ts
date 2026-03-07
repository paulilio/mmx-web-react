import type { Category, Transaction, Contact, Area, CategoryGroup } from "../shared/types"
import { transactionPersistence } from "./persistence-service"
import { migrationService, UNIFIED_STORAGE_KEYS } from "./migration-service"

const STORAGE_KEYS = UNIFIED_STORAGE_KEYS

const USE_API = process.env.NEXT_PUBLIC_USE_API === "true"

const tempCache = new Map<string, { data: any[]; timestamp: number; userId?: string }>()
const CACHE_DURATION = 2000 // 2 seconds

// JSON file paths - always use /data folder when in mock mode
const DATA_FILES = {
  areas: "/data/areas.json",
  categoryGroups: "/data/category-groups.json",
  categories: "/data/categories.json",
  transactions: "/data/transactions.json",
  contacts: "/data/contacts.json",
} as const

function getCurrentUserId(): string | null {
  try {
    // Try to get current user from auth context
    if (typeof window !== "undefined") {
      const authUser = localStorage.getItem("auth_user")
      if (authUser) {
        const user = JSON.parse(authUser)
        return user.id || null
      }
    }
  } catch (error) {
    console.log("[v0] Error getting current user ID:", error)
  }
  return null
}

async function loadFromFile<T>(filePath: string): Promise<T[]> {
  // Ensure we're always using /data folder in mock mode
  const normalizedPath = USE_API
    ? filePath
    : filePath.startsWith("/data/")
      ? filePath
      : `/data/${filePath.split("/").pop()}`

  const currentUserId = getCurrentUserId()

  // Create cache key that includes userId for proper isolation
  const cacheKey = `${normalizedPath}:${currentUserId || "anonymous"}`

  // Check temporary cache first
  const cached = tempCache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION && cached.userId === currentUserId) {
    return cached.data as T[]
  }

  // In mock mode, use unified storage with migration
  if (!USE_API) {
    try {
      // Get storage key from file path
      const fileName = normalizedPath.split("/").pop()?.replace(".json", "")
      const storageKey = Object.entries(DATA_FILES).find(([_, path]) => path.includes(fileName || ""))?.[0]

      if (storageKey && currentUserId) {
        const unifiedKey = STORAGE_KEYS[storageKey as keyof typeof STORAGE_KEYS]

        // Run migration if needed
        if (migrationService.needsMigration()) {
          console.log("[v0] Running automatic migration...")
          await migrationService.migrateToUnifiedStructure()
        }

        // Get user-specific data from unified storage
        const userData = migrationService.getUserData<any>(unifiedKey, currentUserId) as T[]

        // Update temp cache
        tempCache.set(cacheKey, { data: [...userData], timestamp: Date.now(), userId: currentUserId })
        return userData
      }

      // Fallback for when no user is authenticated - return empty array
      if (!currentUserId) {
        console.log("[v0] No authenticated user, returning empty data")
        return []
      }
    } catch (error) {
      console.log(`[v0] Failed to load user data for ${normalizedPath}:`, error)
    }

    // Return empty array in mock mode if no data found
    return []
  }

  // Only use fetch in API mode
  try {
    const response = await fetch(normalizedPath)
    if (response.ok) {
      const data = await response.json()
      return data
    }
  } catch (error) {
    console.log(`[v0] Failed to load ${normalizedPath}, using empty array`)
  }

  // Return empty array if file doesn't exist or fails to load
  return []
}

async function saveToCache<T>(filePath: string, data: T[]): Promise<void> {
  // Ensure we're always using /data folder in mock mode
  const normalizedPath = USE_API
    ? filePath
    : filePath.startsWith("/data/")
      ? filePath
      : `/data/${filePath.split("/").pop()}`

  const currentUserId = getCurrentUserId()
  console.log(`[v0] Saving to file: ${normalizedPath} (${data.length} items) for user: ${currentUserId}`)

  // Create cache key that includes userId for proper isolation
  const cacheKey = `${normalizedPath}:${currentUserId || "anonymous"}`

  // Always update temp cache
  tempCache.set(cacheKey, { data: [...data], timestamp: Date.now(), userId: currentUserId ?? undefined })

  if (!USE_API && currentUserId) {
    try {
      const fileName = normalizedPath.split("/").pop()?.replace(".json", "")
      const storageKey = Object.entries(DATA_FILES).find(([_, path]) => path.includes(fileName || ""))?.[0]

      if (storageKey) {
        const unifiedKey = STORAGE_KEYS[storageKey as keyof typeof STORAGE_KEYS]

        // Add userId to all records if not present
        const dataWithUserId = data.map((item: any) => ({
          ...item,
          userId: item.userId || currentUserId,
        }))

        // Save to unified storage
        migrationService.saveUserData(unifiedKey, currentUserId, dataWithUserId)
      }
    } catch (error) {
      console.log(`[v0] Error saving user data: ${normalizedPath}`, error)
      throw error
    }

    // Still try to persist to file via PUT for external tools
    try {
      const response = await fetch(normalizedPath, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        console.log(`[v0] Persisted to file: ${normalizedPath} (${data.length} items)`)
      } else {
        console.log(`[v0] Failed to persist to file: ${normalizedPath}`)
      }
    } catch (error) {
      console.log(`[v0] Error persisting to file: ${normalizedPath}`, error)
    }
  }
}

export async function initializeCleanData(): Promise<void> {
  console.log("[v0] Initializing clean data on startup...")

  const currentUserId = getCurrentUserId()

  if (!USE_API && currentUserId) {
    try {
      // Clear user-specific data in unified storage
      Object.values(STORAGE_KEYS).forEach((key) => {
        migrationService.saveUserData(key, currentUserId, [])
      })

      console.log(`[v0] Cleared user data for user: ${currentUserId}`)
    } catch (error) {
      console.log("[v0] Error clearing user data:", error)
    }
  }

  // Clear temp cache
  tempCache.clear()

  await Promise.all(
    Object.values(DATA_FILES).map(async (filePath) => {
      await saveToCache(filePath, [])
    }),
  )

  console.log("[v0] Clean data initialization completed")
}

export function bulkLoadData(data: Record<string, any[]>): void {
  console.log("[v0] Starting bulk data load...")

  const currentUserId = getCurrentUserId()
  if (!currentUserId) {
    console.log("[v0] No authenticated user, skipping bulk load")
    return
  }

  const keyToFileMap: Record<string, string> = {
    mmx_areas: DATA_FILES.areas,
    mmx_category_groups: DATA_FILES.categoryGroups,
    mmx_categories: DATA_FILES.categories,
    mmx_transactions: DATA_FILES.transactions,
    mmx_contacts: DATA_FILES.contacts,
  }

  Object.entries(data).forEach(([key, value]) => {
    if (Array.isArray(value) && keyToFileMap[key]) {
      // Add userId to all records
      const dataWithUserId = value.map((item) => ({
        ...item,
        userId: item.userId || currentUserId,
      }))

      saveToCache(keyToFileMap[key], dataWithUserId)
      console.log(`[v0] Bulk loaded ${key}: ${value.length} items for user: ${currentUserId}`)
    }
  })

  console.log("[v0] Bulk data load completed")
}

export function clearAllData(): void {
  console.log("[v0] Clearing all data...")

  const currentUserId = getCurrentUserId()
  if (!currentUserId) {
    console.log("[v0] No authenticated user, skipping clear")
    return
  }

  Object.values(DATA_FILES).forEach(async (filePath) => {
    await saveToCache(filePath, [])
    console.log(`[v0] Cleared ${filePath} for user: ${currentUserId}`)
  })

  console.log("[v0] All data cleared")
}

function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9)
}

// Areas storage
export const areasStorage = {
  getAll: async (): Promise<Area[]> => loadFromFile<Area>(DATA_FILES.areas),

  getById: async (id: string): Promise<Area | null> => {
    const areas = await loadFromFile<Area>(DATA_FILES.areas)
    return areas.find((a) => a.id === id) || null
  },

  create: async (data: Omit<Area, "id">): Promise<Area> => {
    const areas = await loadFromFile<Area>(DATA_FILES.areas)
    const currentUserId = getCurrentUserId()

    if (!currentUserId) {
      throw new Error("User not authenticated")
    }

    const newArea: Area & { userId: string } = {
      ...data,
      id: generateId(),
      userId: currentUserId,
    } as Area & { userId: string }

    areas.push(newArea as Area)
    await saveToCache(DATA_FILES.areas, areas)
    return newArea as Area
  },

  update: async (id: string, data: Partial<Area>): Promise<Area> => {
    const areas = await loadFromFile<Area>(DATA_FILES.areas)
    const index = areas.findIndex((a) => a.id === id)
    if (index === -1) throw new Error("Area not found")
    const currentArea = areas[index]
    if (!currentArea) throw new Error("Area not found")

    areas[index] = { ...currentArea, ...data }
    await saveToCache(DATA_FILES.areas, areas)
    return areas[index] as Area
  },

  delete: async (id: string): Promise<void> => {
    const areas = await loadFromFile<Area>(DATA_FILES.areas)
    const filtered = areas.filter((a) => a.id !== id)
    await saveToCache(DATA_FILES.areas, filtered)
  },
}

// Category Groups storage
export const categoryGroupsStorage = {
  getAll: async (): Promise<CategoryGroup[]> => loadFromFile<CategoryGroup>(DATA_FILES.categoryGroups),

  getById: async (id: string): Promise<CategoryGroup | null> => {
    const categoryGroups = await loadFromFile<CategoryGroup>(DATA_FILES.categoryGroups)
    return categoryGroups.find((g) => g.id === id) || null
  },

  getByArea: async (areaId: string): Promise<CategoryGroup[]> => {
    const categoryGroups = await loadFromFile<CategoryGroup>(DATA_FILES.categoryGroups)
    return categoryGroups.filter((g) => g.areaId === areaId)
  },

  create: async (data: Omit<CategoryGroup, "id">): Promise<CategoryGroup> => {
    const categoryGroups = await loadFromFile<CategoryGroup>(DATA_FILES.categoryGroups)
    const currentUserId = getCurrentUserId()

    if (!currentUserId) {
      throw new Error("User not authenticated")
    }

    const newCategoryGroup: CategoryGroup & { userId: string } = {
      ...data,
      id: generateId(),
      userId: currentUserId,
    } as CategoryGroup & { userId: string }

    categoryGroups.push(newCategoryGroup as CategoryGroup)
    await saveToCache(DATA_FILES.categoryGroups, categoryGroups)
    return newCategoryGroup as CategoryGroup
  },

  update: async (id: string, data: Partial<CategoryGroup>): Promise<CategoryGroup> => {
    const categoryGroups = await loadFromFile<CategoryGroup>(DATA_FILES.categoryGroups)
    const index = categoryGroups.findIndex((g) => g.id === id)
    if (index === -1) throw new Error("Category group not found")

    const currentGroup = categoryGroups[index]
    if (!currentGroup) throw new Error("Category group not found")

    categoryGroups[index] = { ...currentGroup, ...data }
    await saveToCache(DATA_FILES.categoryGroups, categoryGroups)
    return categoryGroups[index] as CategoryGroup
  },

  delete: async (id: string): Promise<void> => {
    const categoryGroups = await loadFromFile<CategoryGroup>(DATA_FILES.categoryGroups)
    const filtered = categoryGroups.filter((g) => g.id !== id)
    await saveToCache(DATA_FILES.categoryGroups, filtered)
  },
}

// Categories storage
export const categoriesStorage = {
  getAll: async (): Promise<Category[]> => loadFromFile<Category>(DATA_FILES.categories),

  getById: async (id: string): Promise<Category | null> => {
    const categories = await loadFromFile<Category>(DATA_FILES.categories)
    return categories.find((c) => c.id === id) || null
  },

  create: async (data: Omit<Category, "id">): Promise<Category> => {
    const categories = await loadFromFile<Category>(DATA_FILES.categories)
    const currentUserId = getCurrentUserId()

    if (!currentUserId) {
      throw new Error("User not authenticated")
    }

    const newCategory: Category & { userId: string } = {
      ...data,
      id: generateId(),
      userId: currentUserId,
    } as Category & { userId: string }

    categories.push(newCategory as Category)
    await saveToCache(DATA_FILES.categories, categories)
    return newCategory as Category
  },

  update: async (id: string, data: Partial<Category>): Promise<Category> => {
    const categories = await loadFromFile<Category>(DATA_FILES.categories)
    const index = categories.findIndex((c) => c.id === id)
    if (index === -1) throw new Error("Category not found")

    const currentCategory = categories[index]
    if (!currentCategory) throw new Error("Category not found")

    categories[index] = { ...currentCategory, ...data }
    await saveToCache(DATA_FILES.categories, categories)
    return categories[index] as Category
  },

  delete: async (id: string): Promise<void> => {
    const categories = await loadFromFile<Category>(DATA_FILES.categories)
    const filtered = categories.filter((c) => c.id !== id)
    await saveToCache(DATA_FILES.categories, filtered)
  },
}

// Transactions storage
export const transactionsStorage = {
  getAll: async (): Promise<Transaction[]> => {
    return await transactionPersistence.read()
  },

  getByCategoryAndMonth: async (categoryId: string, month: string): Promise<Transaction[]> => {
    const transactions = await transactionPersistence.read()
    return transactions.filter((t) => t.categoryId === categoryId && t.date.startsWith(month))
  },

  create: async (data: Omit<Transaction, "id">): Promise<Transaction> => {
    const result = await transactionPersistence.create(data)
    console.log(`[v0] Created transaction ${result.id}, recurrence enabled: ${result.recurrence?.enabled}`)
    return result
  },

  update: async (id: string, data: Partial<Transaction>): Promise<Transaction> => {
    const result = await transactionPersistence.update(id, data)
    console.log(`[v0] Updated transaction ${id}`)
    return result
  },

  delete: async (id: string): Promise<void> => {
    const transactions = await transactionPersistence.read()
    const transaction = transactions.find((t) => t.id === id)

    if (transaction) {
      // Handle recurring transaction deletion
      const filteredTransactions = transactions.filter((t) => t.id !== id && t.recurrence?.generatedFrom !== id)

      // Save the filtered list directly using persistence service
      await transactionPersistence["saveToStorage"](filteredTransactions)
    } else {
      await transactionPersistence.delete(id)
    }
  },

  updateRecurring: async (
    id: string,
    data: Partial<Transaction>,
    editMode: "single" | "future" | "all",
  ): Promise<Transaction[]> => {
    const transactions = await loadFromFile<Transaction>(DATA_FILES.transactions)
    const targetTransaction = transactions.find((t) => t.id === id)

    if (!targetTransaction) throw new Error("Transaction not found")

    const parentId = targetTransaction.recurrence?.generatedFrom || id

    let updatedTransactions: Transaction[] = []

    switch (editMode) {
      case "single":
        // Update only this transaction
        const singleIndex = transactions.findIndex((t) => t.id === id)
        if (singleIndex !== -1) {
          const current = transactions[singleIndex]
          if (!current) throw new Error("Transaction not found")
          transactions[singleIndex] = { ...current, ...data }
          updatedTransactions = [transactions[singleIndex] as Transaction]
        }
        break

      case "future":
        // Update this transaction and all future ones
        const targetDate = new Date(targetTransaction.date)
        transactions.forEach((t, index) => {
          if ((t.id === id || t.recurrence?.generatedFrom === parentId) && new Date(t.date) >= targetDate) {
            const current = transactions[index]
            if (!current) return
            transactions[index] = { ...current, ...data }
            updatedTransactions.push(transactions[index] as Transaction)
          }
        })
        break

      case "all":
        // Update parent and all recurring transactions
        transactions.forEach((t, index) => {
          if (t.id === parentId || t.recurrence?.generatedFrom === parentId) {
            const current = transactions[index]
            if (!current) return
            transactions[index] = { ...current, ...data }
            updatedTransactions.push(transactions[index] as Transaction)
          }
        })
        break
    }

    await saveToCache(DATA_FILES.transactions, transactions)
    return updatedTransactions
  },

  generateRecurring: async (id: string): Promise<void> => {
    const transactions = await loadFromFile<Transaction>(DATA_FILES.transactions)
    const transaction = transactions.find((t) => t.id === id)

    if (!transaction) {
      throw new Error("Transaction not found")
    }

    if (!transaction.recurrence?.enabled) {
      console.log(`[v0] Transaction ${id} does not have recurrence enabled`)
      return
    }

    if (transaction.recurrence?.generatedFrom) {
      console.log(`[v0] Transaction ${id} is a generated transaction, cannot generate recurring`)
      return
    }

    console.log(`[v0] Explicitly generating recurring transactions for ${id}`)
    await processRecurringTransactions(transaction)
  },
}

// Contacts storage
export const contactsStorage = {
  getAll: async (): Promise<Contact[]> => loadFromFile<Contact>(DATA_FILES.contacts),

  create: async (data: Omit<Contact, "id">): Promise<Contact> => {
    const contacts = await loadFromFile<Contact>(DATA_FILES.contacts)
    const currentUserId = getCurrentUserId()

    if (!currentUserId) {
      throw new Error("User not authenticated")
    }

    const newContact: Contact & { userId: string } = {
      ...data,
      id: generateId(),
      userId: currentUserId,
    } as Contact & { userId: string }

    contacts.push(newContact as Contact)
    await saveToCache(DATA_FILES.contacts, contacts)
    return newContact as Contact
  },

  update: async (id: string, data: Partial<Contact>): Promise<Contact> => {
    const contacts = await loadFromFile<Contact>(DATA_FILES.contacts)
    const index = contacts.findIndex((c) => c.id === id)
    if (index === -1) throw new Error("Contact not found")

    const currentContact = contacts[index]
    if (!currentContact) throw new Error("Contact not found")

    contacts[index] = { ...currentContact, ...data }
    await saveToCache(DATA_FILES.contacts, contacts)
    return contacts[index] as Contact
  },

  delete: async (id: string): Promise<void> => {
    const contacts = await loadFromFile<Contact>(DATA_FILES.contacts)
    const filtered = contacts.filter((c) => c.id !== id)
    await saveToCache(DATA_FILES.contacts, filtered)
  },
}

function generateRecurringId(parentId: string, index: number): string {
  return `${parentId}-r${index}`
}

function getNextOccurrence(
  date: Date,
  frequency: string,
  interval = 1,
  daysOfWeek?: string[],
  dayOfMonth?: number,
  weekOfMonth?: "first" | "second" | "third" | "fourth" | "last",
  monthOfYear?: number,
): Date {
  const nextDate = new Date(date)

  switch (frequency) {
    case "daily":
      if (daysOfWeek && daysOfWeek.length > 0) {
        // Find next occurrence based on selected days of week with interval
        const dayMap = { sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6 }
        const targetDays = daysOfWeek.map((day) => dayMap[day as keyof typeof dayMap]).sort()

        let daysToAdd = 1
        let foundNext = false

        // Look for next valid day within the interval
        while (!foundNext && daysToAdd <= 7 * interval) {
          const checkDate = new Date(date)
          checkDate.setDate(checkDate.getDate() + daysToAdd)
          const checkDay = checkDate.getDay()

          if (targetDays.includes(checkDay)) {
            nextDate.setDate(date.getDate() + daysToAdd)
            foundNext = true
          } else {
            daysToAdd++
          }
        }

        if (!foundNext) {
          // If no valid day found, add interval days
          nextDate.setDate(nextDate.getDate() + interval)
        }
      } else {
        nextDate.setDate(nextDate.getDate() + interval)
      }
      break

    case "weekly":
      nextDate.setDate(nextDate.getDate() + 7 * interval)
      break

    case "monthly":
      if (weekOfMonth && daysOfWeek && daysOfWeek.length > 0) {
        // Monthly by week (e.g., "first Monday of month")
        const dayMap = { sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6 }
        const targetDay = dayMap[daysOfWeek[0] as keyof typeof dayMap]

        nextDate.setMonth(nextDate.getMonth() + interval)
        nextDate.setDate(1) // Start of month

        // Find the target day occurrence
        const firstDayOfMonth = nextDate.getDay()
        let daysToAdd = (targetDay - firstDayOfMonth + 7) % 7

        // Adjust for week position
        switch (weekOfMonth) {
          case "first":
            break // Already calculated
          case "second":
            daysToAdd += 7
            break
          case "third":
            daysToAdd += 14
            break
          case "fourth":
            daysToAdd += 21
            break
          case "last":
            // Find last occurrence of the day in the month
            const lastDayOfMonth = new Date(nextDate.getFullYear(), nextDate.getMonth() + 1, 0).getDate()
            const lastWeekStart = lastDayOfMonth - 6
            daysToAdd = lastWeekStart + ((targetDay - firstDayOfMonth + 7) % 7) - 1
            if (daysToAdd + 1 > lastDayOfMonth) daysToAdd -= 7
            break
        }

        nextDate.setDate(daysToAdd + 1)
      } else if (dayOfMonth) {
        // Monthly by day of month
        nextDate.setMonth(nextDate.getMonth() + interval)

        // Handle edge case where day doesn't exist in target month
        const lastDayOfTargetMonth = new Date(nextDate.getFullYear(), nextDate.getMonth() + 1, 0).getDate()
        const targetDayOfMonth = Math.min(dayOfMonth, lastDayOfTargetMonth)
        nextDate.setDate(targetDayOfMonth)
      } else {
        // Default to same day of month
        nextDate.setMonth(nextDate.getMonth() + interval)
      }
      break

    case "yearly":
      if (monthOfYear) {
        nextDate.setFullYear(nextDate.getFullYear() + interval)
        nextDate.setMonth(monthOfYear - 1) // monthOfYear is 1-based
        if (dayOfMonth) {
          const lastDayOfTargetMonth = new Date(nextDate.getFullYear(), monthOfYear, 0).getDate()
          const targetDayOfMonth = Math.min(dayOfMonth, lastDayOfTargetMonth)
          nextDate.setDate(targetDayOfMonth)
        }
      } else {
        nextDate.setFullYear(nextDate.getFullYear() + interval)
      }
      break
  }

  return nextDate
}

function generateRecurringTransactions(parentTransaction: Transaction): Transaction[] {
  if (!parentTransaction.recurrence?.enabled) {
    return []
  }

  const {
    frequency,
    interval = 1,
    count,
    endDate,
    daysOfWeek,
    dayOfMonth,
    weekOfMonth,
    monthOfYear,
  } = parentTransaction.recurrence
  const recurringTransactions: Transaction[] = []

  let currentDate = new Date(parentTransaction.date)
  const endDateTime = endDate ? new Date(endDate) : null
  let generatedCount = 0

  const maxIterations = Math.min(count || 30, 99) // Default to 30, max 99 to prevent explosion

  console.log(
    `[v0] Generating recurring transactions: frequency=${frequency}, count=${count}, maxIterations=${maxIterations}`,
  )

  for (let i = 1; i <= maxIterations; i++) {
    currentDate = getNextOccurrence(currentDate, frequency, interval, daysOfWeek, dayOfMonth, weekOfMonth, monthOfYear)

    // Check if we've reached the end date
    if (endDateTime && currentDate > endDateTime) {
      console.log(`[v0] Reached end date ${endDate}, stopping generation at ${i - 1} transactions`)
      break
    }

    // Check if we've reached the count limit
    if (count && generatedCount >= count - 1) {
      // -1 because parent counts as first occurrence
      console.log(`[v0] Reached count limit ${count}, stopping generation at ${generatedCount + 1} transactions`)
      break
    }

    const recurringTransaction: Transaction = {
      ...parentTransaction,
      id: generateRecurringId(parentTransaction.id, i),
      date: currentDate.toISOString().split("T")[0] || parentTransaction.date,
      recurrence: {
        ...parentTransaction.recurrence,
        generatedFrom: parentTransaction.id,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    recurringTransactions.push(recurringTransaction)
    generatedCount++
  }

  return recurringTransactions
}

void generateRecurringTransactions

async function processRecurringTransactions(transaction: Transaction): Promise<void> {
  if (!transaction.recurrence?.enabled) {
    return
  }

  if (transaction.recurrence?.generatedFrom) {
    console.log(`[v0] Skipping recurring generation for generated transaction ${transaction.id}`)
    return
  }

  console.log(`[v0] Processing recurring transactions for ${transaction.id}`)

  try {
    const transactions = await loadFromFile<Transaction>(DATA_FILES.transactions)

    // Remove existing recurring transactions for this parent
    const filteredTransactions = transactions.filter((t) => t.recurrence?.generatedFrom !== transaction.id)

    // Note: The actual generation is now handled by the hook layer
    // This function just cleans up existing generated transactions
    await saveToCache(DATA_FILES.transactions, filteredTransactions)

    console.log(`[v0] Cleaned up existing recurring transactions for ${transaction.id}`)
  } catch (error) {
    console.error(`[v0] Error processing recurring transactions for ${transaction.id}:`, error)
  }
}
