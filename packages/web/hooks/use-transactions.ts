"use client"

import useSWR from "swr"
import { api } from "@/lib/client/api"
import type { Transaction, TransactionFormData, DayOfWeek, Category, CategoryGroup } from "@/lib/shared/types"

interface TransactionsParams {
  categoryId?: string
  month?: string
  date_from?: string
  date_to?: string
  pageSize?: number
}

export function useTransactions(params: TransactionsParams = {}, onDataChange?: () => void) {
  const queryString = new URLSearchParams(
    Object.entries(params).reduce(
      (acc, [key, value]) => {
        if (value !== undefined && value !== "") {
          acc[key] = String(value)
        }
        return acc
      },
      {} as Record<string, string>,
    ),
  ).toString()

  const endpoint = `/transactions${queryString ? `?${queryString}` : ""}`
  const { data, error, mutate } = useSWR<Transaction[]>(endpoint, api.get)

  const generateRecurringDates = (
    baseDate: string,
    recurrence: NonNullable<TransactionFormData["recurrence"]>,
  ): string[] => {
    if (!recurrence.enabled) return []

    const dates: string[] = []
    const startDate = new Date(baseDate)

    if (isNaN(startDate.getTime())) {
      console.error("[v0] Invalid base date for recurring generation:", baseDate)
      return []
    }

    const maxOccurrences = Math.min(recurrence.count || 30, 99)
    const endDateTime = recurrence.endDate ? new Date(recurrence.endDate) : null
    let currentDate = new Date(startDate)
    let generatedCount = 0

    for (let i = 1; i <= maxOccurrences && generatedCount < maxOccurrences; i++) {
      // Calculate next occurrence based on frequency
      switch (recurrence.frequency) {
        case "daily":
          if (recurrence.daysOfWeek && recurrence.daysOfWeek.length > 0) {
            // Find next valid day of week
            const dayMap: Record<DayOfWeek, number> = {
              sunday: 0,
              monday: 1,
              tuesday: 2,
              wednesday: 3,
              thursday: 4,
              friday: 5,
              saturday: 6,
            }
            const targetDays = recurrence.daysOfWeek.map((day) => dayMap[day]).sort()

            let daysToAdd = 1
            let foundNext = false

            while (!foundNext && daysToAdd <= 7 * recurrence.interval) {
              const checkDate = new Date(currentDate)
              checkDate.setDate(checkDate.getDate() + daysToAdd)

              if (targetDays.includes(checkDate.getDay())) {
                currentDate = checkDate
                foundNext = true
              } else {
                daysToAdd++
              }
            }

            if (!foundNext) {
              currentDate.setDate(currentDate.getDate() + recurrence.interval)
            }
          } else {
            currentDate.setDate(currentDate.getDate() + recurrence.interval)
          }
          break

        case "weekly":
          if (recurrence.daysOfWeek && recurrence.daysOfWeek.length > 0) {
            // Handle multiple days of week for weekly recurrence
            const dayMap: Record<DayOfWeek, number> = {
              sunday: 0,
              monday: 1,
              tuesday: 2,
              wednesday: 3,
              thursday: 4,
              friday: 5,
              saturday: 6,
            }
            const targetDays = recurrence.daysOfWeek.map((day) => dayMap[day]).sort()

            // For weekly with multiple days, generate all days in the current week first
            for (const targetDay of targetDays) {
              const weekStart = new Date(currentDate)
              weekStart.setDate(weekStart.getDate() - weekStart.getDay()) // Start of week
              const targetDate = new Date(weekStart)
              targetDate.setDate(weekStart.getDate() + targetDay)

              // Only add if it's after the current date and within limits
              if (targetDate > currentDate && generatedCount < maxOccurrences) {
                if (!endDateTime || targetDate <= endDateTime) {
                  const targetIsoDate = targetDate.toISOString().split("T")[0]
                  if (targetIsoDate) {
                    dates.push(targetIsoDate)
                  }
                  generatedCount++
                }
              }
            }

            // Move to next week interval
            currentDate.setDate(currentDate.getDate() + 7 * recurrence.interval)
            continue // Skip the normal date addition at the end
          } else {
            currentDate.setDate(currentDate.getDate() + 7 * recurrence.interval)
          }
          break

        case "monthly":
          if (recurrence.weekOfMonth && recurrence.daysOfWeek?.[0]) {
            // Monthly by week position (e.g., "first Monday")
            const dayMap: Record<DayOfWeek, number> = {
              sunday: 0,
              monday: 1,
              tuesday: 2,
              wednesday: 3,
              thursday: 4,
              friday: 5,
              saturday: 6,
            }
            const targetDay = dayMap[recurrence.daysOfWeek[0]]

            currentDate.setMonth(currentDate.getMonth() + recurrence.interval)
            currentDate.setDate(1) // Start of month

            // Find the target day occurrence
            while (currentDate.getDay() !== targetDay) {
              currentDate.setDate(currentDate.getDate() + 1)
            }

            // Adjust for week position
            const weekOffset =
              {
                first: 0,
                second: 7,
                third: 14,
                fourth: 21,
                last: -7,
              }[recurrence.weekOfMonth] || 0

            if (recurrence.weekOfMonth === "last") {
              // Find last occurrence of the day in the month
              const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
              currentDate = new Date(lastDay)
              while (currentDate.getDay() !== targetDay) {
                currentDate.setDate(currentDate.getDate() - 1)
              }
            } else {
              currentDate.setDate(currentDate.getDate() + weekOffset)
            }
          } else {
            // Monthly by day of month
            const targetDay = recurrence.dayOfMonth || startDate.getDate()
            currentDate.setMonth(currentDate.getMonth() + recurrence.interval)

            // Handle months with fewer days
            const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
            currentDate.setDate(Math.min(targetDay, lastDayOfMonth))
          }
          break

        case "yearly":
          currentDate.setFullYear(currentDate.getFullYear() + recurrence.interval)

          // Handle leap year edge cases
          if (recurrence.monthOfYear) {
            currentDate.setMonth(recurrence.monthOfYear - 1)
          }
          if (recurrence.dayOfMonth) {
            const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
            currentDate.setDate(Math.min(recurrence.dayOfMonth, lastDayOfMonth))
          }
          break
      }

      // Validate the generated date
      if (isNaN(currentDate.getTime())) {
        console.error("[v0] Invalid date generated during recurrence:", currentDate)
        break
      }

      // Check end date constraint
      if (endDateTime && currentDate > endDateTime) {
        break
      }

      // Add the date if we haven't reached the count limit
      if (generatedCount < maxOccurrences) {
        const currentIsoDate = currentDate.toISOString().split("T")[0]
        if (currentIsoDate) {
          dates.push(currentIsoDate)
        }
        generatedCount++
      }
    }

    console.log(`[v0] Generated ${dates.length} recurring dates for ${recurrence.frequency} recurrence`)
    return dates
  }

  const createRecurringTransactions = async (baseTransaction: TransactionFormData, baseId: string) => {
    if (!baseTransaction.recurrence?.enabled) return []

    try {
      const recurringDates = generateRecurringDates(baseTransaction.date, baseTransaction.recurrence)
      const createdTransactions: Transaction[] = []

      for (let i = 0; i < recurringDates.length; i++) {
        const date = recurringDates[i]
        if (!date) {
          continue
        }
        const recurringId = `${baseId}-r${i + 1}`

        const recurringTransaction: TransactionFormData = {
          ...baseTransaction,
          date,
          recurrence: {
            ...baseTransaction.recurrence,
            generatedFrom: baseId,
            enabled: false, // Generated transactions are not themselves recurring
          },
        }

        try {
          const result = await api.post<Transaction>("/transactions", {
            ...recurringTransaction,
            recurrenceId: recurringId,
          })
          createdTransactions.push(result)
        } catch (error) {
          console.error(`[v0] Error creating recurring transaction for date ${date}:`, error)
          // Continue with other dates even if one fails
        }
      }

      console.log(
        `[v0] Successfully created ${createdTransactions.length}/${recurringDates.length} recurring transactions`,
      )
      return createdTransactions
    } catch (error) {
      console.error("[v0] Error in createRecurringTransactions:", error)
      return []
    }
  }

  const handleRecurrenceEdit = async (
    id: string,
    data: Partial<Transaction>,
    applyMode: "single" | "future" | "all",
  ) => {
    const allTransactions = (await api.get("/transactions")) as Transaction[]
    const transaction = allTransactions.find((t) => t.id === id)

    if (!transaction) {
      console.error(`[v0] Transaction ${id} not found`)
      throw new Error(`Transaction ${id} not found`)
    }

    if (applyMode === "single") {
      // Update only this transaction, remove it from recurrence chain if needed
      const updateData = { ...data }
      if (data.recurrence && !data.recurrence.enabled && transaction.recurrence) {
        updateData.recurrence = {
          ...transaction.recurrence,
          enabled: false,
          generatedFrom: undefined,
        }
      }
      return await api.put<Transaction>(`/transactions/${id}`, updateData)
    }

    const parentId = transaction.recurrence?.generatedFrom || transaction.id

    const recurringTransactions = allTransactions.filter(
      (t) => t.id === parentId || t.recurrence?.generatedFrom === parentId,
    )

    if (recurringTransactions.length === 0) {
      return await api.put(`/transactions/${id}`, data)
    }

    if (applyMode === "all") {
      console.log(
        `[v0] Recurrence update: applying changes to all ${recurringTransactions.length} transactions in series`,
      )

      const fieldsToPropagate: Partial<Transaction> = {}

      if (data.status !== undefined) fieldsToPropagate.status = data.status
      if (data.amount !== undefined) fieldsToPropagate.amount = data.amount
      if (data.description !== undefined) fieldsToPropagate.description = data.description
      if (data.notes !== undefined) fieldsToPropagate.notes = data.notes
      if (data.categoryId !== undefined) fieldsToPropagate.categoryId = data.categoryId
      if (data.contactId !== undefined) fieldsToPropagate.contactId = data.contactId

      const updatePromises = recurringTransactions.map((t) => {
        const updateData = {
          ...t, // Start with the complete existing transaction
          ...fieldsToPropagate, // Apply only the changed fields
          // Ensure we preserve the ID and recurrence structure
          id: t.id,
          recurrence: t.recurrence,
        }

        return api.put(`/transactions/${t.id}`, updateData)
      })

      const results = await Promise.all(updatePromises)
      console.log(`[v0] Recurrence update: updated ${recurringTransactions.length} transactions (applyMode=all)`)
      return results
    }

    if (applyMode === "future") {
      // Update this transaction and all future ones
      const currentTransactionDate = new Date(transaction.date)
      const futureTransactions = recurringTransactions.filter((t) => new Date(t.date) >= currentTransactionDate)

      const fieldsToPropagate: Partial<Transaction> = {}

      if (data.status !== undefined) fieldsToPropagate.status = data.status
      if (data.amount !== undefined) fieldsToPropagate.amount = data.amount
      if (data.description !== undefined) fieldsToPropagate.description = data.description
      if (data.notes !== undefined) fieldsToPropagate.notes = data.notes
      if (data.categoryId !== undefined) fieldsToPropagate.categoryId = data.categoryId
      if (data.contactId !== undefined) fieldsToPropagate.contactId = data.contactId

      const updatePromises = futureTransactions.map((t) => {
        const updateData = {
          ...t, // Start with the complete existing transaction
          ...fieldsToPropagate, // Apply only the changed fields
          // Ensure we preserve the ID and recurrence structure
          id: t.id,
          recurrence: t.recurrence,
        }

        return api.put(`/transactions/${t.id}`, updateData)
      })

      const results = await Promise.all(updatePromises)
      console.log(`[v0] Recurrence update: updated ${futureTransactions.length} future transactions`)
      mutate()
      onDataChange?.()
      return results
    }
  }

  const deleteRecurrence = async (
    transaction: Transaction,
    applyMode: "thisEvent" | "followingEvents" | "allEvents",
  ) => {
    if (!transaction) {
      console.error(`[v0] ERROR: transação atual não fornecida`)
      throw new Error(`Transação atual não fornecida`)
    }

    if (!transaction.date || typeof transaction.date !== "string") {
      console.error(`[v0] ERROR: transação atual sem campo date válido: ${transaction.date}`)
      throw new Error(`Transação atual sem campo date válido`)
    }

    if (!transaction.id) {
      console.error(`[v0] ERROR: transação atual sem campo id válido`)
      throw new Error(`Transação atual sem campo id válido`)
    }

    const currentTransactionDate = new Date(transaction.date)
    if (isNaN(currentTransactionDate.getTime())) {
      console.error(`[v0] ERROR: formato de data inválido na transação atual: ${transaction.date}`)
      throw new Error(`Formato de data inválido na transação atual`)
    }

    const allTransactions = (await api.get("/transactions")) as Transaction[]
    const parentId = transaction.recurrence?.generatedFrom || transaction.id
    const recurringTransactions = allTransactions.filter(
      (t) => t.id === parentId || t.recurrence?.generatedFrom === parentId,
    )

    console.log(`[v0] Recurrence deletion: ${applyMode} mode, found ${recurringTransactions.length} transactions`)

    if (applyMode === "thisEvent") {
      await api.delete(`/transactions/${transaction.id}`)
      console.log(`[v0] Transaction deleted: ${transaction.id}`)

      await cleanupRecurrenceAfterDeletion(parentId, allTransactions)

      mutate()
      onDataChange?.()
      return
    }

    if (applyMode === "followingEvents") {
      const transactionsToDelete = recurringTransactions.filter((t) => {
        const tDate = new Date(t.date)
        const isValidDate = !isNaN(tDate.getTime())
        const isCurrentOrFuture = tDate >= currentTransactionDate // Include current and future

        return isValidDate && isCurrentOrFuture
      })

      const deletePromises = transactionsToDelete.map(async (t) => {
        return await api.delete(`/transactions/${t.id}`)
      })

      await Promise.all(deletePromises)
      console.log(`[v0] Recurrence deletion: removed ${transactionsToDelete.length} current and future transactions`)

      await cleanupRecurrenceAfterDeletion(parentId, allTransactions)

      mutate()
      onDataChange?.()
      return
    }

    if (applyMode === "allEvents") {
      const deletePromises = recurringTransactions.map(async (t) => {
        return await api.delete(`/transactions/${t.id}`)
      })

      await Promise.all(deletePromises)
      console.log(`[v0] Recurrence deletion: entire series ${parentId} deleted`)
      mutate()
      onDataChange?.()
      return
    }
  }

  const cleanupRecurrenceAfterDeletion = async (parentId: string, _allTransactions: Transaction[]) => {
    // Get updated list of transactions after deletion
    const updatedTransactions = (await api.get("/transactions")) as Transaction[]

    // Find remaining transactions in the series
    const remainingTransactions = updatedTransactions.filter(
      (t) => t.id === parentId || t.recurrence?.generatedFrom === parentId,
    )

    if (remainingTransactions.length === 1) {
      // Only one record remains, remove recurrence link
      const lastTransaction = remainingTransactions[0]
      if (!lastTransaction?.recurrence) {
        return
      }

      const updateData = {
        ...lastTransaction,
        recurrence: {
          ...lastTransaction.recurrence,
          enabled: false,
          generatedFrom: undefined,
        },
      }

      await api.put<Transaction>(`/transactions/${lastTransaction.id}`, updateData)
      console.log(`[v0] Recurrence cleanup: removed recurrence from last remaining transaction ${lastTransaction.id}`)
    }
  }

  const resolveAreaIdFromCategory = async (
    categoryId: string,
  ): Promise<{ areaId: string; categoryGroupId: string } | null> => {
    if (!categoryId) {
      console.error("[v0] ERROR: transaction save blocked, missing categoryId")
      return null
    }

    try {
      // Get all categories and category groups
      const categories = (await api.get("/categories")) as Category[]
      const categoryGroups = (await api.get("/category-groups")) as CategoryGroup[]

      // Find the category
      const category = categories.find((c) => c.id === categoryId)
      if (!category) {
        console.error(`[v0] ERROR: category not found for categoryId=${categoryId}`)
        return null
      }

      // Find the category group
      const categoryGroup = categoryGroups.find((cg) => cg.id === category.categoryGroupId)
      if (!categoryGroup) {
        console.error(`[v0] ERROR: category group not found for categoryGroupId=${category.categoryGroupId}`)
        return null
      }

      // Validate that we have a valid areaId
      if (!categoryGroup.areaId) {
        console.error(`[v0] ERROR: category group ${categoryGroup.id} has no areaId`)
        return null
      }

      return {
        areaId: categoryGroup.areaId,
        categoryGroupId: categoryGroup.id,
      }
    } catch (error) {
      console.error("[v0] ERROR: failed to resolve areaId from category hierarchy:", error)
      return null
    }
  }

  const createTransaction = async (data: TransactionFormData) => {
    // Validate categoryId is present
    if (!data.categoryId) {
      console.error("[v0] ERROR: transaction save blocked, missing categoryId")
      throw new Error("Selecione uma categoria válida antes de salvar.")
    }

    // Resolve areaId and categoryGroupId from categoryId
    const hierarchyData = await resolveAreaIdFromCategory(data.categoryId)
    if (!hierarchyData) {
      throw new Error("Selecione uma categoria válida antes de salvar.")
    }

    // Create transaction data with resolved hierarchy
    const transactionData: TransactionFormData & { areaId: string; categoryGroupId: string } = {
      ...data,
      areaId: hierarchyData.areaId,
      categoryGroupId: hierarchyData.categoryGroupId,
    }

    const result = await api.post<Transaction>("/transactions", transactionData)
    console.log(`[v0] Transaction created: ${result.id} (${result.type}, R$ ${result.amount})`)

    if (data.recurrence?.enabled && !data.recurrence?.generatedFrom) {
      await createRecurringTransactions(transactionData, result.id)
    }

    mutate()
    return result
  }

  const updateTransaction = async (id: string, data: Partial<Transaction>) => {
    if (!data || typeof data !== "object") {
      console.error("[v0] Invalid data passed to updateTransaction:", data)
      throw new Error("Invalid transaction data")
    }

    if (!id || id === "undefined") {
      console.error("[v0] Invalid transaction ID:", id)
      throw new Error("Invalid transaction ID")
    }

    let currentTransaction: Transaction
    try {
      const allTransactions = (await api.get("/transactions")) as Transaction[]
      const foundTransaction = allTransactions.find((t) => t.id === id)

      if (!foundTransaction) {
        console.error("[v0] ERROR: Transaction not found:", id)
        throw new Error("Transaction not found")
      }

      currentTransaction = foundTransaction
    } catch (error) {
      console.error("[v0] ERROR: persistence update failed for transaction", id)
      throw new Error("Transaction not found")
    }

    if (!currentTransaction.id || !currentTransaction.createdAt) {
      console.error("[v0] Current transaction is missing required fields:", {
        id: currentTransaction.id,
        createdAt: currentTransaction.createdAt,
        hasId: !!currentTransaction.id,
        hasCreatedAt: !!currentTransaction.createdAt,
      })
      throw new Error("Transaction data corruption detected")
    }

    let resolvedHierarchy: { areaId: string; categoryGroupId: string } | null = null
    if (data.categoryId && data.categoryId !== currentTransaction.categoryId) {
      resolvedHierarchy = await resolveAreaIdFromCategory(data.categoryId)
      if (!resolvedHierarchy) {
        throw new Error("Selecione uma categoria válida antes de salvar.")
      }
    }

    const hasParentIdInData = data.recurrence?.generatedFrom
    const hasParentIdInCurrent = currentTransaction.recurrence?.generatedFrom
    const hasRecurrenceEnabled = data.recurrence?.enabled || currentTransaction.recurrence?.enabled
    const isRecurring = hasParentIdInData || hasParentIdInCurrent || hasRecurrenceEnabled

    const isCreatingNewRecurrence = data.recurrence?.enabled && !hasParentIdInCurrent && !hasParentIdInData
    const hasApplyMode = data.recurrence?.applyMode || (data as any).applyMode
    const isUpdatingExistingRecurrence = isRecurring && hasApplyMode

    if (isCreatingNewRecurrence) {
      console.log("[v0] Transaction update: creating new recurrence series")

      const updateData = {
        id: currentTransaction.id,
        date: data.date ?? currentTransaction.date,
        amount: data.amount ?? currentTransaction.amount,
        description: data.description ?? currentTransaction.description,
        categoryId: data.categoryId ?? currentTransaction.categoryId,
        contactId: data.contactId ?? currentTransaction.contactId,
        type: data.type ?? currentTransaction.type,
        status: data.status ?? currentTransaction.status,
        notes: data.notes ?? currentTransaction.notes,
        areaId: resolvedHierarchy?.areaId ?? data.areaId ?? currentTransaction.areaId,
        categoryGroupId:
          resolvedHierarchy?.categoryGroupId ?? data.categoryGroupId ?? currentTransaction.categoryGroupId,
        createdAt: currentTransaction.createdAt,
        updatedAt: new Date().toISOString(),
        recurrence: data.recurrence,
      }

      const result = await api.put(`/transactions/${id}`, updateData)

      if (data.recurrence?.enabled && !data.recurrence.generatedFrom) {
        await createRecurringTransactions(data as TransactionFormData, id)
      }

      mutate((currentData) => {
        if (!currentData) return currentData
        return currentData.map((t) => (t.id === id ? { ...updateData, id } : t))
      }, false)

      onDataChange?.()
      return result
    }

    if (isUpdatingExistingRecurrence) {
      const applyMode = (data.recurrence?.applyMode || (data as any).applyMode) as "single" | "future" | "all"

      const updateDataWithHierarchy = resolvedHierarchy
        ? {
            ...data,
            areaId: resolvedHierarchy.areaId,
            categoryGroupId: resolvedHierarchy.categoryGroupId,
          }
        : data

      const result = await handleRecurrenceEdit(id, updateDataWithHierarchy, applyMode)
      mutate()
      onDataChange?.()
      return result
    }

    const updateData = {
      id: currentTransaction.id,
      date: data.date ?? currentTransaction.date,
      amount: data.amount ?? currentTransaction.amount,
      description: data.description ?? currentTransaction.description,
      categoryId: data.categoryId ?? currentTransaction.categoryId,
      contactId: data.contactId ?? currentTransaction.contactId,
      type: data.type ?? currentTransaction.type,
      status: data.status ?? currentTransaction.status,
      notes: data.notes ?? currentTransaction.notes,
      areaId: resolvedHierarchy?.areaId ?? data.areaId ?? currentTransaction.areaId,
      categoryGroupId: resolvedHierarchy?.categoryGroupId ?? data.categoryGroupId ?? currentTransaction.categoryGroupId,
      recurrence: data.recurrence ?? currentTransaction.recurrence,
      createdAt: currentTransaction.createdAt,
      updatedAt: new Date().toISOString(),
    }

    const result = await api.put<Transaction>(`/transactions/${id}`, updateData)
    console.log(`[v0] Transaction updated: ${id}`)

    mutate((currentData) => {
      if (!currentData) return currentData
      return currentData.map((t) => {
        if (t.id === id) {
          // Ensure the updated transaction maintains all required fields
          return {
            ...t,
            ...result,
            id: t.id, // Always preserve the original ID
            createdAt: t.createdAt, // Always preserve the original createdAt
          }
        }
        return t
      })
    }, false)

    onDataChange?.()
    return result
  }

  const deleteTransaction = async (id: string, options?: { applyMode?: "single" | "future" | "all" }) => {
    if (options?.applyMode) {
      await handleRecurrenceDelete(id, options.applyMode)
    } else {
      await api.delete(`/transactions/${id}`)
    }

    mutate()
  }

  const handleRecurrenceDelete = async (id: string, applyMode: "single" | "future" | "all") => {
    const transaction = (await api.get(`/transactions/${id}`)) as Transaction
    const allTransactions = (await api.get("/transactions")) as Transaction[]

    if (applyMode === "single") {
      // Delete only this transaction
      return await api.delete(`/transactions/${id}`)
    }

    const parentId = transaction.generatedFrom || transaction.recurrence?.generatedFrom || id
    const recurringTransactions = allTransactions.filter(
      (t) => t.id === parentId || t.generatedFrom === parentId || t.recurrence?.generatedFrom === parentId,
    )

    if (applyMode === "all") {
      // Delete all transactions in the recurrence chain
      const deletePromises = recurringTransactions.map((t) => api.delete(`/transactions/${t.id}`))
      const results = await Promise.all(deletePromises)
      console.log(`[v0] Recurrence deletion: deleted entire series (${recurringTransactions.length} transactions)`)
      return results
    }

    if (applyMode === "future") {
      // Delete this transaction and all future ones
      const currentTransactionDate = new Date(transaction.date)
      const transactionsToDelete = recurringTransactions.filter((t) => new Date(t.date) > currentTransactionDate)

      const deletePromises = transactionsToDelete.map(async (t) => {
        return await api.delete(`/transactions/${t.id}`)
      })

      const results = await Promise.all(deletePromises)
      console.log(`[v0] Recurrence deletion: deleted ${transactionsToDelete.length} future transactions`)
      mutate()
      onDataChange?.()
      return results
    }
  }

  // Helper function to get spent amount for a category in a specific month
  const getSpentByCategory = (categoryId: string, month: string): number => {
    if (!data) return 0

    return data
      .filter((t) => t.categoryId === categoryId && t.date.startsWith(month))
      .reduce((sum, t) => sum + t.amount, 0)
  }

  // Helper function to get all transactions for a specific month
  const getTransactionsByMonth = (month: string): Transaction[] => {
    if (!data) return []
    return data.filter((t) => t.date.startsWith(month))
  }

  // Helper function to get parent transaction for recurring context
  const getParentTransaction = async (transaction: Transaction): Promise<Transaction> => {
    if (transaction.recurrence?.generatedFrom) {
      // This is a generated transaction, get the parent
      try {
        return (await api.get(`/transactions/${transaction.recurrence.generatedFrom}`)) as Transaction
      } catch (error) {
        console.error("[v0] Error fetching parent transaction:", error)
        return transaction
      }
    }
    return transaction
  }

  return {
    transactions: data || [],
    isLoading: !error && !data,
    error,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    deleteRecurrence, // Export deleteRecurrence function
    getSpentByCategory,
    getTransactionsByMonth,
    getParentTransaction, // Export helper function for getting parent transaction
    mutate,
  }
}
