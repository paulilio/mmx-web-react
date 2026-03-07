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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useCategoryGroups } from "@/hooks/use-category-groups"
import { useAreas } from "@/hooks/use-areas"
import { categoryGroupSchema, type CategoryGroupFormData } from "@/lib/shared/validations"
import type { CategoryGroup } from "@/lib/shared/types"
import { Loader2, Palette } from "lucide-react"
import { PRESET_ICONS, ICON_DISPLAY_NAMES } from "@/lib/shared/icon-mapping"
import { DynamicIcon } from "@/components/ui/dynamic-icon"

interface CategoryGroupFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  categoryGroup?: CategoryGroup | null
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

export function CategoryGroupFormModal({ open, onOpenChange, categoryGroup }: CategoryGroupFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { createCategoryGroup, updateCategoryGroup } = useCategoryGroups()
  const { areas } = useAreas()

  const form = useForm<CategoryGroupFormData>({
    resolver: zodResolver(categoryGroupSchema),
    defaultValues: {
      name: "",
      description: "",
      color: PRESET_COLORS[0],
      icon: PRESET_ICONS[0],
      status: "active",
      areaId: undefined,
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
      if (categoryGroup) {
        reset({
          name: categoryGroup.name,
          description: categoryGroup.description || "",
          color: categoryGroup.color,
          icon: categoryGroup.icon,
          status: categoryGroup.status,
          areaId: categoryGroup.areaId,
        })
      } else {
        reset({
          name: "",
          description: "",
          color: PRESET_COLORS[0],
          icon: PRESET_ICONS[0],
          status: "active",
          areaId: undefined,
        })
      }
    }
  }, [open, categoryGroup, reset])

  const onSubmit = async (data: CategoryGroupFormData) => {
    setIsSubmitting(true)
    try {
      if (categoryGroup) {
        await updateCategoryGroup(categoryGroup.id, data)
      } else {
        await createCategoryGroup(data)
      }

      onOpenChange(false)
    } catch (error) {
      console.error("Erro ao salvar grupo categoria:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getAreaName = (areaId?: string) => {
    if (!areaId) return "Nenhuma área selecionada"
    const area = areas?.find((a) => a.id === areaId)
    return area?.name || "Área não encontrada"
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" key={categoryGroup?.id || "new"}>
        <DialogHeader>
          <DialogTitle>{categoryGroup ? "Editar Grupo Categoria" : "Novo Grupo Categoria"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="mb-2 block">
                Nome *
              </Label>
              <Input id="name" {...register("name")} placeholder="Ex: Moradia, Transporte..." />
              {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
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
              {errors.status && <p className="text-sm text-red-600">{errors.status.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="mb-2 block">
              Descrição
            </Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Descreva o propósito deste grupo categoria..."
              rows={3}
            />
          </div>

          {/* Area Association */}
          <div className="space-y-2">
            <Label htmlFor="areaId" className="mb-2 block">
              Área Associada
            </Label>
            <Select
              value={watch("areaId") || "none"}
              onValueChange={(value) => setValue("areaId", value === "none" ? undefined : value, { shouldDirty: true })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma área" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhuma área</SelectItem>
                {areas?.map((area) => (
                  <SelectItem key={area.id} value={area.id}>
                    {area.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.areaId && <p className="text-sm text-red-600">{errors.areaId.message}</p>}
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
                      watchedColor === color ? "border-slate-400 scale-110" : "border-slate-200"
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setValue("color", color, { shouldDirty: true })}
                  />
                ))}
              </div>
              {errors.color && <p className="text-sm text-red-600">{errors.color.message}</p>}
            </div>

            {/* Icon Selection */}
            <div className="space-y-3">
              <Label className="mb-2 block">Ícone do Grupo *</Label>
              <div className="grid grid-cols-5 gap-2">
                {PRESET_ICONS.map((iconName) => (
                  <button
                    key={iconName}
                    type="button"
                    className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center transition-all ${
                      watchedIcon === iconName ? "border-slate-400 bg-slate-50" : "border-slate-200 hover:bg-slate-50"
                    }`}
                    onClick={() => setValue("icon", iconName, { shouldDirty: true })}
                    title={ICON_DISPLAY_NAMES[iconName] || iconName}
                  >
                    <DynamicIcon iconName={iconName} size={20} />
                  </button>
                ))}
              </div>
              {errors.icon && <p className="text-sm text-red-600">{errors.icon.message}</p>}
            </div>
          </div>

          {/* Preview */}
          <Card className="bg-slate-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-slate-600">Preview do Grupo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-white"
                  style={{ backgroundColor: watchedColor }}
                >
                  <DynamicIcon iconName={watchedIcon} size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">{watch("name") || "Nome do Grupo"}</h3>
                  <p className="text-sm text-slate-600">{watch("description") || "Descrição do grupo"}</p>
                  <p className="text-xs text-slate-500 mt-1">Área: {getAreaName(watch("areaId"))}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {categoryGroup ? "Atualizar" : "Criar"} Grupo
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
