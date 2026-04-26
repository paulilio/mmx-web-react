"use client"

import useSWR from "swr"
import { api } from "@/lib/client/api"
import type {
  Transaction,
  TransactionFormData,
  Category,
  CategoryGroup,
  RecurringTemplate,
  RecurringSeriesView,
} from "@/lib/shared/types"

interface TransactionsParams {
  categoryId?: string
  month?: string
  date_from?: string
  date_to?: string
  pageSize?: number
}

type ApplyMode = "single" | "future" | "all"
type LegacyDeleteMode = "thisEvent" | "followingEvents" | "allEvents"

function legacyToApplyMode(mode: LegacyDeleteMode): ApplyMode {
  if (mode === "thisEvent") return "single"
  if (mode === "followingEvents") return "future"
  return "all"
}

function freqToBackend(freq: TransactionFormData["recurrence"] extends infer R
  ? R extends { frequency: infer F }
    ? F
    : never
  : never): "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY" {
  return (freq as string).toUpperCase() as "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY"
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

  const resolveAreaIdFromCategory = async (
    categoryId: string,
  ): Promise<{ areaId: string; categoryGroupId: string } | null> => {
    try {
      const categories = (await api.get("/categories")) as Category[]
      const categoryGroups = (await api.get("/category-groups")) as CategoryGroup[]

      const category = categories.find((c) => c.id === categoryId)
      if (!category) return null

      const categoryGroup = categoryGroups.find((cg) => cg.id === category.categoryGroupId)
      if (!categoryGroup || !categoryGroup.areaId) return null

      return { areaId: categoryGroup.areaId, categoryGroupId: categoryGroup.id }
    } catch (err) {
      console.error("[use-transactions] resolveAreaIdFromCategory falhou:", err)
      return null
    }
  }

  const createTransaction = async (data: TransactionFormData) => {
    if (!data.categoryId) {
      throw new Error("Selecione uma categoria válida antes de salvar.")
    }
    const hierarchy = await resolveAreaIdFromCategory(data.categoryId)
    if (!hierarchy) {
      throw new Error("Selecione uma categoria válida antes de salvar.")
    }

    // Caso 1: nova série recorrente — usa POST /transactions/recurring (atômico no backend)
    if (data.recurrence?.enabled && !data.recurrence.generatedFrom) {
      const r = data.recurrence
      const result = (await api.post("/transactions/recurring", {
        template: {
          frequency: freqToBackend(r.frequency),
          interval: r.interval ?? 1,
          daysOfWeek: r.daysOfWeek?.map((d) => d.toUpperCase()) ?? [],
          dayOfMonth: r.dayOfMonth ?? null,
          weekOfMonth: r.weekOfMonth ?? null,
          monthOfYear: r.monthOfYear ?? null,
          monthlyMode: r.monthlyType ?? null,
          count: r.count ?? null,
          startDate: data.date,
          endDate: r.endDate ?? null,
        },
        base: {
          description: data.description,
          amount: data.amount,
          type: data.type,
          categoryId: data.categoryId,
          contactId: data.contactId ?? null,
          status: data.status,
          notes: data.notes ?? null,
          areaId: hierarchy.areaId,
          categoryGroupId: hierarchy.categoryGroupId,
        },
      })) as { template: RecurringTemplate; executions: Transaction[] }

      mutate()
      onDataChange?.()
      return result.executions[0] ?? null
    }

    // Caso 2: transação avulsa — POST /transactions normal
    const payload = {
      ...data,
      areaId: hierarchy.areaId,
      categoryGroupId: hierarchy.categoryGroupId,
    }
    const result = (await api.post("/transactions", payload)) as Transaction
    mutate()
    onDataChange?.()
    return result
  }

  const updateTransaction = async (id: string, data: Partial<Transaction>) => {
    if (!id || id === "undefined") {
      throw new Error("Invalid transaction ID")
    }

    let resolvedHierarchy: { areaId: string; categoryGroupId: string } | null = null
    if (data.categoryId) {
      resolvedHierarchy = await resolveAreaIdFromCategory(data.categoryId)
    }

    const applyMode = (data.recurrence?.applyMode ?? (data as { applyMode?: ApplyMode }).applyMode) as
      | ApplyMode
      | undefined

    // Edição de série: PATCH /transactions/recurring/:templateId (future|all)
    // ou PATCH /transactions/:id/exception (single = exception)
    if (applyMode && (applyMode === "future" || applyMode === "all")) {
      const current = (await api.get(`/transactions/${id}`)) as Transaction
      const templateId = current.templateId
      if (!templateId) {
        throw new Error("Transação não pertence a uma série de recorrência")
      }

      const patch: Record<string, unknown> = {}
      if (data.description !== undefined) patch.description = data.description
      if (data.amount !== undefined) patch.amount = data.amount
      if (data.type !== undefined) patch.type = data.type
      if (data.categoryId !== undefined) patch.categoryId = data.categoryId
      if (data.contactId !== undefined) patch.contactId = data.contactId
      if (data.status !== undefined) patch.status = data.status
      if (data.notes !== undefined) patch.notes = data.notes
      if (resolvedHierarchy) {
        patch.areaId = resolvedHierarchy.areaId
        patch.categoryGroupId = resolvedHierarchy.categoryGroupId
      }

      const body = {
        applyMode,
        fromDate: applyMode === "future" ? current.date : undefined,
        patch,
      }
      const result = await api.patch(`/transactions/recurring/${templateId}`, body)
      mutate()
      onDataChange?.()
      return result
    }

    if (applyMode === "single") {
      // "Editar somente esta" = exception — preserva templateId
      const patch: Record<string, unknown> = {}
      if (data.description !== undefined) patch.description = data.description
      if (data.amount !== undefined) patch.amount = data.amount
      if (data.type !== undefined) patch.type = data.type
      if (data.categoryId !== undefined) patch.categoryId = data.categoryId
      if (data.contactId !== undefined) patch.contactId = data.contactId
      if (data.date !== undefined) patch.date = data.date
      if (data.status !== undefined) patch.status = data.status
      if (data.notes !== undefined) patch.notes = data.notes
      if (resolvedHierarchy) {
        patch.areaId = resolvedHierarchy.areaId
        patch.categoryGroupId = resolvedHierarchy.categoryGroupId
      }
      const result = await api.patch(`/transactions/${id}/exception`, patch)
      mutate()
      onDataChange?.()
      return result
    }

    // Edição comum: PUT /transactions/:id
    const updatePayload: Record<string, unknown> = { ...data }
    if (resolvedHierarchy) {
      updatePayload.areaId = resolvedHierarchy.areaId
      updatePayload.categoryGroupId = resolvedHierarchy.categoryGroupId
    }
    const result = await api.put(`/transactions/${id}`, updatePayload)
    mutate()
    onDataChange?.()
    return result
  }

  const deleteTransaction = async (
    id: string,
    options?: { applyMode?: ApplyMode },
  ) => {
    if (!options?.applyMode) {
      await api.delete(`/transactions/${id}`)
      mutate()
      onDataChange?.()
      return
    }

    // Apaga via endpoint de série
    const current = (await api.get(`/transactions/${id}`)) as Transaction
    const templateId = current.templateId
    if (!templateId) {
      // Se não é série, fallback pro delete simples
      await api.delete(`/transactions/${id}`)
      mutate()
      onDataChange?.()
      return
    }

    const qs = new URLSearchParams({
      applyMode: options.applyMode,
    })
    if (options.applyMode !== "all") qs.set("fromTransactionId", id)
    await api.delete(`/transactions/recurring/${templateId}?${qs.toString()}`)
    mutate()
    onDataChange?.()
  }

  // Wrapper legado: traduz o vocabulário do recurring-delete-modal pro applyMode novo
  const deleteRecurrence = async (
    transaction: Transaction,
    legacyMode: LegacyDeleteMode,
  ) => {
    if (!transaction?.id) throw new Error("Transação inválida")
    const applyMode = legacyToApplyMode(legacyMode)
    return deleteTransaction(transaction.id, { applyMode })
  }

  const skipNextOccurrence = async (transactionId: string) => {
    const result = await api.post(`/transactions/${transactionId}/skip`, {})
    mutate()
    onDataChange?.()
    return result
  }

  const toggleSeriesPause = async (templateId: string, paused: boolean) => {
    const result = await api.patch(`/transactions/recurring/${templateId}/pause`, { paused })
    mutate()
    onDataChange?.()
    return result
  }

  const duplicateTransaction = async (
    transactionId: string,
    overrides?: { date?: string },
  ) => {
    const result = await api.post(`/transactions/${transactionId}/duplicate`, overrides ?? {})
    mutate()
    onDataChange?.()
    return result
  }

  const markAsException = async (transactionId: string, patch: Record<string, unknown>) => {
    const result = await api.patch(`/transactions/${transactionId}/exception`, patch)
    mutate()
    onDataChange?.()
    return result
  }

  const getSeries = async (templateId: string): Promise<RecurringSeriesView> => {
    return (await api.get(`/transactions/recurring/${templateId}`)) as RecurringSeriesView
  }

  // Helpers de leitura — preservam contrato existente
  const getSpentByCategory = (categoryId: string, month: string): number => {
    if (!data) return 0
    return data
      .filter((t) => t.categoryId === categoryId && t.date.startsWith(month))
      .reduce((sum, t) => sum + t.amount, 0)
  }

  const getTransactionsByMonth = (month: string): Transaction[] => {
    if (!data) return []
    return data.filter((t) => t.date.startsWith(month))
  }

  const getParentTransaction = async (transaction: Transaction): Promise<Transaction> => {
    if (transaction.recurrence?.generatedFrom) {
      try {
        return (await api.get(`/transactions/${transaction.recurrence.generatedFrom}`)) as Transaction
      } catch (err) {
        console.error("[use-transactions] getParentTransaction falhou:", err)
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
    deleteRecurrence,
    skipNextOccurrence,
    toggleSeriesPause,
    duplicateTransaction,
    markAsException,
    getSeries,
    getSpentByCategory,
    getTransactionsByMonth,
    getParentTransaction,
    mutate,
  }
}
