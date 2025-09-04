"use client"

import useSWR from "swr"
import { getJSON } from "@/lib/api"
import type { AgingReport, CashflowData } from "@/lib/types"

interface DashboardSummary {
  totalOpen: number
  totalOverdue: number
  totalNext7Days: number
  totalNext30Days: number
  totalReceivables: number
  totalPayables: number
}

export function useDashboardSummary() {
  return useSWR<DashboardSummary>("/reports/summary", getJSON)
}

export function useAgingReport() {
  return useSWR<AgingReport>("/reports/aging", getJSON)
}

export function useCashflowData(days = 30) {
  return useSWR<CashflowData[]>(`/reports/cashflow?days=${days}`, getJSON)
}
