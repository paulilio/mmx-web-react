"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { SummaryCard } from "@/components/dashboard/summary-card"
import { CashflowChart } from "@/components/dashboard/cashflow-chart"
import { WelcomeModal } from "@/components/onboarding/welcome-modal"
import { useDashboardSummary, useAgingReport } from "@/hooks/use-dashboard-data"
import { DollarSign, AlertTriangle, Clock, Calendar, TrendingUp, TrendingDown, Loader2 } from "lucide-react"
import { DEFAULT_RECEIVABLES_TARGET, DEFAULT_PAYABLES_TARGET } from "@/lib/shared/constants"

export default function DashboardPage() {
  const { data: summary, isLoading: summaryLoading } = useDashboardSummary()
  const { data: aging, isLoading: agingLoading } = useAgingReport()

  if (summaryLoading || agingLoading) {
    return (
      <MainLayout>
        <WelcomeModal />
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </MainLayout>
    )
  }

  const receivablesTarget = DEFAULT_RECEIVABLES_TARGET
  const payablesTarget = DEFAULT_PAYABLES_TARGET

  const receivablesCurrent = (() => {
    const value = Number(summary?.totalReceivables)
    return isNaN(value) ? 0 : value
  })()

  const payablesCurrent = (() => {
    const value = Number(summary?.totalPayables)
    return isNaN(value) ? 0 : value
  })()

  const receivablesProgress = (() => {
    const progress = (receivablesCurrent / receivablesTarget) * 100
    return isNaN(progress) ? 0 : Math.min(progress, 100)
  })()

  const payablesProgress = (() => {
    const progress = (payablesCurrent / payablesTarget) * 100
    return isNaN(progress) ? 0 : Math.min(progress, 100)
  })()

  const receivablesRemaining = (() => {
    const remaining = receivablesTarget - receivablesCurrent
    return isNaN(remaining) ? receivablesTarget : Math.max(remaining, 0)
  })()

  const payablesRemaining = (() => {
    const remaining = payablesTarget - payablesCurrent
    return isNaN(remaining) ? payablesTarget : Math.max(remaining, 0)
  })()

  // Mock comparison with previous period (you can replace with real data)
  const receivablesGrowth = 30 // +30%
  const payablesGrowth = 2 // +2%

  const formatCurrency = (value: number | string | null | undefined) => {
    const numericValue = typeof value === "number" ? value : Number.parseFloat(String(value || 0))
    const safeValue = isNaN(numericValue) ? 0 : numericValue

    if (safeValue >= 1000) {
      return `R$ ${(safeValue / 1000).toFixed(1)}k`
    }
    return `R$ ${safeValue.toFixed(0)}`
  }

  return (
    <MainLayout>
      <WelcomeModal />
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="border-b border-slate-200 pb-4">
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-600 mt-1">Visão geral das suas finanças</p>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recebimentos */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-slate-600">Recebimentos</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-slate-900">{formatCurrency(receivablesCurrent)}</span>
                    <span className="text-sm text-slate-500">Outubro do ano anterior</span>
                    <span className="text-sm font-medium text-green-600">↗ {receivablesGrowth}%</span>
                  </div>
                </div>

                {/* Small circular progress */}
                <div className="relative w-12 h-12">
                  <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="2"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#22c55e"
                      strokeWidth="2"
                      strokeDasharray={`${receivablesProgress}, 100`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-medium text-slate-700">{Math.round(receivablesProgress || 0)}%</span>
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Falta {formatCurrency(receivablesRemaining)} para a meta</span>
                  <span className="text-slate-500">meta &gt;{formatCurrency(receivablesTarget)}</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${receivablesProgress || 0}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Despesas */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-slate-600">Despesas</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-slate-900">{formatCurrency(payablesCurrent)}</span>
                    <span className="text-sm text-slate-500">Outubro do ano anterior</span>
                    <span className="text-sm font-medium text-green-600">↗ {payablesGrowth}%</span>
                  </div>
                </div>

                {/* Small circular progress */}
                <div className="relative w-12 h-12">
                  <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="2"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth="2"
                      strokeDasharray={`${payablesProgress}, 100`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-medium text-slate-700">{Math.round(payablesProgress || 0)}%</span>
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Restam {formatCurrency(payablesRemaining)} do limite</span>
                  <span className="text-slate-500">meta &lt;{formatCurrency(payablesTarget)}</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-red-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${payablesProgress || 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
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
