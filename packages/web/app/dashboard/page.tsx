"use client"

import { useMemo } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { SummaryCard } from "@/components/dashboard/summary-card"
import { CashflowChart } from "@/components/dashboard/cashflow-chart"
import { Greeting } from "@/components/dashboard/greeting"
import { MonthCalendar } from "@/components/dashboard/month-calendar"
import { MonthlyResult } from "@/components/dashboard/monthly-result"
import { PendingListCard } from "@/components/dashboard/pending-list-card"
import { WelcomeModal } from "@/components/onboarding/welcome-modal"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { useDashboardSummary, useAgingReport } from "@/hooks/use-dashboard-data"
import { useTransactions } from "@/hooks/use-transactions"
import { useAreas } from "@/hooks/use-areas"
import { useAuth } from "@/hooks/use-auth"
import { DollarSign, Calendar } from "lucide-react"
import { DEFAULT_RECEIVABLES_TARGET, DEFAULT_PAYABLES_TARGET } from "@/lib/shared/constants"

function formatCurrencyShort(value: number | string | null | undefined): string {
  const numericValue = typeof value === "number" ? value : Number.parseFloat(String(value || 0))
  const safeValue = isNaN(numericValue) ? 0 : numericValue

  if (safeValue >= 1000) {
    return `R$ ${(safeValue / 1000).toFixed(1)}k`
  }
  return `R$ ${safeValue.toFixed(0)}`
}

function MetaTrackerSkeleton() {
  return (
    <div className="bg-card rounded-lg border p-4 sm:p-5">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {[0, 1].map((i) => (
          <div key={i} className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-7 w-28" />
              </div>
              <Skeleton className="size-12 rounded-full" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-3 w-40" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function SummaryCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="size-5" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-7 w-32" />
      </CardContent>
    </Card>
  )
}

function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <Skeleton className="h-5 w-48" />
      </CardHeader>
      <CardContent className="pt-0 space-y-2">
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-full" />
        ))}
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  const { data: summary, isLoading: summaryLoading } = useDashboardSummary()
  const { data: aging, isLoading: agingLoading } = useAgingReport()
  const { transactions, isLoading: transactionsLoading } = useTransactions({ pageSize: 500 })
  const { areas } = useAreas()
  const { user } = useAuth()

  const { overdue, upcoming } = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const next7 = new Date(today)
    next7.setDate(today.getDate() + 7)

    const pending = (transactions || []).filter(
      (t) => t.status?.trim().toLowerCase() === "pending",
    )

    const overdueList = pending
      .filter((t) => new Date(t.date) < today)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    const upcomingList = pending
      .filter((t) => {
        const d = new Date(t.date)
        return d >= today && d <= next7
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    return { overdue: overdueList, upcoming: upcomingList }
  }, [transactions])

  const receivablesTarget =
    user?.preferences?.targets?.receivables && user.preferences.targets.receivables > 0
      ? user.preferences.targets.receivables
      : DEFAULT_RECEIVABLES_TARGET
  const payablesTarget =
    user?.preferences?.targets?.payables && user.preferences.targets.payables > 0
      ? user.preferences.targets.payables
      : DEFAULT_PAYABLES_TARGET

  const receivablesCurrent = Number(summary?.totalReceivables) || 0
  const payablesCurrent = Number(summary?.totalPayables) || 0
  const receivablesProgress = Math.min(((receivablesCurrent / receivablesTarget) * 100) || 0, 100)
  const payablesProgress = Math.min(((payablesCurrent / payablesTarget) * 100) || 0, 100)
  const receivablesRemaining = Math.max(receivablesTarget - receivablesCurrent, 0)
  const payablesRemaining = Math.max(payablesTarget - payablesCurrent, 0)

  return (
    <MainLayout>
      <WelcomeModal />
      <div className="p-6 space-y-4">
        <Greeting />

        {summaryLoading ? (
          <MetaTrackerSkeleton />
        ) : (
          <div className="bg-card rounded-lg border p-4 sm:p-5">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Recebimentos */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-medium text-muted-foreground">Recebimentos</h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-bold text-foreground tabular-nums">{formatCurrencyShort(receivablesCurrent)}</span>
                    </div>
                  </div>

                  {/* Small circular progress */}
                  <div className="relative w-12 h-12">
                    <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        className="stroke-border"
                        strokeWidth="2"
                      />
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        className="stroke-income"
                        strokeWidth="2"
                        strokeDasharray={`${receivablesProgress}, 100`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-medium text-foreground">{Math.round(receivablesProgress)}%</span>
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Falta {formatCurrencyShort(receivablesRemaining)} para a meta</span>
                    <span className="text-muted-foreground">meta &gt;{formatCurrencyShort(receivablesTarget)}</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-income h-2 rounded-full transition-all duration-300"
                      style={{ width: `${receivablesProgress}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Despesas */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-medium text-muted-foreground">Despesas</h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-bold text-foreground tabular-nums">{formatCurrencyShort(payablesCurrent)}</span>
                    </div>
                  </div>

                  {/* Small circular progress */}
                  <div className="relative w-12 h-12">
                    <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        className="stroke-border"
                        strokeWidth="2"
                      />
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        className="stroke-expense"
                        strokeWidth="2"
                        strokeDasharray={`${payablesProgress}, 100`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-medium text-foreground">{Math.round(payablesProgress)}%</span>
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Restam {formatCurrencyShort(payablesRemaining)} do limite</span>
                    <span className="text-muted-foreground">meta &lt;{formatCurrencyShort(payablesTarget)}</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-expense h-2 rounded-full transition-all duration-300"
                      style={{ width: `${payablesProgress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Métricas complementares (não duplicam o tracker de metas acima) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {summaryLoading ? <SummaryCardSkeleton /> : (
            <SummaryCard title="Total em aberto" value={summary?.totalOpen || 0} icon={DollarSign} />
          )}
          {agingLoading ? <SummaryCardSkeleton /> : (
            <SummaryCard title="Próximos 30 dias" value={aging?.next30Days || 0} icon={Calendar} />
          )}
        </div>

        {/* DRE inline — resultado do mês */}
        {transactionsLoading ? (
          <ListSkeleton rows={3} />
        ) : (
          <MonthlyResult transactions={transactions || []} areas={areas || []} />
        )}

        {/* Calendário do mês + listas (lançamentos em atraso, vencimentos próximos) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {transactionsLoading ? (
            <>
              <ListSkeleton rows={6} />
              <div className="space-y-4">
                <ListSkeleton />
                <ListSkeleton />
              </div>
            </>
          ) : (
            <>
              <MonthCalendar transactions={transactions || []} />
              <div className="space-y-4">
                <PendingListCard
                  title="Lançamentos em atraso"
                  variant="danger"
                  transactions={overdue}
                  emptyLabel="Nenhum lançamento vencido. 👍"
                />
                <PendingListCard
                  title="Vencimentos nos próximos 7 dias"
                  variant="warning"
                  transactions={upcoming}
                  emptyLabel="Nenhum vencimento nos próximos 7 dias."
                />
              </div>
            </>
          )}
        </div>

        {/* Cashflow Chart */}
        <CashflowChart />
      </div>
    </MainLayout>
  )
}
