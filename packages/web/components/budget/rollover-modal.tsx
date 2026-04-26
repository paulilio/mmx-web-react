"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useBudgetAllocations } from "@/hooks/use-budget-allocations"
import type { BudgetGroup } from "@/lib/shared/types"
import { Loader2, Settings } from "lucide-react"

const rolloverSchema = z.object({
  enabled: z.boolean(),
  amount: z.number().optional(),
})

type RolloverFormData = z.infer<typeof rolloverSchema>

interface RolloverModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  budgetGroup?: BudgetGroup | null
  month: number
  year: number
}

export function RolloverModal({ open, onOpenChange, budgetGroup, month, year }: RolloverModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const monthString = `${year}-${month.toString().padStart(2, "0")}`

  const nextMonth = month === 12 ? 1 : month + 1
  const nextYear = month === 12 ? year + 1 : year
  const nextMonthString = `${nextYear}-${nextMonth.toString().padStart(2, "0")}`

  const { budgetAllocations, updateBudgetAllocation, createBudgetAllocation } = useBudgetAllocations(monthString)
  const { budgetAllocations: nextMonthAllocations } = useBudgetAllocations(nextMonthString)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RolloverFormData>({
    resolver: zodResolver(rolloverSchema),
    defaultValues: {
      enabled: false,
    },
  })

  const rolloverEnabled = watch("enabled")

  // Load current rollover settings when modal opens
  useEffect(() => {
    if (open && budgetGroup) {
      const allocation = budgetAllocations.find((a) => a.budget_group_id === budgetGroup.id)
      if (allocation) {
        // For now, we'll consider rollover enabled if there's a positive available amount
        // In a real implementation, you'd store rollover settings in the allocation
        setValue("enabled", allocation.available_amount > 0)
      }
    }
  }, [open, budgetGroup, budgetAllocations, setValue])

  const onSubmit = async (data: RolloverFormData) => {
    if (!budgetGroup) return

    setIsSubmitting(true)
    try {
      const currentAllocation = budgetAllocations.find((a) => a.budget_group_id === budgetGroup.id)

      if (data.enabled && currentAllocation && currentAllocation.available_amount > 0) {
        const rolloverAmount =
          data.amount && data.amount < currentAllocation.available_amount
            ? data.amount
            : currentAllocation.available_amount

        // Create or update next month's allocation
        const nextAllocation = nextMonthAllocations.find((a) => a.budget_group_id === budgetGroup.id)

        if (nextAllocation) {
          await updateBudgetAllocation(nextAllocation.id, {
            funded_amount: nextAllocation.funded_amount + rolloverAmount,
            available_amount: nextAllocation.available_amount + rolloverAmount,
          })
        } else {
          await createBudgetAllocation({
            budget_group_id: budgetGroup.id,
            month: nextMonthString,
            planned_amount: 0,
            funded_amount: rolloverAmount,
          })
        }

        // Update current month to reflect the rollover
        await updateBudgetAllocation(currentAllocation.id, {
          funded_amount: currentAllocation.funded_amount - rolloverAmount,
          available_amount: currentAllocation.available_amount - rolloverAmount,
        })
      }

      onOpenChange(false)
      reset()
    } catch (error) {
      console.error("Erro ao configurar rollover:", error)
      alert("Erro ao configurar rollover. Tente novamente.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const currentAllocation = budgetAllocations.find((a) => a.budget_group_id === budgetGroup?.id)
  const availableAmount = currentAllocation?.available_amount || 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configurar Rollover
          </DialogTitle>
        </DialogHeader>

        {budgetGroup && (
          <div className="mb-4 p-3 bg-accent rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: budgetGroup.color }} />
              <span>{budgetGroup.icon}</span>
              <span className="font-medium">{budgetGroup.name}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">Disponível para rollover: R$ {availableAmount.toFixed(2)}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="enabled"
              checked={rolloverEnabled}
              onCheckedChange={(checked) => setValue("enabled", !!checked)}
              disabled={availableAmount <= 0}
            />
            <Label
              htmlFor="enabled"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Transferir fundos disponíveis para o próximo mês
            </Label>
          </div>

          {availableAmount <= 0 && (
            <p className="text-sm text-warning">Não há fundos disponíveis para rollover neste grupo.</p>
          )}

          {rolloverEnabled && availableAmount > 0 && (
            <div>
              <Label htmlFor="amount" className="mb-2 block">
                Valor para Rollover (opcional)
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="Deixe vazio para transferir todo o valor disponível"
                max={availableAmount}
                {...register("amount", { valueAsNumber: true })}
              />
              {errors.amount && <p className="text-sm text-expense mt-1">{errors.amount.message}</p>}
              <p className="text-xs text-muted-foreground mt-1">
                Se não especificado, todo o valor disponível (R$ {availableAmount.toFixed(2)}) será transferido
              </p>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || (rolloverEnabled && availableAmount <= 0)}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {rolloverEnabled ? "Executar Rollover" : "Cancelar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
