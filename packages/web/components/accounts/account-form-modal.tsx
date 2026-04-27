"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { accountSchema } from "@/lib/shared/validations"
import { useAccounts } from "@/hooks/use-accounts"
import type { Account, AccountFormData, AccountType } from "@/lib/shared/types"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

interface AccountFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  account?: Account | null
}

const TYPE_OPTIONS: Array<{ value: AccountType; label: string }> = [
  { value: "checking", label: "Conta corrente" },
  { value: "savings", label: "Poupança" },
  { value: "credit-card", label: "Cartão de crédito" },
  { value: "investment", label: "Investimento" },
  { value: "business", label: "CNPJ / Empresa" },
  { value: "cash", label: "Dinheiro / Carteira" },
  { value: "other", label: "Outro" },
]

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

function toIsoDate(value: string | null | undefined): string {
  if (!value) return todayIso()
  return value.length >= 10 ? value.slice(0, 10) : value
}

export function AccountFormModal({ open, onOpenChange, account }: AccountFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { createAccount, updateAccount } = useAccounts()
  const isEditing = Boolean(account)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: "",
      institutionName: "",
      type: "checking",
      currency: "BRL",
      openingBalance: 0,
      openingBalanceDate: todayIso(),
      creditLimit: null,
      closingDay: null,
      dueDay: null,
    },
  })

  const watchedType = watch("type")

  useEffect(() => {
    if (!open) return

    if (account) {
      reset({
        name: account.name,
        institutionName: account.institutionName ?? "",
        type: account.type,
        currency: account.currency,
        openingBalance: Number(account.openingBalance ?? 0),
        openingBalanceDate: toIsoDate(account.openingBalanceDate),
        creditLimit: account.creditLimit == null ? null : Number(account.creditLimit),
        closingDay: account.closingDay ?? null,
        dueDay: account.dueDay ?? null,
      })
    } else {
      reset({
        name: "",
        institutionName: "",
        type: "checking",
        currency: "BRL",
        openingBalance: 0,
        openingBalanceDate: todayIso(),
        creditLimit: null,
        closingDay: null,
        dueDay: null,
      })
    }
  }, [open, account, reset])

  // Clear credit-card-only fields when switching to a non-credit-card type
  useEffect(() => {
    if (watchedType !== "credit-card") {
      setValue("creditLimit", null)
      setValue("closingDay", null)
      setValue("dueDay", null)
    }
  }, [watchedType, setValue])

  const onSubmit = async (data: AccountFormData) => {
    setIsSubmitting(true)
    try {
      const payload: AccountFormData = {
        ...data,
        institutionName: data.institutionName?.trim() || undefined,
        currency: (data.currency || "BRL").toUpperCase(),
        openingBalance: Number(data.openingBalance ?? 0),
      }

      if (data.type !== "credit-card") {
        payload.creditLimit = null
        payload.closingDay = null
        payload.dueDay = null
      }

      if (isEditing && account) {
        await updateAccount(account.id, payload)
        toast.success("Conta atualizada com sucesso")
      } else {
        await createAccount(payload)
        toast.success("Conta criada com sucesso")
      }

      onOpenChange(false)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao salvar conta"
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar conta" : "Nova conta"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="account-name">Nome</Label>
            <Input id="account-name" placeholder="Ex.: BB Corrente" {...register("name")} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="account-type">Tipo</Label>
              <Select
                value={watchedType}
                onValueChange={(v) => setValue("type", v as AccountType, { shouldValidate: true })}
              >
                <SelectTrigger id="account-type">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  {TYPE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.type && <p className="text-xs text-destructive">{errors.type.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="account-institution">Instituição</Label>
              <Input
                id="account-institution"
                placeholder="Ex.: Banco do Brasil"
                {...register("institutionName")}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="account-opening-balance">Saldo inicial</Label>
              <Input
                id="account-opening-balance"
                type="number"
                step="0.01"
                {...register("openingBalance", { valueAsNumber: true })}
              />
              {errors.openingBalance && (
                <p className="text-xs text-destructive">{errors.openingBalance.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="account-opening-balance-date">Data do saldo inicial</Label>
              <Input
                id="account-opening-balance-date"
                type="date"
                {...register("openingBalanceDate")}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="account-currency">Moeda</Label>
              <Input
                id="account-currency"
                placeholder="BRL"
                maxLength={3}
                {...register("currency")}
              />
              {errors.currency && (
                <p className="text-xs text-destructive">{errors.currency.message}</p>
              )}
            </div>
          </div>

          {watchedType === "credit-card" && (
            <div className="rounded-md border border-border bg-muted/30 p-3 space-y-3">
              <p className="text-xs font-medium text-muted-foreground">Dados do cartão de crédito</p>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="account-credit-limit">Limite</Label>
                  <Input
                    id="account-credit-limit"
                    type="number"
                    step="0.01"
                    {...register("creditLimit", { valueAsNumber: true })}
                  />
                  {errors.creditLimit && (
                    <p className="text-xs text-destructive">{errors.creditLimit.message}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="account-closing-day">Fechamento (dia)</Label>
                  <Input
                    id="account-closing-day"
                    type="number"
                    min={1}
                    max={31}
                    {...register("closingDay", { valueAsNumber: true })}
                  />
                  {errors.closingDay && (
                    <p className="text-xs text-destructive">{errors.closingDay.message}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="account-due-day">Vencimento (dia)</Label>
                  <Input
                    id="account-due-day"
                    type="number"
                    min={1}
                    max={31}
                    {...register("dueDay", { valueAsNumber: true })}
                  />
                  {errors.dueDay && (
                    <p className="text-xs text-destructive">{errors.dueDay.message}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Salvar" : "Criar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
