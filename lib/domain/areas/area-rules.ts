import type { DomainAreaStatus, DomainAreaType } from "./area-entity"

export function validateAreaName(name: string) {
  if (!name || !name.trim()) {
    throw new Error("Nome da area e obrigatorio")
  }
}

export function validateAreaColor(color: string) {
  if (!color || !color.trim()) {
    throw new Error("Cor da area e obrigatoria")
  }
}

export function validateAreaIcon(icon: string) {
  if (!icon || !icon.trim()) {
    throw new Error("Icone da area e obrigatorio")
  }
}

export function normalizeAreaType(value: string): DomainAreaType {
  const normalized = value.trim().toLowerCase()

  if (normalized === "income") return "INCOME"
  if (normalized === "expense") return "EXPENSE"
  if (normalized === "fixed-expenses" || normalized === "fixedexpenses") return "FIXED_EXPENSES"
  if (normalized === "daily-expenses" || normalized === "dailyexpenses") return "DAILY_EXPENSES"
  if (normalized === "personal") return "PERSONAL"
  if (normalized === "taxes-fees" || normalized === "taxesfees") return "TAXES_FEES"

  throw new Error("Tipo da area invalido")
}

export function normalizeAreaStatus(value: string): DomainAreaStatus {
  const normalized = value.trim().toUpperCase()

  if (normalized === "ACTIVE") return "ACTIVE"
  if (normalized === "INACTIVE") return "INACTIVE"

  throw new Error("Status da area invalido")
}
