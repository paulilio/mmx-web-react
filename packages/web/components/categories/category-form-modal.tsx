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
import { Card, CardContent } from "@/components/ui/card"
import { categorySchema, type CategoryFormData } from "@/lib/shared/validations"
import { useCategories } from "@/hooks/use-categories"
import { useCategoryGroups } from "@/hooks/use-category-groups"
import { useAreas } from "@/hooks/use-areas"
import type { Category } from "@/lib/shared/types"
import { mutate } from "swr"
import { Loader2, Users, Building2, ChevronRight } from "lucide-react"

interface CategoryFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category?: Category | null
}

export function CategoryFormModal({ open, onOpenChange, category }: CategoryFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedAreaId, setSelectedAreaId] = useState<string | undefined>()

  const { createCategory, updateCategory } = useCategories()
  const { categoryGroups } = useCategoryGroups()
  const { areas } = useAreas()

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
      categoryGroupId: undefined,
    },
  })

  useEffect(() => {
    if (!open) return
    if (category) {
      reset({
        name: category.name ?? "",
        description: category.description ?? "",
        type: category.type ?? "expense",
        categoryGroupId: category.categoryGroupId ?? undefined,
      })

      if (category.categoryGroupId) {
        const categoryGroup = categoryGroups?.find((g) => g.id === category.categoryGroupId)
        setSelectedAreaId(categoryGroup?.areaId)
      }
    } else {
      reset({ name: "", description: "", type: "expense", categoryGroupId: undefined })
      setSelectedAreaId(undefined)
    }
  }, [open, category, reset, categoryGroups])

  const handleDialogOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      reset({ name: "", description: "", type: "expense", categoryGroupId: undefined })
      setSelectedAreaId(undefined)
    }
    onOpenChange(nextOpen)
  }

  const onSubmit = async (data: CategoryFormData) => {
    setIsSubmitting(true)
    try {
      const formData = {
        ...data,
        categoryGroupId: data.categoryGroupId || undefined,
      }

      if (category) {
        await updateCategory(category.id, formData)
      } else {
        await createCategory(formData)
      }

      mutate("/categories")

      onOpenChange(false)
      reset({ name: "", description: "", type: "expense", categoryGroupId: undefined })
      setSelectedAreaId(undefined)
    } catch (error) {
      console.error("Erro ao salvar categoria:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const categoryType = watch("type")
  const selectedCategoryGroupId = watch("categoryGroupId")

  const availableCategoryGroups =
    categoryGroups?.filter((group) => {
      return group.status === "active" && (!selectedAreaId || group.areaId === selectedAreaId)
    }) || []

  const selectedCategoryGroup = categoryGroups?.find((group) => group.id === selectedCategoryGroupId)
  const selectedArea = selectedCategoryGroup?.areaId ? areas?.find((a) => a.id === selectedCategoryGroup.areaId) : null

  const handleAreaChange = (areaId: string) => {
    if (areaId === "none") {
      setSelectedAreaId(undefined)
      setValue("categoryGroupId", undefined, { shouldDirty: true })
    } else {
      setSelectedAreaId(areaId)
      setValue("categoryGroupId", undefined, { shouldDirty: true })
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="max-w-lg" key={category?.id ?? "new"}>
        <DialogHeader>
          <DialogTitle>{category ? "Editar Categoria" : "Nova Categoria"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name" className="mb-2 block">
              Nome *
            </Label>
            <Input id="name" {...register("name")} placeholder="Nome da categoria" />
            {errors.name && <p className="text-sm text-expense mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <Label htmlFor="type" className="mb-2 block">
              Tipo *
            </Label>
            <Select
              value={watch("type")}
              onValueChange={(v) => {
                setValue("type", v as "income" | "expense", { shouldDirty: true })
                if (v === "income") {
                  setValue("categoryGroupId", undefined, { shouldDirty: true })
                  setSelectedAreaId(undefined)
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">Receita</SelectItem>
                <SelectItem value="expense">Despesa</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && <p className="text-sm text-expense mt-1">{errors.type.message}</p>}
          </div>

          {categoryType === "expense" && (
            <>
              <div>
                <Label htmlFor="areaId" className="mb-2 block flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Área
                </Label>
                <Select value={selectedAreaId || "none"} onValueChange={handleAreaChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma área (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhuma área</SelectItem>
                    {areas
                      ?.filter((area) => area.status === "active")
                      .map((area) => (
                        <SelectItem key={area.id} value={area.id}>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: area.color }} />
                            <span>{area.icon}</span>
                            <span>{area.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="categoryGroupId" className="mb-2 block flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Grupo Categoria
                </Label>
                <Select
                  value={watch("categoryGroupId") || "none"}
                  onValueChange={(v) =>
                    setValue("categoryGroupId", v === "none" ? undefined : v, { shouldDirty: true })
                  }
                  disabled={!selectedAreaId}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={selectedAreaId ? "Selecione um grupo categoria" : "Selecione uma área primeiro"}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum grupo</SelectItem>
                    {availableCategoryGroups.map((group) => (
                      <SelectItem key={group.id} value={group.id}>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: group.color }} />
                          <span>{group.icon}</span>
                          <span>{group.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.categoryGroupId && (
                  <p className="text-sm text-expense mt-1">{errors.categoryGroupId.message}</p>
                )}
              </div>

              {(selectedArea || selectedCategoryGroup) && (
                <Card className="bg-accent">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Hierarquia:</span>
                      {selectedArea && (
                        <>
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedArea.color }} />
                            <span>{selectedArea.icon}</span>
                            <span className="font-medium">{selectedArea.name}</span>
                          </div>
                          {selectedCategoryGroup && <ChevronRight className="h-3 w-3 text-muted-foreground" />}
                        </>
                      )}
                      {selectedCategoryGroup && (
                        <>
                          <div className="flex items-center gap-1">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: selectedCategoryGroup.color }}
                            />
                            <span>{selectedCategoryGroup.icon}</span>
                            <span className="font-medium">{selectedCategoryGroup.name}</span>
                          </div>
                          <ChevronRight className="h-3 w-3 text-muted-foreground" />
                          <span className="font-medium">{watch("name") || "Nova Categoria"}</span>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          <div>
            <Label htmlFor="description" className="mb-2 block">
              Descrição
            </Label>
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
