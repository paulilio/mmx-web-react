import type { NextRequest } from "next/server"
import { resolveAuthenticatedUserId } from "../security/auth-identity"
import type {
  DomainCategoryStatus,
  DomainCategoryType,
} from "@/lib/domain/categories/category-entity"

interface CategoryLikeRecord {
  id: string
  userId: string
  name: string
  description?: string | null
  type: DomainCategoryType
  categoryGroupId?: string | null
  areaId?: string | null
  status: DomainCategoryStatus
  createdAt: Date
  updatedAt: Date
}

export function resolveUserId(request: NextRequest, bodyUserId?: string): string | null {
  const authenticatedUserId = resolveAuthenticatedUserId(request)
  if (authenticatedUserId) {
    return authenticatedUserId
  }

  if (process.env.NODE_ENV !== "test") {
    return null
  }

  const queryUserId = request.nextUrl.searchParams.get("userId")
  const headerUserId = request.headers.get("x-user-id")
  return bodyUserId ?? queryUserId ?? headerUserId
}

export function parseCategoryType(value: unknown): DomainCategoryType | undefined {
  if (value == null) {
    return undefined
  }

  if (typeof value !== "string") {
    throw new Error("Tipo da categoria invalido")
  }

  const normalized = value.trim().toUpperCase()

  if (normalized === "INCOME") return "INCOME"
  if (normalized === "EXPENSE") return "EXPENSE"

  throw new Error("Tipo da categoria invalido")
}

export function parseCategoryStatus(value: unknown): DomainCategoryStatus | undefined {
  if (value == null) {
    return undefined
  }

  if (typeof value !== "string") {
    throw new Error("Status da categoria invalido")
  }

  const normalized = value.trim().toUpperCase()

  if (normalized === "ACTIVE") return "ACTIVE"
  if (normalized === "INACTIVE") return "INACTIVE"

  throw new Error("Status da categoria invalido")
}

function toClientType(value: DomainCategoryType): "income" | "expense" {
  return value === "INCOME" ? "income" : "expense"
}

function toClientStatus(value: DomainCategoryStatus): "active" | "inactive" {
  return value === "ACTIVE" ? "active" : "inactive"
}

export function mapCategory(category: CategoryLikeRecord) {
  return {
    id: category.id,
    userId: category.userId,
    name: category.name,
    description: category.description,
    type: toClientType(category.type),
    categoryGroupId: category.categoryGroupId,
    areaId: category.areaId,
    status: toClientStatus(category.status),
    createdAt: category.createdAt.toISOString(),
    updatedAt: category.updatedAt.toISOString(),
  }
}
