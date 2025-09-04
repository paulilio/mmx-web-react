"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { paymentSchema, type PaymentFormData } from "@/lib/validations"
import { createPayment, useEntryPayments } from "@/hooks/use-entries"
import type { Entry } from "@/lib/types"
import { mutate } from "swr"
import { Loader2 } from "lucide-react"

interface PaymentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  entry: Entry | null
}

export function PaymentModal({ open, onOpenChange, entry }: PaymentModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { data: existingPayments } = useEntryPayments(entry?.id || "")

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      paidAt: new Date().toISOString().split("T")[0],
    },
  })

  const onSubmit = async (data: PaymentFormData) => {
    if (!entry) return

    setIsSubmitting(true)
    try {
      await createPayment(entry.id, data)

      // Revalidate entries list and payments
      mutate((key) => typeof key === "string" && key.startsWith("/entries"))

      onOpenChange(false)
      reset()
    } catch (error) {
      console.error("Erro ao registrar pagamento:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    reset()
  }

  // Calculate remaining amount
  const totalPaid = existingPayments?.reduce((sum, payment) => sum + payment.amount, 0) || 0
  const remainingAmount = (entry?.amount || 0) - totalPaid
  const paymentAmount = watch("amount") || 0

  // Set default amount to remaining amount when modal opens
  useState(() => {
    if (open && remainingAmount > 0) {
      setValue("amount", remainingAmount)
    }
  })

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar Pagamento</DialogTitle>
        </DialogHeader>

        {entry && (
          <div className="bg-slate-50 p-4 rounded-lg mb-4">
            <p className="text-sm text-slate-600">Lançamento:</p>
            <p className="font-medium">{entry.description}</p>
            <div className="flex justify-between items-center mt-2">
              <div>
                <p className="text-sm text-slate-600">
                  Valor total:{" "}
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(entry.amount)}
                </p>
                <p className="text-sm text-slate-600">
                  Já pago:{" "}
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(totalPaid)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-blue-600">
                  Restante:{" "}
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(remainingAmount)}
                </p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="amount">Valor do Pagamento *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              max={remainingAmount}
              {...register("amount", { valueAsNumber: true })}
              placeholder="0,00"
            />
            {errors.amount && <p className="text-sm text-red-600 mt-1">{errors.amount.message}</p>}
            {paymentAmount > remainingAmount && (
              <p className="text-sm text-red-600 mt-1">
                Valor não pode ser maior que o saldo restante (
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(remainingAmount)}
                )
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="paidAt">Data do Pagamento *</Label>
            <Input id="paidAt" type="date" {...register("paidAt")} />
            {errors.paidAt && <p className="text-sm text-red-600 mt-1">{errors.paidAt.message}</p>}
          </div>

          <div>
            <Label htmlFor="method">Método de Pagamento *</Label>
            <Select value={watch("method")} onValueChange={(value) => setValue("method", value as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o método" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pix">PIX</SelectItem>
                <SelectItem value="boleto">Boleto</SelectItem>
                <SelectItem value="cartao">Cartão</SelectItem>
                <SelectItem value="transf">Transferência</SelectItem>
              </SelectContent>
            </Select>
            {errors.method && <p className="text-sm text-red-600 mt-1">{errors.method.message}</p>}
          </div>

          <div>
            <Label htmlFor="note">Observações</Label>
            <Textarea id="note" {...register("note")} placeholder="Observações sobre o pagamento (opcional)" rows={3} />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || paymentAmount > remainingAmount || paymentAmount <= 0}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Registrar Pagamento
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
