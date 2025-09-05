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
import { entrySchema, type EntryFormData } from "@/lib/validations"
import { useContacts, useCategories, createEntry, updateEntry } from "@/hooks/use-entries"
import type { Entry } from "@/lib/types"
import { mutate } from "swr"
import { Loader2 } from "lucide-react"

interface EntryFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  entry?: Entry | null
}

export function EntryFormModal({ open, onOpenChange, entry }: EntryFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { data: contacts } = useContacts()
  const { data: categories } = useCategories()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<EntryFormData>({
    resolver: zodResolver(entrySchema),
    defaultValues: entry
      ? {
          type: entry.type,
          contactId: entry.contactId,
          categoryId: entry.categoryId,
          description: entry.description,
          issueDate: entry.issueDate,
          dueDate: entry.dueDate,
          amount: entry.amount,
          currency: "BRL",
          notes: entry.notes || "",
        }
      : {
          currency: "BRL",
          issueDate: new Date().toISOString().split("T")[0],
          dueDate: new Date().toISOString().split("T")[0],
        },
  })

  const onSubmit = async (data: EntryFormData) => {
    setIsSubmitting(true)
    try {
      if (entry) {
        await updateEntry(entry.id, data)
      } else {
        await createEntry(data)
      }

      // Revalidate entries list
      mutate((key) => typeof key === "string" && key.startsWith("/entries"))

      onOpenChange(false)
      reset()
    } catch (error) {
      console.error("Erro ao salvar lançamento:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    reset()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{entry ? "Editar Lançamento" : "Novo Lançamento"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type" className="mb-2 block">
                Tipo
              </Label>
              <Select
                value={watch("type")}
                onValueChange={(value) => setValue("type", value as "payable" | "receivable")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="receivable">A Receber</SelectItem>
                  <SelectItem value="payable">A Pagar</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && <p className="text-sm text-red-600 mt-1">{errors.type.message}</p>}
            </div>

            <div>
              <Label htmlFor="contactId" className="mb-2 block">
                Contato
              </Label>
              <Select value={watch("contactId")} onValueChange={(value) => setValue("contactId", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o contato" />
                </SelectTrigger>
                <SelectContent>
                  {contacts?.map((contact) => (
                    <SelectItem key={contact.id} value={contact.id}>
                      {contact.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.contactId && <p className="text-sm text-red-600 mt-1">{errors.contactId.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="categoryId" className="mb-2 block">
                Categoria
              </Label>
              <Select value={watch("categoryId")} onValueChange={(value) => setValue("categoryId", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.categoryId && <p className="text-sm text-red-600 mt-1">{errors.categoryId.message}</p>}
            </div>

            <div>
              <Label htmlFor="amount" className="mb-2 block">
                Valor
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                {...register("amount", { valueAsNumber: true })}
                placeholder="0,00"
              />
              {errors.amount && <p className="text-sm text-red-600 mt-1">{errors.amount.message}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="description" className="mb-2 block">
              Descrição
            </Label>
            <Input id="description" {...register("description")} placeholder="Descrição do lançamento" />
            {errors.description && <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="issueDate" className="mb-2 block">
                Data de Emissão
              </Label>
              <Input id="issueDate" type="date" {...register("issueDate")} />
              {errors.issueDate && <p className="text-sm text-red-600 mt-1">{errors.issueDate.message}</p>}
            </div>

            <div>
              <Label htmlFor="dueDate" className="mb-2 block">
                Data de Vencimento
              </Label>
              <Input id="dueDate" type="date" {...register("dueDate")} />
              {errors.dueDate && <p className="text-sm text-red-600 mt-1">{errors.dueDate.message}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="notes" className="mb-2 block">
              Observações
            </Label>
            <Textarea id="notes" {...register("notes")} placeholder="Observações adicionais (opcional)" rows={3} />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {entry ? "Atualizar" : "Criar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
