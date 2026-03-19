"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useBudgetAllocations } from "@/hooks/use-budget-allocations"
import type { BudgetGroup } from "@/lib/shared/types"
import { Loader2, Plus } from "lucide-react"

const addFundsSchema = z.object({
  amount: z.number().positive("Valor deve ser positivo"),
})

type AddFundsFormData = z.infer<typeof addFundsSchema>

interface AddFundsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  budgetGroup?: BudgetGroup | null
  month: number
  year: number
}

export function AddFundsModal({ open, onOpenChange, budgetGroup, month, year }: AddFundsModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const monthString = `${year}-${month.toString().padStart(2, "0")}`
  const { budgetAllocations, createBudgetAllocation, updateBudgetAllocation } = useBudgetAllocations(monthString)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddFundsFormData>({
    resolver: zodResolver(addFundsSchema),
  })

  const onSubmit = async (data: AddFundsFormData) => {
    if (!budgetGroup) return

    setIsSubmitting(true)
    try {
      // Find existing allocation for this group and month
      const existingAllocation = budgetAllocations.find((a) => a.budget_group_id === budgetGroup.id)

      if (existingAllocation) {
        // Update existing allocation
        const newFundedAmount = existingAllocation.funded_amount + data.amount
        await updateBudgetAllocation(existingAllocation.id, {
          funded_amount: newFundedAmount,
          available_amount: newFundedAmount - existingAllocation.spent_amount,
        })
      } else {
        // Create new allocation
        await createBudgetAllocation({
          budget_group_id: budgetGroup.id,
          month: monthString,
          planned_amount: 0,
          funded_amount: data.amount,
        })
      }

      onOpenChange(false)
      reset()
    } catch (error) {
      console.error("Erro ao adicionar fundos:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Adicionar Fundos
          </DialogTitle>
        </DialogHeader>

        {budgetGroup && (
          <div className="mb-4 p-3 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: budgetGroup.color }} />
              <span>{budgetGroup.icon}</span>
              <span className="font-medium">{budgetGroup.name}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="amount" className="mb-2 block">
              Valor a Adicionar *
            </Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0,00"
              {...register("amount", { valueAsNumber: true })}
            />
            {errors.amount && <p className="text-sm text-red-600 mt-1">{errors.amount.message}</p>}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Adicionar Fundos
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
