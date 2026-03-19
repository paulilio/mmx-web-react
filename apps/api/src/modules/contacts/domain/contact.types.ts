export type { DomainContactType, DomainContactStatus } from "./contact-entity"

export interface ContactRecord {
  id: string
  userId: string
  name: string
  email?: string | null
  phone?: string | null
  identifier?: string | null
  type: import("./contact-entity").DomainContactType
  status: import("./contact-entity").DomainContactStatus
  createdAt: Date
  updatedAt: Date
}

export interface CreateContactRecordInput {
  userId: string
  name: string
  email?: string | null
  phone?: string | null
  identifier?: string | null
  type: import("./contact-entity").DomainContactType
  status: import("./contact-entity").DomainContactStatus
}

export interface UpdateContactRecordInput {
  name?: string
  email?: string | null
  phone?: string | null
  identifier?: string | null
  type?: import("./contact-entity").DomainContactType
  status?: import("./contact-entity").DomainContactStatus
}

export interface ContactFilters {
  userId: string
  type?: import("./contact-entity").DomainContactType
  status?: import("./contact-entity").DomainContactStatus
  name?: string
}
