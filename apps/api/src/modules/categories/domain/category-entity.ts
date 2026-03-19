import {
  normalizeCategoryStatus,
  normalizeCategoryType,
  validateCategoryName,
} from "./category-rules"

export type DomainCategoryType = "INCOME" | "EXPENSE"
export type DomainCategoryStatus = "ACTIVE" | "INACTIVE"

export interface CategoryEntityProps {
  userId: string
  name: string
  description?: string | null
  type: DomainCategoryType
  categoryGroupId?: string | null
  areaId?: string | null
  status: DomainCategoryStatus
}

export interface CreateCategoryEntityInput {
  userId: string
  name: string
  description?: string | null
  type: string
  categoryGroupId?: string | null
  areaId?: string | null
  status?: string
}

export interface UpdateCategoryEntityInput {
  name?: string
  description?: string | null
  type?: string
  categoryGroupId?: string | null
  areaId?: string | null
  status?: string
}

export interface CategoryEntityUpdatePayload {
  name?: string
  description?: string | null
  type?: DomainCategoryType
  categoryGroupId?: string | null
  areaId?: string | null
  status?: DomainCategoryStatus
}

export class CategoryEntity {
  constructor(private readonly props: CategoryEntityProps) {}

  static create(input: CreateCategoryEntityInput): CategoryEntity {
    validateCategoryName(input.name)

    return new CategoryEntity({
      userId: input.userId,
      name: input.name.trim(),
      description: input.description,
      type: normalizeCategoryType(input.type),
      categoryGroupId: input.categoryGroupId,
      areaId: input.areaId,
      status: input.status ? normalizeCategoryStatus(input.status) : "ACTIVE",
    })
  }

  static fromRecord(record: CategoryEntityProps): CategoryEntity {
    return new CategoryEntity(record)
  }

  get value(): CategoryEntityProps {
    return this.props
  }

  buildUpdatePayload(input: UpdateCategoryEntityInput): CategoryEntityUpdatePayload {
    if (typeof input.name === "string") {
      validateCategoryName(input.name)
    }

    return {
      name: input.name?.trim(),
      description: input.description,
      type: input.type ? normalizeCategoryType(input.type) : undefined,
      categoryGroupId: input.categoryGroupId,
      areaId: input.areaId,
      status: input.status ? normalizeCategoryStatus(input.status) : undefined,
    }
  }
}
