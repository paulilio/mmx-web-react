export type EntryType = "payable" | "receivable"
export type EntryStatus = "open" | "partial" | "paid" | "canceled"
export type PaymentMethod = "pix" | "boleto" | "cartao" | "transf"

export interface Entry {
  id: string
  type: EntryType
  contactId: string
  categoryId: string
  description: string
  issueDate: string
  dueDate: string
  amount: number
  currency: "BRL"
  status: EntryStatus
  tags: string[]
  notes?: string | null
}

export interface Payment {
  id: string
  entryId: string
  paidAt: string
  amount: number
  method: PaymentMethod
  note?: string | null
}

export interface Contact {
  id: string
  name: string
  email?: string
  phone?: string
  document?: string
  type: "customer" | "supplier"
}

export interface Category {
  id: string
  name: string
  description?: string
  type: "income" | "expense"
}

export interface AgingReport {
  overdue: number
  next7Days: number
  next30Days: number
  future: number
}

export interface CashflowData {
  date: string
  income: number
  expense: number
  balance: number
}
