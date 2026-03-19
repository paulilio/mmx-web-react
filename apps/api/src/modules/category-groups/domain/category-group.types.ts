export type DomainCategoryGroupStatus = "ACTIVE" | "INACTIVE"

export interface CategoryGroupRecord {
  id: string
  userId: string
  name: string
  description?: string | null
  color: string
  icon: string
  status: DomainCategoryGroupStatus
  areaId?: string | null
  categoryIds?: string[]
  createdAt: Date
  updatedAt: Date
}

export interface CreateCategoryGroupRecordInput {
  userId: string
  name: string
  description?: string | null
  color: string
  icon: string
  status?: DomainCategoryGroupStatus
  areaId?: string | null
  categoryIds?: string[]
}

export interface CategoryGroupFilters {
  userId: string
  status?: DomainCategoryGroupStatus
  areaId?: string
  name?: string
}

export interface UpdateCategoryGroupRecordInput {
  name?: string
  description?: string | null
  color?: string
  icon?: string
  status?: DomainCategoryGroupStatus
  areaId?: string | null
  categoryIds?: string[]
}
