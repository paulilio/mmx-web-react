"use client"

import useSWR from "swr"
import { getJSON } from "@/lib/client/api"
import type { AgingReport, CashflowData } from "@/lib/shared/types"

interface DashboardSummary {
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

interface ExtendedAgingReport extends AgingReport {
  completedOverdue: number
  completedNext7Days: number
  completedNext30Days: number
  pendingOverdue: number
  pendingNext7Days: number
  pendingNext30Days: number
}

interface ExtendedCashflowData extends CashflowData {
  completedIncome: number
  completedExpense: number
  completedBalance: number
  pendingIncome: number
  pendingExpense: number
  pendingBalance: number
}

export function useDashboardSummary() {
  return useSWR<DashboardSummary>("/reports/summary", getJSON)
}

export function useAgingReport() {
  return useSWR<ExtendedAgingReport>("/reports/aging", getJSON)
}

export function useCashflowData(days = 30, statusFilter?: "all" | "completed" | "pending" | "cancelled") {
  const endpoint =
    statusFilter && statusFilter !== "all"
      ? `/reports/cashflow?days=${days}&status=${statusFilter}`
      : `/reports/cashflow?days=${days}`

  return useSWR<ExtendedCashflowData[]>(endpoint, getJSON)
}

export function useStatusSummary() {
  const { data } = useDashboardSummary()
  return {
    completedReceivables: data?.completedReceivables || 0,
    completedPayables: data?.completedPayables || 0,
    pendingReceivables: data?.pendingReceivables || 0,
    pendingPayables: data?.pendingPayables || 0,
  }
}

export function useCashflowByStatus(days = 30) {
  const completed = useCashflowData(days, "completed")
  const pending = useCashflowData(days, "pending")
  const all = useCashflowData(days, "all")

  return {
    completed: completed.data || [],
    pending: pending.data || [],
    all: all.data || [],
    isLoading: completed.isLoading || pending.isLoading || all.isLoading,
    error: completed.error || pending.error || all.error,
  }
}
