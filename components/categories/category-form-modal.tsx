"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { categorySchema, type CategoryFormData } from "@/lib/validations"
import { createCategory, updateCategory } from "@/hooks/use-categories"
import type { Category } from "@/lib/types"
import { mutate } from "swr"
import { Loader2 } from "lucide-react"

interface CategoryFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category?: Category | null
}

export function CategoryFormModal({ open, onOpenChange, category }: CategoryFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      description: "",
      type: "expense",
    },
  })

  useEffect(() => {
    if (!open) return
    if (category) {
      reset({
        name: category.name ?? "",
        description: category.description ?? "",
        type: category.type ?? "expense",
      })
    } else {
      reset({ name: "", description: "", type: "expense" })
    }
  }, [open, category, reset])

  const handleDialogOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      reset({ name: "", description: "", type: "expense" })
    }
    onOpenChange(nextOpen)
  }

  const onSubmit = async (data: CategoryFormData) => {
    setIsSubmitting(true)
    try {
      if (category) {
        await updateCategory(category.id, data)
      } else {
        await createCategory(data)
      }

      mutate("/categories")

      onOpenChange(false)
      reset({ name: "", description: "", type: "expense" })
    } catch (error) {
      console.error("Erro ao salvar categoria:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="max-w-md" key={category?.id ?? "new"}>
        <DialogHeader>
          <DialogTitle>{category ? "Editar Categoria" : "Nova Categoria"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Nome *</Label>
            <Input id="name" {...register("name")} placeholder="Nome da categoria" />
            {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <Label htmlFor="type">Tipo *</Label>
            <Select
              value={watch("type")}
              onValueChange={(v) => setValue("type", v as "income" | "expense", { shouldDirty: true })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">Receita</SelectItem>
                <SelectItem value="expense">Despesa</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && <p className="text-sm text-red-600 mt-1">{errors.type.message}</p>}
          </div>

          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Descrição da categoria (opcional)"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => handleDialogOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {category ? "Atualizar" : "Criar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
