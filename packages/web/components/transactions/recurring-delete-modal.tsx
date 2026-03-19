"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { AlertTriangle } from "lucide-react"

interface RecurringDeleteModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (mode: "single" | "future" | "all") => void
  transactionDescription?: string
}

export function RecurringDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  transactionDescription = "transação",
}: RecurringDeleteModalProps) {
  const [deleteMode, setDeleteMode] = useState<"single" | "future" | "all">("single")

  const handleConfirm = () => {
    onConfirm(deleteMode)
    onClose()
  }

  const handleCancel = () => {
    setDeleteMode("single")
    onClose()
  }

  const deleteOptions = [
    {
      value: "single" as const,
      label: "Somente este registro",
      description: "Exclui apenas esta ocorrência. As outras permanecem inalteradas.",
    },
    {
      value: "future" as const,
      label: "Este e os registros seguintes",
      description: "Exclui esta ocorrência e todas as futuras da série.",
    },
    {
      value: "all" as const,
      label: "Todos os registros da série",
      description: "Exclui todas as ocorrências da série (passadas, presente e futuras).",
    },
  ]

  const isDeleteMode = (value: string): value is "single" | "future" | "all" => {
    return deleteOptions.some((option) => option.value === value)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Excluir transação recorrente
          </DialogTitle>
          <DialogDescription>
            Esta é uma transação recorrente ({transactionDescription}). Como deseja aplicar a exclusão?
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <RadioGroup
            value={deleteMode}
            onValueChange={(value) => {
              if (isDeleteMode(value)) {
                setDeleteMode(value)
              }
            }}
          >
            {deleteOptions.map((option) => (
              <div key={option.value} className="space-y-1">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label htmlFor={option.value} className="text-sm font-medium cursor-pointer">
                    {option.label}
                  </Label>
                </div>
                <p className="text-xs text-muted-foreground ml-6">{option.description}</p>
              </div>
            ))}
          </RadioGroup>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleConfirm}>
            Excluir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
