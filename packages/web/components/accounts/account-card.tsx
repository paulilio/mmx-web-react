"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Wallet, CreditCard, TrendingUp, Building2, Banknote, PiggyBank, Pencil, Archive } from "lucide-react"
import type { Account, AccountType } from "@/lib/shared/types"

interface AccountCardProps {
  account: Account
  onEdit?: (account: Account) => void
  onArchive?: (account: Account) => void
}

const TYPE_LABELS: Record<AccountType, string> = {
  checking: "Conta corrente",
  savings: "Poupança",
  "credit-card": "Cartão de crédito",
  investment: "Investimento",
  business: "Empresa",
  cash: "Carteira",
  other: "Outro",
}

const TYPE_ICONS: Record<AccountType, typeof Wallet> = {
  checking: Wallet,
  savings: PiggyBank,
  "credit-card": CreditCard,
  investment: TrendingUp,
  business: Building2,
  cash: Banknote,
  other: Wallet,
}

function formatCurrency(value: number, currency: string): string {
  try {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency }).format(value)
  } catch {
    return `${currency} ${value.toFixed(2)}`
  }
}

function formatDay(day: number | null | undefined): string | null {
  if (day == null) return null
  return `dia ${day}`
}

export function AccountCard({ account, onEdit, onArchive }: AccountCardProps) {
  const Icon = TYPE_ICONS[account.type] ?? Wallet
  const typeLabel = TYPE_LABELS[account.type] ?? account.type
  const balance = Number(account.openingBalance ?? 0)
  const isCreditCard = account.type === "credit-card"
  const isArchived = account.status === "archived"
  const isPending = account.status === "pending-review"

  return (
    <Card className={isArchived ? "opacity-60" : undefined}>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="rounded-md bg-muted p-2 shrink-0">
              <Icon className="h-4 w-4 text-foreground/70" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-semibold truncate">{account.name}</h3>
                {isArchived && <Badge variant="secondary" className="text-[10px]">Arquivada</Badge>}
                {isPending && <Badge variant="outline" className="text-[10px]">Pendente</Badge>}
              </div>
              <p className="text-xs text-muted-foreground truncate">
                {account.institutionName ? `${account.institutionName} · ` : ""}
                {typeLabel}
              </p>
            </div>
          </div>
          <div className="flex gap-1 shrink-0">
            {onEdit && (
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => onEdit(account)}>
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            )}
            {onArchive && !isArchived && (
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => onArchive(account)}>
                <Archive className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>

        <div>
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
            {isCreditCard ? "Saldo / Dívida" : "Saldo"}
          </p>
          <p className={`text-xl font-semibold ${isCreditCard && balance < 0 ? "text-destructive" : ""}`}>
            {formatCurrency(balance, account.currency)}
          </p>
        </div>

        {isCreditCard && (
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border text-xs">
            {account.creditLimit != null && (
              <div>
                <p className="text-muted-foreground">Limite</p>
                <p className="font-medium">{formatCurrency(Number(account.creditLimit), account.currency)}</p>
              </div>
            )}
            {account.closingDay != null && (
              <div>
                <p className="text-muted-foreground">Fechamento</p>
                <p className="font-medium">{formatDay(account.closingDay)}</p>
              </div>
            )}
            {account.dueDay != null && (
              <div>
                <p className="text-muted-foreground">Vencimento</p>
                <p className="font-medium">{formatDay(account.dueDay)}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
