export type { DomainAreaType, DomainAreaStatus } from "./area-entity"

export interface AreaRecord {
  id: string
  userId: string
  name: string
  description?: string | null
  type: import("./area-entity").DomainAreaType
  color: string
  icon: string
  status: import("./area-entity").DomainAreaStatus
  createdAt: Date
  updatedAt: Date
}

export interface CreateAreaRecordInput {
  userId: string
  name: string
  description?: string | null
  type: import("./area-entity").DomainAreaType
  color: string
  icon: string
  status: import("./area-entity").DomainAreaStatus
}

export interface UpdateAreaRecordInput {
  name?: string
  description?: string | null
  type?: import("./area-entity").DomainAreaType
  color?: string
  icon?: string
  status?: import("./area-entity").DomainAreaStatus
}

export interface AreaFilters {
  userId: string
  type?: import("./area-entity").DomainAreaType
  status?: import("./area-entity").DomainAreaStatus
}
