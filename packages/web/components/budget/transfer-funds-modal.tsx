"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useBudgetAllocations } from "@/hooks/use-budget-allocations"
import { fundTransferSchema, type FundTransferFormData } from "@/lib/shared/validations"
import type { BudgetGroup } from "@/lib/shared/types"
import { Loader2, ArrowRightLeft } from "lucide-react"

interface TransferFundsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  budgetGroups: BudgetGroup[]
  month: number
  year: number
}

export function TransferFundsModal({ open, onOpenChange, budgetGroups, month, year }: TransferFundsModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const monthString = `${year}-${month.toString().padStart(2, "0")}`
  const { budgetAllocations, transferFunds } = useBudgetAllocations(monthString)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FundTransferFormData>({
    resolver: zodResolver(fundTransferSchema),
    defaultValues: {
      month,
      year,
    },
  })

  const fromGroupId = watch("fromBudgetGroupId")
  const toGroupId = watch("toBudgetGroupId")

  const onSubmit = async (data: FundTransferFormData) => {
    setIsSubmitting(true)
    try {
      // Find allocations for both groups
      const fromAllocation = budgetAllocations.find((a) => a.budget_group_id === data.fromBudgetGroupId)
      const toAllocation = budgetAllocations.find((a) => a.budget_group_id === data.toBudgetGroupId)

      if (!fromAllocation) {
        throw new Error("Grupo de origem não possui alocação para este mês")
      }

      if (fromAllocation.available_amount < data.amount) {
        throw new Error("Fundos insuficientes no grupo de origem")
      }

      await transferFunds(fromAllocation.id, toAllocation?.id || "", data.amount)
      onOpenChange(false)
      reset()
    } catch (error) {
      console.error("Erro ao transferir fundos:", error)
      alert(error instanceof Error ? error.message : "Erro ao transferir fundos")
    } finally {
      setIsSubmitting(false)
    }
  }

  const availableGroups = budgetGroups.filter((group) => group.status === "active")

  // Get available amount for from group
  const fromAllocation = budgetAllocations.find((a) => a.budget_group_id === fromGroupId)
  const availableAmount = fromAllocation?.available_amount || 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5" />
            Transferir Fundos
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="fromBudgetGroupId" className="mb-2 block">
              De (Grupo de Origem) *
            </Label>
            <Select
              value={fromGroupId}
              onValueChange={(value) => setValue("fromBudgetGroupId", value, { shouldDirty: true })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o grupo de origem" />
              </SelectTrigger>
              <SelectContent>
                {availableGroups.map((group) => (
                  <SelectItem key={group.id} value={group.id} disabled={group.id === toGroupId}>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: group.color }} />
                      <span>{group.icon}</span>
                      <span>{group.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fromGroupId && <p className="text-sm text-muted-foreground mt-1">Disponível: R$ {availableAmount.toFixed(2)}</p>}
            {errors.fromBudgetGroupId && (
              <p className="text-sm text-expense mt-1">{errors.fromBudgetGroupId.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="toBudgetGroupId" className="mb-2 block">
              Para (Grupo de Destino) *
            </Label>
            <Select
              value={toGroupId}
              onValueChange={(value) => setValue("toBudgetGroupId", value, { shouldDirty: true })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o grupo de destino" />
              </SelectTrigger>
              <SelectContent>
                {availableGroups.map((group) => (
                  <SelectItem key={group.id} value={group.id} disabled={group.id === fromGroupId}>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: group.color }} />
                      <span>{group.icon}</span>
                      <span>{group.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.toBudgetGroupId && <p className="text-sm text-expense mt-1">{errors.toBudgetGroupId.message}</p>}
          </div>

          <div>
            <Label htmlFor="amount" className="mb-2 block">
              Valor a Transferir *
            </Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0,00"
              max={availableAmount}
              {...register("amount", { valueAsNumber: true })}
            />
            {errors.amount && <p className="text-sm text-expense mt-1">{errors.amount.message}</p>}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || !fromGroupId || !toGroupId}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Transferir Fundos
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
