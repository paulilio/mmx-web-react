import useSWR from "swr"
import type { BudgetSummary, BudgetFormData, FundTransferFormData } from "@/lib/shared/types"
import { api } from "@/lib/client/api"

/**
 * @deprecated Hook legado de compatibilidade.
 * Use `useBudgetAllocations` para novos fluxos de produto.
 */
export function useBudget(month: number, year: number) {
  const { data, error, mutate } = useSWR<BudgetSummary[]>(`/budget/${year}/${month}`, api.get)

  const updateBudget = async (budgetGroupId: string, data: Partial<BudgetFormData>) => {
    const result = await api.put(`/budget/${budgetGroupId}/${year}/${month}`, data)
    mutate()
    return result
  }

  const addFunds = async (budgetGroupId: string, amount: number) => {
    const result = await api.post(`/budget/${budgetGroupId}/${year}/${month}/add-funds`, { amount })
    mutate()
    return result
  }

  const transferFunds = async (data: FundTransferFormData) => {
    const result = await api.post("/budget/transfer-funds", data)
    mutate()
    return result
  }

  const configureRollover = async (budgetGroupId: string, enabled: boolean, amount?: number) => {
    const result = await api.put(`/budget/${budgetGroupId}/${year}/${month}/rollover`, {
      rolloverEnabled: enabled,
      rolloverAmount: amount,
    })
    mutate()
    return result
  }

  return {
    budgetSummaries: data || [],
    isLoading: !error && !data,
    error,
    updateBudget,
    addFunds,
    transferFunds,
    configureRollover,
    mutate,
  }
}
