"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useBudgetGroups } from "@/hooks/use-budget-groups"
import { useCategories } from "@/hooks/use-categories"
import { budgetGroupSchema, type BudgetGroupFormData } from "@/lib/shared/validations"
import type { BudgetGroup } from "@/lib/shared/types"
import { DynamicIcon } from "@/components/ui/dynamic-icon"
import { PRESET_ICONS, ICON_DISPLAY_NAMES } from "@/lib/shared/icon-mapping"
import { Loader2, Palette } from "lucide-react"

interface BudgetGroupFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  budgetGroup?: BudgetGroup | null
}

const PRESET_COLORS = [
  "#3B82F6", // Blue
  "#10B981", // Emerald
  "#F59E0B", // Amber
  "#EF4444", // Red
  "#8B5CF6", // Violet
  "#06B6D4", // Cyan
  "#84CC16", // Lime
  "#F97316", // Orange
  "#EC4899", // Pink
  "#6B7280", // Gray
]

const PRESET_ICONS_FOR_FORM = PRESET_ICONS

export function BudgetGroupFormModal({ open, onOpenChange, budgetGroup }: BudgetGroupFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])

  const { createBudgetGroup, updateBudgetGroup } = useBudgetGroups()
  const { categories } = useCategories()

  const form = useForm<BudgetGroupFormData>({
    resolver: zodResolver(budgetGroupSchema),
    defaultValues: {
      name: "",
      description: "",
      color: PRESET_COLORS[0],
      icon: PRESET_ICONS_FOR_FORM[0],
      status: "active",
      categoryIds: [],
    },
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = form
  const watchedColor = watch("color")
  const watchedIcon = watch("icon")

  useEffect(() => {
    if (open) {
      if (budgetGroup) {
        reset({
          name: budgetGroup.name,
          description: budgetGroup.description || "",
          color: budgetGroup.color,
          icon: budgetGroup.icon,
          status: budgetGroup.status,
          categoryIds: budgetGroup.categoryIds || [],
        })
        setSelectedCategories(budgetGroup.categoryIds || [])
      } else {
        reset({
          name: "",
          description: "",
          color: PRESET_COLORS[0],
          icon: PRESET_ICONS_FOR_FORM[0],
          status: "active",
          categoryIds: [],
        })
        setSelectedCategories([])
      }
    }
  }, [open, budgetGroup, reset])

  const onSubmit = async (data: BudgetGroupFormData) => {
    setIsSubmitting(true)
    try {
      const formData = { ...data, categoryIds: selectedCategories }

      if (budgetGroup) {
        await updateBudgetGroup(budgetGroup.id, formData)
      } else {
        await createBudgetGroup(formData)
      }

      onOpenChange(false)
    } catch (error) {
      console.error("Erro ao salvar grupo orçamentário:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId],
    )
  }

  const availableCategories = categories?.filter((cat) => cat.type === "expense") || []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" key={budgetGroup?.id || "new"}>
        <DialogHeader>
          <DialogTitle>{budgetGroup ? "Editar Grupo Orçamentário" : "Novo Grupo Orçamentário"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="mb-2 block">
                Nome *
              </Label>
              <Input id="name" {...register("name")} placeholder="Ex: Moradia, Transporte..." />
              {errors.name && <p className="text-sm text-expense">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status" className="mb-2 block">
                Status *
              </Label>
              <Select
                value={watch("status")}
                onValueChange={(value: "active" | "inactive") => setValue("status", value, { shouldDirty: true })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
                </SelectContent>
              </Select>
              {errors.status && <p className="text-sm text-expense">{errors.status.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="mb-2 block">
              Descrição
            </Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Descreva o propósito deste grupo orçamentário..."
              rows={3}
            />
          </div>

          {/* Visual Customization */}
          <div className="grid grid-cols-2 gap-6">
            {/* Color Selection */}
            <div className="space-y-3">
              <Label className="mb-2 block flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Cor do Grupo *
              </Label>
              <div className="grid grid-cols-5 gap-2">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`w-10 h-10 rounded-lg border-2 transition-all ${
                      watchedColor === color ? "border-foreground scale-110" : "border"
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setValue("color", color, { shouldDirty: true })}
                  />
                ))}
              </div>
              {errors.color && <p className="text-sm text-expense">{errors.color.message}</p>}
            </div>

            {/* Icon Selection */}
            <div className="space-y-3">
              <Label className="mb-2 block">Ícone do Grupo *</Label>
              <div className="grid grid-cols-5 gap-2">
                {PRESET_ICONS_FOR_FORM.map((iconName) => (
                  <button
                    key={iconName}
                    type="button"
                    className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center transition-all ${
                      watchedIcon === iconName ? "border-foreground bg-accent" : "border hover:bg-accent"
                    }`}
                    onClick={() => setValue("icon", iconName, { shouldDirty: true })}
                    title={ICON_DISPLAY_NAMES[iconName] || iconName}
                  >
                    <DynamicIcon iconName={iconName} size={18} />
                  </button>
                ))}
              </div>
              {errors.icon && <p className="text-sm text-expense">{errors.icon.message}</p>}
            </div>
          </div>

          {/* Preview */}
          <Card className="bg-accent">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground">Preview do Grupo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl"
                  style={{ backgroundColor: watchedColor }}
                >
                  <DynamicIcon iconName={watchedIcon} size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">{watch("name") || "Nome do Grupo"}</h3>
                  <p className="text-sm text-muted-foreground">{watch("description") || "Descrição do grupo"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Categories Association */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Categorias Associadas</CardTitle>
              <p className="text-sm text-muted-foreground">Selecione as categorias de despesa que pertencem a este grupo</p>
            </CardHeader>
            <CardContent className="space-y-3">
              {availableCategories.length > 0 ? (
                <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
                  {availableCategories.map((category) => (
                    <div key={category.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-accent">
                      <Checkbox
                        id={`category-${category.id}`}
                        checked={selectedCategories.includes(category.id)}
                        onCheckedChange={() => handleCategoryToggle(category.id)}
                      />
                      <Label htmlFor={`category-${category.id}`} className="flex-1 cursor-pointer">
                        <div className="flex items-center justify-between">
                          <span>{category.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {category.type === "income" ? "Receita" : "Despesa"}
                          </Badge>
                        </div>
                        {category.description && <p className="text-xs text-muted-foreground mt-1">{category.description}</p>}
                      </Label>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">Nenhuma categoria de despesa disponível</p>
              )}

              {selectedCategories.length > 0 && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-sm text-muted-foreground mb-2">{selectedCategories.length} categoria(s) selecionada(s)</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary/90">
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {budgetGroup ? "Atualizar" : "Criar"} Grupo
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
