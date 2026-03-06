import type { Transaction } from "./types"
import { migrationService, UNIFIED_STORAGE_KEYS } from "./migration-service"

interface PersistenceConfig {
  useMock: boolean
  storageKey: string
  apiBaseUrl?: string
}

interface TransactionWithUserId extends Transaction {
  userId: string
}

class PersistenceService {
  private config: PersistenceConfig
  private updateLocks = new Set<string>()

  constructor(config: PersistenceConfig) {
    this.config = config
  }

  private generateId(): string {
    return `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  private getCurrentUserId(): string | null {
    try {
      if (typeof window !== "undefined") {
        const authUser = localStorage.getItem("auth_user")
        if (authUser) {
          const user = JSON.parse(authUser)
          return user.id || null
        }
      }
    } catch (error) {
      console.log("[PersistenceService] Error getting current user ID:", error)
    }
    return null
  }

  private async loadFromStorage(): Promise<Transaction[]> {
    if (this.config.useMock) {
      try {
        const currentUserId = this.getCurrentUserId()
        if (!currentUserId) {
          console.log("[PersistenceService] No authenticated user, returning empty transactions")
          return []
        }

        // Run migration if needed
        if (migrationService.needsMigration()) {
          console.log("[PersistenceService] Running automatic migration...")
          await migrationService.migrateToUnifiedStructure()
        }

        // Get user-specific transactions from unified storage
        const userData = migrationService.getUserData<TransactionWithUserId>(
          UNIFIED_STORAGE_KEYS.transactions,
          currentUserId,
        )

        console.log(
          `[PersistenceService] Transaction read: ${userData.length} records loaded for user ${currentUserId}`,
        )
        return userData as Transaction[]
      } catch (error) {
        console.log(`[PersistenceService] ERROR: Failed to load from unified storage:`, error)
        return []
      }
    } else {
      // Future API implementation
      const response = await fetch(`${this.config.apiBaseUrl}/transactions`)
      const data = await response.json()
      console.log(`[PersistenceService] Transaction read: ${data.length} records loaded`)
      return data
    }
  }

  private async saveToStorage(transactions: Transaction[]): Promise<void> {
    if (this.config.useMock) {
      try {
        const currentUserId = this.getCurrentUserId()
        if (!currentUserId) {
          throw new Error("No authenticated user")
        }

        // Ensure all transactions have valid IDs, required fields, and userId
        const validTransactions = transactions.map((t) => ({
          ...t,
          id: t.id || this.generateId(),
          userId: (t as any).userId || currentUserId,
          createdAt: t.createdAt || new Date().toISOString(),
          updatedAt: t.updatedAt || new Date().toISOString(),
        })) as TransactionWithUserId[]

        // Save to unified storage
        migrationService.saveUserData(UNIFIED_STORAGE_KEYS.transactions, currentUserId, validTransactions)

        console.log(
          `[PersistenceService] Persisted ${validTransactions.length} transactions to unified storage for user ${currentUserId}`,
        )
      } catch (error) {
        console.log(`[PersistenceService] ERROR: Failed to save to unified storage:`, error)
        throw error
      }
    } else {
      // Future API implementation
      await fetch(`${this.config.apiBaseUrl}/transactions`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(transactions),
      })
    }
  }

  async create(data: Omit<Transaction, "id" | "createdAt" | "updatedAt">): Promise<Transaction> {
    const currentUserId = this.getCurrentUserId()
    if (!currentUserId) {
      throw new Error("User not authenticated")
    }

    const transactions = await this.loadFromStorage()
    const now = new Date().toISOString()

    const newTransaction: TransactionWithUserId = {
      ...data,
      id: this.generateId(),
      userId: currentUserId,
      createdAt: now,
      updatedAt: now,
    } as TransactionWithUserId

    const updatedTransactions = [...transactions, newTransaction as Transaction]
    await this.saveToStorage(updatedTransactions)

    console.log(`[PersistenceService] Transaction created: ${newTransaction.id} for user: ${currentUserId}`)
    return newTransaction as Transaction
  }

  async read(): Promise<Transaction[]> {
    return await this.loadFromStorage()
  }

  async update(id: string, data: Partial<Transaction>): Promise<Transaction> {
    if (!id || id === "undefined") {
      console.log(`[PersistenceService] ERROR: persistence update failed for transaction ${id}`)
      throw new Error("Invalid transaction ID")
    }

    const currentUserId = this.getCurrentUserId()
    if (!currentUserId) {
      throw new Error("User not authenticated")
    }

    // Prevent concurrent updates to the same transaction
    if (this.updateLocks.has(id)) {
      throw new Error(`Transaction ${id} is currently being updated`)
    }

    this.updateLocks.add(id)

    try {
      const transactions = await this.loadFromStorage()
      const index = transactions.findIndex((t) => t.id === id)

      if (index === -1) {
        console.log(`[PersistenceService] ERROR: persistence update failed for transaction ${id} - not found`)
        throw new Error("Transaction not found")
      }

      const existingTransaction = transactions[index]

      // Verify user owns this transaction
      if ((existingTransaction as any).userId && (existingTransaction as any).userId !== currentUserId) {
        console.log(
          `[PersistenceService] ERROR: user ${currentUserId} attempted to update transaction ${id} owned by ${(existingTransaction as any).userId}`,
        )
        throw new Error("Access denied: transaction belongs to another user")
      }

      const updatedTransaction: Transaction = {
        ...existingTransaction,
        ...data,
        // Always preserve immutable fields
        id: existingTransaction.id,
        createdAt: existingTransaction.createdAt,
        // Update timestamp
        updatedAt: new Date().toISOString(),
      }

      // Ensure userId is preserved
      ;(updatedTransaction as any).userId = (existingTransaction as any).userId || currentUserId

      if (!updatedTransaction.id || !updatedTransaction.createdAt) {
        console.log(
          `[PersistenceService] ERROR: persistence update failed for transaction ${id} - missing required fields`,
        )
        throw new Error("Transaction data corruption detected")
      }

      transactions[index] = updatedTransaction
      await this.saveToStorage(transactions)

      console.log(`[PersistenceService] Transaction ${id} updated successfully for user: ${currentUserId}`)
      return updatedTransaction
    } finally {
      this.updateLocks.delete(id)
    }
  }

  async delete(id: string): Promise<void> {
    const currentUserId = this.getCurrentUserId()
    if (!currentUserId) {
      throw new Error("User not authenticated")
    }

    const transactions = await this.loadFromStorage()
    const transactionToDelete = transactions.find((t) => t.id === id)

    if (!transactionToDelete) {
      throw new Error("Transaction not found")
    }

    // Verify user owns this transaction
    if ((transactionToDelete as any).userId && (transactionToDelete as any).userId !== currentUserId) {
      console.log(
        `[PersistenceService] ERROR: user ${currentUserId} attempted to delete transaction ${id} owned by ${(transactionToDelete as any).userId}`,
      )
      throw new Error("Access denied: transaction belongs to another user")
    }

    const filteredTransactions = transactions.filter((t) => t.id !== id)
    await this.saveToStorage(filteredTransactions)

    console.log(`[PersistenceService] Transaction deleted: ${id} for user: ${currentUserId}`)
  }

  async findById(id: string): Promise<Transaction | null> {
    const currentUserId = this.getCurrentUserId()
    if (!currentUserId) {
      return null
    }

    const transactions = await this.loadFromStorage()
    const transaction = transactions.find((t) => t.id === id)

    // Verify user owns this transaction
    if (transaction && (transaction as any).userId && (transaction as any).userId !== currentUserId) {
      console.log(
        `[PersistenceService] ERROR: user ${currentUserId} attempted to access transaction ${id} owned by ${(transaction as any).userId}`,
      )
      return null
    }

    return transaction || null
  }

  // Bulk operations for better performance
  async createBulk(transactions: Omit<Transaction, "id" | "createdAt" | "updatedAt">[]): Promise<Transaction[]> {
    const currentUserId = this.getCurrentUserId()
    if (!currentUserId) {
      throw new Error("User not authenticated")
    }

    const existingTransactions = await this.loadFromStorage()
    const now = new Date().toISOString()

    const newTransactions: TransactionWithUserId[] = transactions.map((data) => ({
      ...data,
      id: this.generateId(),
      userId: currentUserId,
      createdAt: now,
      updatedAt: now,
    })) as TransactionWithUserId[]

    const updatedTransactions = [...existingTransactions, ...(newTransactions as Transaction[])]
    await this.saveToStorage(updatedTransactions)

    console.log(`[PersistenceService] Bulk created ${newTransactions.length} transactions for user: ${currentUserId}`)
    return newTransactions as Transaction[]
  }

  // Get transaction statistics for current user
  async getStats(): Promise<{
    total: number
    thisMonth: number
    thisYear: number
    categories: Record<string, number>
  }> {
    const transactions = await this.loadFromStorage()
    const now = new Date()
    const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
    const thisYear = String(now.getFullYear())

    const stats = {
      total: transactions.length,
      thisMonth: transactions.filter((t) => t.date.startsWith(thisMonth)).length,
      thisYear: transactions.filter((t) => t.date.startsWith(thisYear)).length,
      categories: transactions.reduce(
        (acc, t) => {
          const categoryId = t.category_id || "uncategorized"
          acc[categoryId] = (acc[categoryId] || 0) + 1
          return acc
        },
        {} as Record<string, number>,
      ),
    }

    return stats
  }

  // Clean up old transactions (for maintenance)
  async cleanupOldTransactions(daysToKeep = 365): Promise<number> {
    const currentUserId = this.getCurrentUserId()
    if (!currentUserId) {
      throw new Error("User not authenticated")
    }

    const transactions = await this.loadFromStorage()
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)

    const filteredTransactions = transactions.filter((t) => new Date(t.date) >= cutoffDate)
    const removedCount = transactions.length - filteredTransactions.length

    if (removedCount > 0) {
      await this.saveToStorage(filteredTransactions)
      console.log(`[PersistenceService] Cleaned up ${removedCount} old transactions for user: ${currentUserId}`)
    }

    return removedCount
  }
}

// Create singleton instance with unified storage key
export const transactionPersistence = new PersistenceService({
  useMock: process.env.NEXT_PUBLIC_USE_API !== "true",
  storageKey: UNIFIED_STORAGE_KEYS.transactions, // using unified storage key
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE,
})
