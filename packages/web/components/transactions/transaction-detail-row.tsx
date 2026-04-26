"use client"

import { Repeat, FileText, MapPin, User, Pause } from "lucide-react"
import type { Transaction, Category, CategoryGroup, Area, Contact } from "@/lib/shared/types"
import { formatCurrency } from "@/lib/shared/utils"
import { formatDateToPtBR } from "@/lib/shared/date-utils"

interface Props {
  transaction: Transaction
  allTransactions: Transaction[]
  categories: Category[]
  categoryGroups: CategoryGroup[]
  areas: Area[]
  contacts: Contact[]
}

const FREQUENCY_LABEL: Record<string, string> = {
  daily: "Diária",
  weekly: "Semanal",
  monthly: "Mensal",
  yearly: "Anual",
}

export function TransactionDetailRow({
  transaction,
  allTransactions,
  categories,
  categoryGroups,
  areas,
  contacts,
}: Props) {
  const category = categories.find((c) => c.id === transaction.categoryId)
  const categoryGroup = categoryGroups.find((cg) => cg.id === transaction.categoryGroupId)
  const area = areas.find((a) => a.id === transaction.areaId)
  const contact = transaction.contactId ? contacts.find((c) => c.id === transaction.contactId) : null

  const isSeries = Boolean(transaction.templateId)
  const seriesPaused = transaction.template?.paused ?? false

  const upcomingInSeries = isSeries
    ? allTransactions
        .filter(
          (t) =>
            t.templateId === transaction.templateId &&
            t.id !== transaction.id &&
            new Date(t.date) > new Date(transaction.date) &&
            !t.skipped,
        )
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 3)
    : []

  const totalInSeries = isSeries
    ? allTransactions.filter((t) => t.templateId === transaction.templateId).length
    : 0

  const seriesLabel = isSeries
    ? transaction.template
      ? `${transaction.seriesIndex ?? "?"} de ${transaction.template.count ?? totalInSeries} ${
          FREQUENCY_LABEL[transaction.template.frequency] ?? ""
        }`.trim()
      : `${transaction.seriesIndex ?? "?"} de ${totalInSeries}`
    : null

  return (
    <div className="bg-slate-50 px-6 py-4 border-y border-slate-200">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        {/* Recorrência */}
        {isSeries && (
          <div className="md:col-span-2 flex items-start gap-3">
            <div className="mt-0.5">
              {seriesPaused ? (
                <Pause className="h-4 w-4 text-amber-600" />
              ) : (
                <Repeat className="h-4 w-4 text-blue-600" />
              )}
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-slate-900">
                  {seriesPaused ? "Série pausada" : "Série recorrente"}
                </span>
                <span className="text-slate-500">{seriesLabel}</span>
                {transaction.isException && (
                  <span className="px-2 py-0.5 text-xs rounded bg-purple-100 text-purple-700">
                    Exceção (editada individualmente)
                  </span>
                )}
                {transaction.skipped && (
                  <span className="px-2 py-0.5 text-xs rounded bg-orange-100 text-orange-700">
                    Pulada
                  </span>
                )}
              </div>
              {upcomingInSeries.length > 0 && (
                <div className="text-slate-600">
                  Próximas:{" "}
                  {upcomingInSeries
                    .map((t) => `${formatDateToPtBR(t.date)} (${formatCurrency(t.amount)})`)
                    .join(" • ")}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Hierarquia */}
        <div className="flex items-start gap-3">
          <MapPin className="h-4 w-4 text-slate-500 mt-0.5" />
          <div>
            <div className="text-xs uppercase tracking-wide text-slate-500 mb-0.5">
              Hierarquia
            </div>
            <div className="text-slate-900">
              {area?.name ?? <span className="text-slate-400">—</span>}
              {" › "}
              {categoryGroup?.name ?? <span className="text-slate-400">—</span>}
              {" › "}
              <span className="font-medium">{category?.name ?? "—"}</span>
            </div>
          </div>
        </div>

        {/* Contato */}
        <div className="flex items-start gap-3">
          <User className="h-4 w-4 text-slate-500 mt-0.5" />
          <div>
            <div className="text-xs uppercase tracking-wide text-slate-500 mb-0.5">
              Contato
            </div>
            <div className="text-slate-900">
              {contact ? contact.name : <span className="text-slate-400">Sem contato</span>}
            </div>
          </div>
        </div>

        {/* Notas */}
        {transaction.notes && (
          <div className="md:col-span-2 flex items-start gap-3">
            <FileText className="h-4 w-4 text-slate-500 mt-0.5" />
            <div className="flex-1">
              <div className="text-xs uppercase tracking-wide text-slate-500 mb-0.5">
                Notas
              </div>
              <div className="text-slate-900 whitespace-pre-wrap">{transaction.notes}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
