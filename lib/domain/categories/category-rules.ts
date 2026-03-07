import type { DomainCategoryStatus, DomainCategoryType } from "./category-entity"

export function validateCategoryName(name: string) {
  if (!name || !name.trim()) {
    throw new Error("Nome da categoria e obrigatorio")
  }
}

export function normalizeCategoryType(value: string): DomainCategoryType {
  const normalized = value.trim().toUpperCase()

  if (normalized === "INCOME") return "INCOME"
  if (normalized === "EXPENSE") return "EXPENSE"

  throw new Error("Tipo da categoria invalido")
}

export function normalizeCategoryStatus(value: string): DomainCategoryStatus {
  const normalized = value.trim().toUpperCase()

  if (normalized === "ACTIVE") return "ACTIVE"
  if (normalized === "INACTIVE") return "INACTIVE"

  throw new Error("Status da categoria invalido")
}
