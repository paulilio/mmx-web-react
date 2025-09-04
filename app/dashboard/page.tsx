"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { SummaryCard } from "@/components/dashboard/summary-card"
import { CashflowChart } from "@/components/dashboard/cashflow-chart"
import { useDashboardSummary, useAgingReport } from "@/hooks/use-dashboard-data"
import { DollarSign, AlertTriangle, Clock, Calendar, TrendingUp, TrendingDown } from "lucide-react"
import { Loader2 } from "lucide-react"

export default function DashboardPage() {
  const { data: summary, isLoading: summaryLoading } = useDashboardSummary()
  const { data: aging, isLoading: agingLoading } = useAgingReport()

  if (summaryLoading || agingLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="border-b border-slate-200 pb-4">
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-600 mt-1">Visão geral das suas finanças</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <SummaryCard title="Total em Aberto" value={summary?.totalOpen || 0} icon={DollarSign} />
          <SummaryCard title="Vencidos" value={aging?.overdue || 0} icon={AlertTriangle} variant="danger" />
          <SummaryCard title="Próximos 7 dias" value={aging?.next7Days || 0} icon={Clock} variant="warning" />
          <SummaryCard title="Próximos 30 dias" value={aging?.next30Days || 0} icon={Calendar} />
        </div>

        {/* Additional Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SummaryCard title="Total a Receber" value={summary?.totalReceivables || 0} icon={TrendingUp} />
          <SummaryCard title="Total a Pagar" value={summary?.totalPayables || 0} icon={TrendingDown} />
        </div>

        {/* Cashflow Chart */}
        <div className="mt-8">
          <CashflowChart />
        </div>
      </div>
    </MainLayout>
  )
}
