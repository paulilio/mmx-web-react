export type { DomainCategoryType, DomainCategoryStatus } from "./category-entity"

export interface CategoryRecord {
  id: string
  userId: string
  name: string
  description?: string | null
  type: import("./category-entity").DomainCategoryType
  categoryGroupId?: string | null
  areaId?: string | null
  status: import("./category-entity").DomainCategoryStatus
  createdAt: Date
  updatedAt: Date
}

export interface CreateCategoryRecordInput {
  userId: string
  name: string
  description?: string | null
  type: import("./category-entity").DomainCategoryType
  categoryGroupId?: string | null
  areaId?: string | null
  status: import("./category-entity").DomainCategoryStatus
}

export interface UpdateCategoryRecordInput {
  name?: string
  description?: string | null
  type?: import("./category-entity").DomainCategoryType
  categoryGroupId?: string | null
  areaId?: string | null
  status?: import("./category-entity").DomainCategoryStatus
}

export interface CategoryFilters {
  userId: string
  type?: import("./category-entity").DomainCategoryType
  status?: import("./category-entity").DomainCategoryStatus
  categoryGroupId?: string
  areaId?: string
}
