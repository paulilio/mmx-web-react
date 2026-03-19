import type {
  CategoryGroupRecord,
  DomainCategoryGroupStatus,
} from "@/modules/category-groups/domain/category-group.types"

export function parseCategoryGroupStatus(value: unknown): DomainCategoryGroupStatus | undefined {
  if (value == null) {
    return undefined
  }

  if (typeof value !== "string") {
    throw new Error("Status do grupo invalido")
  }

  const normalized = value.trim().toUpperCase()

  if (normalized === "ACTIVE") return "ACTIVE"
  if (normalized === "INACTIVE") return "INACTIVE"

  throw new Error("Status do grupo invalido")
}

function toClientStatus(status: DomainCategoryGroupStatus): "active" | "inactive" {
  return status === "ACTIVE" ? "active" : "inactive"
}

export function mapCategoryGroup(record: CategoryGroupRecord) {
  return {
    id: record.id,
    userId: record.userId,
    name: record.name,
    description: record.description,
    color: record.color,
    icon: record.icon,
    status: toClientStatus(record.status),
    areaId: record.areaId,
    categoryIds: record.categoryIds ?? [],
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  }
}
