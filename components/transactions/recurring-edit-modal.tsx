"use client"

import { useState } from "react"
import { AlertCircle } from "lucide-react"
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

interface RecurringEditModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (mode: "single" | "future" | "all") => void
  editType: "recurrence" | "normal"
  transactionDescription?: string
}

export function RecurringEditModal({
  isOpen,
  onClose,
  onConfirm,
  editType,
  transactionDescription = "transação",
}: RecurringEditModalProps) {
  const [selectedMode, setSelectedMode] = useState<"single" | "future" | "all">("single")

  const handleConfirm = () => {
    onConfirm(selectedMode)
    onClose()
  }

  const handleCancel = () => {
    setSelectedMode("single")
    onClose()
  }

  const options =
    editType === "recurrence"
      ? [
          {
            value: "future" as const,
            label: "Este e os registros seguintes",
            description: "Aplica as mudanças de recorrência a partir desta data",
          },
          {
            value: "all" as const,
            label: "Todos os registros da série",
            description: "Aplica as mudanças de recorrência a toda a série",
          },
        ]
      : [
          {
            value: "single" as const,
            label: "Somente este registro",
            description: "Altera apenas esta ocorrência, mantendo as outras inalteradas",
          },
          {
            value: "future" as const,
            label: "Este e os registros seguintes",
            description: "Altera esta ocorrência e todas as futuras da série",
          },
          {
            value: "all" as const,
            label: "Todos os registros da série",
            description: "Altera todas as ocorrências da série (passadas, presente e futuras)",
          },
        ]

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-600" />
            Editar transação recorrente
          </DialogTitle>
          <DialogDescription>
            {editType === "recurrence"
              ? "Você alterou a configuração de recorrência. Como deseja aplicar esta mudança?"
              : `Esta é uma transação recorrente (${transactionDescription}). Como deseja aplicar as alterações?`}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <RadioGroup value={selectedMode} onValueChange={(value) => setSelectedMode(value as any)}>
            {options.map((option) => (
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
          <Button onClick={handleConfirm}>Aplicar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
