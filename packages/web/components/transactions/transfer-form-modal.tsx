"use client"

import { useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { transferSchema, type TransferFormDataSchema } from "@/lib/shared/validations"
import { useAccounts } from "@/hooks/use-accounts"
import { useTransactions } from "@/hooks/use-transactions"
import { Loader2, ArrowRightLeft } from "lucide-react"
import { toast } from "sonner"

interface TransferFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultFromAccountId?: string
  defaultToAccountId?: string
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

export function TransferFormModal({
  open,
  onOpenChange,
  defaultFromAccountId,
  defaultToAccountId,
}: TransferFormModalProps) {
  const { accounts } = useAccounts()
  const { createTransfer } = useTransactions()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const activeAccounts = useMemo(() => accounts.filter((a) => a.status !== "archived"), [accounts])

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<TransferFormDataSchema>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      fromAccountId: defaultFromAccountId ?? "",
      toAccountId: defaultToAccountId ?? "",
      amount: 0,
      date: todayIso(),
      description: "",
      notes: "",
      status: "pending",
    },
  })

  useEffect(() => {
    if (open) {
      reset({
        fromAccountId: defaultFromAccountId ?? "",
        toAccountId: defaultToAccountId ?? "",
        amount: 0,
        date: todayIso(),
        description: "",
        notes: "",
        status: "pending",
      })
    }
  }, [open, defaultFromAccountId, defaultToAccountId, reset])

  const fromAccountId = watch("fromAccountId")
  const toAccountId = watch("toAccountId")
  const status = watch("status")

  const onSubmit = async (data: TransferFormDataSchema) => {
    setIsSubmitting(true)
    try {
      await createTransfer({
        fromAccountId: data.fromAccountId,
        toAccountId: data.toAccountId,
        amount: Number(data.amount),
        date: data.date,
        description: data.description?.trim() || undefined,
        notes: data.notes?.trim() || undefined,
        status: data.status,
      })
      toast.success("Transferência criada com sucesso")
      onOpenChange(false)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao criar transferência"
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRightLeft className="h-4 w-4" />
            Nova transferência
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="from-account">De (origem)</Label>
              <Select
                value={fromAccountId}
                onValueChange={(v) => setValue("fromAccountId", v, { shouldValidate: true })}
              >
                <SelectTrigger id="from-account">
                  <SelectValue placeholder="Conta de origem" />
                </SelectTrigger>
                <SelectContent>
                  {activeAccounts.map((a) => (
                    <SelectItem key={a.id} value={a.id} disabled={a.id === toAccountId}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.fromAccountId && (
                <p className="text-xs text-destructive">{errors.fromAccountId.message as string}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="to-account">Para (destino)</Label>
              <Select
                value={toAccountId}
                onValueChange={(v) => setValue("toAccountId", v, { shouldValidate: true })}
              >
                <SelectTrigger id="to-account">
                  <SelectValue placeholder="Conta de destino" />
                </SelectTrigger>
                <SelectContent>
                  {activeAccounts.map((a) => (
                    <SelectItem key={a.id} value={a.id} disabled={a.id === fromAccountId}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.toAccountId && (
                <p className="text-xs text-destructive">{errors.toAccountId.message as string}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="transfer-amount">Valor</Label>
              <Input
                id="transfer-amount"
                type="number"
                step="0.01"
                {...register("amount", { valueAsNumber: true })}
              />
              {errors.amount && <p className="text-xs text-destructive">{errors.amount.message as string}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="transfer-date">Data</Label>
              <Input id="transfer-date" type="date" {...register("date")} />
              {errors.date && <p className="text-xs text-destructive">{errors.date.message as string}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="transfer-description">Descrição (opcional)</Label>
            <Input
              id="transfer-description"
              placeholder="Ex.: Pagamento da fatura do BB"
              {...register("description")}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="transfer-status">Status</Label>
              <Select
                value={status ?? "pending"}
                onValueChange={(v) => setValue("status", v as "pending" | "completed")}
              >
                <SelectTrigger id="transfer-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="completed">Concluída</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="transfer-notes">Observações (opcional)</Label>
            <Textarea id="transfer-notes" rows={2} {...register("notes")} />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Transferir
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
