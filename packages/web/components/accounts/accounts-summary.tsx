"use client"

import { Card, CardContent } from "@/components/ui/card"
import type { Account, AccountType } from "@/lib/shared/types"

interface AccountsSummaryProps {
  accounts: Account[]
}

const ASSET_TYPES: AccountType[] = ["checking", "savings", "investment", "cash", "business", "other"]
const LIABILITY_TYPES: AccountType[] = ["credit-card"]

const TYPE_LABELS: Record<AccountType, string> = {
  checking: "Correntes",
  savings: "Poupanças",
  "credit-card": "Cartões",
  investment: "Investimentos",
  business: "Empresa",
  cash: "Carteiras",
  other: "Outras",
}

function formatCurrency(value: number, currency: string): string {
  try {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency }).format(value)
  } catch {
    return `${currency} ${value.toFixed(2)}`
  }
}

export function AccountsSummary({ accounts }: AccountsSummaryProps) {
  const active = accounts.filter((a) => a.status !== "archived")
  if (active.length === 0) return null

  const currency = active[0].currency || "BRL"
  const totalsByType: Record<string, number> = {}
  let assets = 0
  let liabilities = 0

  for (const a of active) {
    const balance = Number(a.openingBalance ?? 0)
    totalsByType[a.type] = (totalsByType[a.type] ?? 0) + balance
    if (LIABILITY_TYPES.includes(a.type)) {
      liabilities += Math.abs(balance)
    } else if (ASSET_TYPES.includes(a.type)) {
      assets += balance
    }
  }

  const netWorth = assets - liabilities
  const orderedTypes = (Object.keys(totalsByType) as AccountType[]).sort((a, b) => {
    const order: AccountType[] = [
      "checking",
      "savings",
      "investment",
      "credit-card",
      "business",
      "cash",
      "other",
    ]
    return order.indexOf(a) - order.indexOf(b)
  })

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-wrap gap-x-8 gap-y-3 items-end justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Patrimônio líquido</p>
            <p className={`text-2xl font-semibold ${netWorth < 0 ? "text-destructive" : ""}`}>
              {formatCurrency(netWorth, currency)}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Ativos {formatCurrency(assets, currency)} − Passivos {formatCurrency(liabilities, currency)}
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            {orderedTypes.map((type) => (
              <div key={type}>
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{TYPE_LABELS[type]}</p>
                <p className="text-sm font-semibold">{formatCurrency(totalsByType[type], currency)}</p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
