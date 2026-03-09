"use client"

import useSWR from "swr"
import { api } from "@/lib/client/api"
import type { BudgetAllocation, BudgetAllocationFormData } from "@/lib/shared/types"

// E3 convergence rule: this is the primary budget hook for active product flows.
export function useBudgetAllocations(month?: string) {
  const endpoint = month ? `/budget-allocations?month=${month}` : "/budget-allocations"
  const { data, error, mutate } = useSWR<BudgetAllocation[]>(endpoint, api.get)

  const createBudgetAllocation = async (data: BudgetAllocationFormData) => {
    // Calculate available_amount and spent_amount
    const allocationData = {
      ...data,
      spent_amount: 0, // Will be calculated from transactions
      available_amount: data.funded_amount, // Initially equals funded amount
    }
    const result = await api.post("/budget-allocations", allocationData)
    mutate()
    return result
  }

  const updateBudgetAllocation = async (id: string, data: Partial<BudgetAllocation>) => {
    const result = await api.put(`/budget-allocations/${id}`, data)
    mutate()
    return result
  }

  const deleteBudgetAllocation = async (id: string) => {
    await api.delete(`/budget-allocations/${id}`)
    mutate()
  }

  const addFunds = async (id: string, amount: number) => {
    const allocations = data || []
    const allocation = allocations.find((a) => a.id === id)
    if (!allocation) throw new Error("Budget allocation not found")

    const updatedAllocation = {
      ...allocation,
      funded_amount: allocation.funded_amount + amount,
      available_amount: allocation.funded_amount + amount - allocation.spent_amount,
    }

    return updateBudgetAllocation(id, updatedAllocation)
  }

  const transferFunds = async (fromId: string, toId: string, amount: number) => {
    const allocations = data || []
    const fromAllocation = allocations.find((a) => a.id === fromId)
    const toAllocation = allocations.find((a) => a.id === toId)

    if (!fromAllocation || !toAllocation) {
      throw new Error("Budget allocation not found")
    }

    if (fromAllocation.available_amount < amount) {
      throw new Error("Insufficient funds")
    }

    // Update both allocations
    await Promise.all([
      updateBudgetAllocation(fromId, {
        funded_amount: fromAllocation.funded_amount - amount,
        available_amount: fromAllocation.available_amount - amount,
      }),
      updateBudgetAllocation(toId, {
        funded_amount: toAllocation.funded_amount + amount,
        available_amount: toAllocation.available_amount + amount,
      }),
    ])
  }

  return {
    budgetAllocations: data || [],
    isLoading: !error && !data,
    error,
    createBudgetAllocation,
    updateBudgetAllocation,
    deleteBudgetAllocation,
    addFunds,
    transferFunds,
    mutate,
  }
}
