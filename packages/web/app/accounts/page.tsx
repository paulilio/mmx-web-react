"use client"

import { useMemo, useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { useAccounts } from "@/hooks/use-accounts"
import { AccountCard } from "@/components/accounts/account-card"
import { AccountsSummary } from "@/components/accounts/accounts-summary"
import { AccountFormModal } from "@/components/accounts/account-form-modal"
import type { Account, AccountType } from "@/lib/shared/types"
import { Loader2, Plus, Wallet } from "lucide-react"
import { toast } from "sonner"

type TabKey = "all" | "checking" | "savings" | "credit-card" | "investment" | "business" | "other"

const TABS: Array<{ key: TabKey; label: string; types: AccountType[] }> = [
  { key: "all", label: "Todas", types: [] },
  { key: "checking", label: "Correntes", types: ["checking"] },
  { key: "savings", label: "Poupanças", types: ["savings"] },
  { key: "credit-card", label: "Cartões", types: ["credit-card"] },
  { key: "investment", label: "Investimentos", types: ["investment"] },
  { key: "business", label: "Empresa", types: ["business"] },
  { key: "other", label: "Outras", types: ["cash", "other"] },
]

export default function AccountsPage() {
  const { accounts, isLoading, archiveAccount } = useAccounts()
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Account | null>(null)
  const [activeTab, setActiveTab] = useState<TabKey>("all")
  const [showArchived, setShowArchived] = useState(false)

  const visibleAccounts = useMemo(() => {
    return accounts.filter((a) => (showArchived ? true : a.status !== "archived"))
  }, [accounts, showArchived])

  const accountsByTab = useMemo(() => {
    const tab = TABS.find((t) => t.key === activeTab) ?? TABS[0]
    if (tab.types.length === 0) return visibleAccounts
    return visibleAccounts.filter((a) => tab.types.includes(a.type))
  }, [visibleAccounts, activeTab])

  const openCreate = () => {
    setEditing(null)
    setShowModal(true)
  }

  const openEdit = (account: Account) => {
    setEditing(account)
    setShowModal(true)
  }

  const handleArchive = async (account: Account) => {
    if (!window.confirm(`Arquivar a conta "${account.name}"?`)) return
    try {
      await archiveAccount(account.id)
      toast.success("Conta arquivada")
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao arquivar conta"
      toast.error(message)
    }
  }

  return (
    <MainLayout>
      <div className="space-y-6 p-6">
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">Contas</h1>
            <p className="text-sm text-muted-foreground">
              Cadastre suas contas correntes, cartões, investimentos e CNPJ.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none">
              <input
                type="checkbox"
                className="h-3.5 w-3.5"
                checked={showArchived}
                onChange={(e) => setShowArchived(e.target.checked)}
              />
              Mostrar arquivadas
            </label>
            <Button onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Nova conta
            </Button>
          </div>
        </header>

        {!isLoading && accounts.length > 0 && <AccountsSummary accounts={accounts} />}

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabKey)}>
          <TabsList className="flex-wrap h-auto">
            {TABS.map((t) => (
              <TabsTrigger key={t.key} value={t.key}>
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {TABS.map((t) => (
            <TabsContent key={t.key} value={t.key} className="mt-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : accountsByTab.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <Wallet className="h-8 w-8 text-muted-foreground mb-3" />
                    <p className="text-sm font-medium">Nenhuma conta nesta visão</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Cadastre sua primeira conta para começar a controlar suas finanças.
                    </p>
                    <Button className="mt-4" onClick={openCreate}>
                      <Plus className="mr-2 h-4 w-4" />
                      Nova conta
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {accountsByTab.map((account) => (
                    <AccountCard
                      key={account.id}
                      account={account}
                      onEdit={openEdit}
                      onArchive={handleArchive}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>

        <AccountFormModal
          open={showModal}
          onOpenChange={(o) => {
            setShowModal(o)
            if (!o) setEditing(null)
          }}
          account={editing}
        />
      </div>
    </MainLayout>
  )
}
