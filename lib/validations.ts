import { z } from "zod"

export const entrySchema = z.object({
  type: z.enum(["payable", "receivable"], {
    required_error: "Tipo é obrigatório",
  }),
  contactId: z.string().min(1, "Contato é obrigatório"),
  categoryId: z.string().min(1, "Categoria é obrigatória"),
  description: z.string().min(1, "Descrição é obrigatória"),
  issueDate: z.string().min(1, "Data de emissão é obrigatória"),
  dueDate: z.string().min(1, "Data de vencimento é obrigatória"),
  amount: z.number().positive("Valor deve ser positivo"),
  currency: z.literal("BRL"),
  notes: z.string().optional(),
})

export const paymentSchema = z.object({
  amount: z.number().positive("Valor deve ser positivo"),
  paidAt: z.string().min(1, "Data do pagamento é obrigatória"),
  method: z.enum(["pix", "boleto", "cartao", "transf"], {
    required_error: "Método de pagamento é obrigatório",
  }),
  note: z.string().optional(),
})

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
})

export type EntryFormData = z.infer<typeof entrySchema>
export type PaymentFormData = z.infer<typeof paymentSchema>
export type ContactFormData = z.infer<typeof contactSchema>
export type CategoryFormData = z.infer<typeof categorySchema>
