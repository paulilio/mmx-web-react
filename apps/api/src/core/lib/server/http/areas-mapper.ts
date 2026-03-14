import type { DomainAreaStatus, DomainAreaType } from "@/modules/areas/domain/area-entity"

interface AreaLikeRecord {
  id: string
  userId: string
  name: string
  description?: string | null
  type: DomainAreaType
  color: string
  icon: string
  status: DomainAreaStatus
  createdAt: Date
  updatedAt: Date
}

export function parseAreaType(value: unknown): DomainAreaType | undefined {
  if (value == null) {
    return undefined
  }

  if (typeof value !== "string") {
    throw new Error("Tipo da area invalido")
  }

  const normalized = value.trim().toLowerCase()

  if (normalized === "income") return "INCOME"
  if (normalized === "expense") return "EXPENSE"
  if (normalized === "fixed-expenses" || normalized === "fixedexpenses") return "FIXED_EXPENSES"
  if (normalized === "daily-expenses" || normalized === "dailyexpenses") return "DAILY_EXPENSES"
  if (normalized === "personal") return "PERSONAL"
  if (normalized === "taxes-fees" || normalized === "taxesfees") return "TAXES_FEES"

  throw new Error("Tipo da area invalido")
}

export function parseAreaStatus(value: unknown): DomainAreaStatus | undefined {
  if (value == null) {
    return undefined
  }

  if (typeof value !== "string") {
    throw new Error("Status da area invalido")
  }

  const normalized = value.trim().toUpperCase()

  if (normalized === "ACTIVE") return "ACTIVE"
  if (normalized === "INACTIVE") return "INACTIVE"

  throw new Error("Status da area invalido")
}

function toClientType(value: DomainAreaType): "income" | "expense" | "fixed-expenses" | "daily-expenses" | "personal" | "taxes-fees" {
  if (value === "INCOME") return "income"
  if (value === "EXPENSE") return "expense"
  if (value === "FIXED_EXPENSES") return "fixed-expenses"
  if (value === "DAILY_EXPENSES") return "daily-expenses"
  if (value === "PERSONAL") return "personal"
  return "taxes-fees"
}

function toClientStatus(value: DomainAreaStatus): "active" | "inactive" {
  return value === "ACTIVE" ? "active" : "inactive"
}

export function mapArea(area: AreaLikeRecord) {
  return {
    id: area.id,
    userId: area.userId,
    name: area.name,
    description: area.description,
    type: toClientType(area.type),
    color: area.color,
    icon: area.icon,
    status: toClientStatus(area.status),
    createdAt: area.createdAt.toISOString(),
    updatedAt: area.updatedAt.toISOString(),
  }
}
