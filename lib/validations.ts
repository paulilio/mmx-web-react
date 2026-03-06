import { z } from "zod"

export const contactSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().optional(),
  document: z.string().optional(),
  type: z.enum(["customer", "supplier"], {
    required_error: "Tipo é obrigatório",
  }),
})

export const categorySchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  type: z.enum(["income", "expense"], {
    required_error: "Tipo é obrigatório",
  }),
  categoryGroupId: z.string().optional(),
})

export const categoryGroupSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  color: z.string().min(1, "Cor é obrigatória"),
  icon: z.string().min(1, "Ícone é obrigatório"),
  status: z.enum(["active", "inactive"], {
    required_error: "Status é obrigatório",
  }),
  areaId: z.string().optional(),
})

export const areaSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  type: z.enum(["income", "fixed-expenses", "daily-expenses", "personal", "taxes-fees"], {
    required_error: "Tipo é obrigatório",
  }),
  color: z.string().min(1, "Cor é obrigatória"),
  icon: z.string().min(1, "Ícone é obrigatório"),
  status: z.enum(["active", "inactive"], {
    required_error: "Status é obrigatório",
  }),
})

export const budgetSchema = z.object({
  categoryGroupId: z.string().min(1, "Grupo categoria é obrigatório"),
  month: z.number().min(1).max(12),
  year: z.number().min(2020),
  planned: z.number().min(0, "Valor planejado deve ser positivo"),
  funded: z.number().min(0, "Valor financiado deve ser positivo"),
  rolloverEnabled: z.boolean().default(false),
  rolloverAmount: z.number().optional(),
})

export const fundTransferSchema = z.object({
  fromCategoryGroupId: z.string().min(1, "Grupo de origem é obrigatório"),
  toCategoryGroupId: z.string().min(1, "Grupo de destino é obrigatório"),
  amount: z.number().positive("Valor deve ser positivo"),
  month: z.number().min(1).max(12),
  year: z.number().min(2020),
})

export const recurrenceSchema = z
  .object({
    enabled: z.boolean(),
    frequency: z.enum(["daily", "weekly", "monthly", "yearly"]),
    interval: z.number().min(1).max(99).optional(),
    daysOfWeek: z
      .array(z.enum(["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]))
      .optional(),
    dayOfWeek: z.enum(["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]).optional(),
    dayOfMonth: z.number().min(1).max(31).optional(),
    count: z.number().min(1).max(99).optional(),
    endType: z.enum(["count", "date"]).optional(),
    endDate: z
      .string()
      .optional()
      .refine(
        (date) => {
          if (!date) return true
          // Accept both ISO format (YYYY-MM-DD) and PT-BR format (DD/MM/YYYY)
          const isoRegex = /^\d{4}-\d{2}-\d{2}$/
          const ptBrRegex = /^\d{2}\/\d{2}\/\d{4}$/
          return isoRegex.test(date) || ptBrRegex.test(date)
        },
        {
          message: "Data deve estar no formato dd/mm/aaaa ou YYYY-MM-DD",
        },
      ),
    weekOfMonth: z.enum(["first", "second", "third", "fourth", "last"]).optional(),
    monthOfYear: z.number().min(1).max(12).optional(),
    monthlyType: z.enum(["dayOfMonth", "weekOfMonth"]).optional(),
    generatedFrom: z.string().optional(),
    applyMode: z.enum(["single", "future", "all"]).optional(),
  })
  .refine(
    (data) => {
      if (data.enabled) {
        if (data.frequency === "weekly" && !data.dayOfWeek && (!data.daysOfWeek || data.daysOfWeek.length === 0)) {
          return false
        }
        if (data.frequency === "monthly" && !data.dayOfMonth) {
          return false
        }
        if (data.endType === "count" && data.count && data.count > 99) {
          return false
        }
        if (data.frequency === "weekly" && data.daysOfWeek && data.daysOfWeek.length > 7) {
          return false
        }
      }
      return true
    },
    {
      message: "Campos obrigatórios para recorrência não preenchidos ou limites excedidos",
    },
  )

export const transactionSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato da data deve ser YYYY-MM-DD"),
  amount: z.number().positive("Valor deve ser positivo"),
  categoryId: z.string().min(1, "Categoria é obrigatória"),
  description: z.string().optional(),
  type: z.enum(["income", "expense"], {
    required_error: "Tipo é obrigatório",
  }),
  status: z
    .enum(["pending", "completed", "cancelled"], {
      required_error: "Status é obrigatório",
    })
    .default("pending"),
  recurrence: recurrenceSchema.optional(),
  areaId: z.string().optional(),
  categoryGroupId: z.string().optional(),
})

export const associationSchema = z.object({
  areaId: z.string().min(1, "Área é obrigatória"),
  categoryGroupIds: z.array(z.string()).min(1, "Pelo menos um grupo categoria deve ser selecionado"),
})

export type ContactFormData = z.infer<typeof contactSchema>
export type CategoryFormData = z.infer<typeof categorySchema>
export type CategoryGroupFormData = z.infer<typeof categoryGroupSchema>
export type AreaFormData = z.infer<typeof areaSchema>
export type BudgetFormData = z.infer<typeof budgetSchema>
export type FundTransferFormData = z.infer<typeof fundTransferSchema>
export type TransactionFormData = z.infer<typeof transactionSchema>
export type AssociationFormData = z.infer<typeof associationSchema>

export const budgetGroupSchema = categoryGroupSchema
export const grupoCategoriaSchema = categoryGroupSchema
export type BudgetGroupFormData = CategoryGroupFormData
export type GrupoCategoriaFormData = CategoryGroupFormData
