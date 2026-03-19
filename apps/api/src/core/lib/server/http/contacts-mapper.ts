import type {
  DomainContactStatus,
  DomainContactType,
} from "@/modules/contacts/domain/contact-entity"

interface ContactLikeRecord {
  id: string
  userId: string
  name: string
  email?: string | null
  phone?: string | null
  identifier?: string | null
  type: DomainContactType
  status: DomainContactStatus
  createdAt: Date
  updatedAt: Date
}

export function parseContactType(value: unknown): DomainContactType | undefined {
  if (value == null) {
    return undefined
  }

  if (typeof value !== "string") {
    throw new Error("Tipo do contato invalido")
  }

  const normalized = value.trim().toUpperCase()

  if (normalized === "CUSTOMER") return "CUSTOMER"
  if (normalized === "SUPPLIER") return "SUPPLIER"

  throw new Error("Tipo do contato invalido")
}

export function parseContactStatus(value: unknown): DomainContactStatus | undefined {
  if (value == null) {
    return undefined
  }

  if (typeof value !== "string") {
    throw new Error("Status do contato invalido")
  }

  const normalized = value.trim().toUpperCase()

  if (normalized === "ACTIVE") return "ACTIVE"
  if (normalized === "INACTIVE") return "INACTIVE"

  throw new Error("Status do contato invalido")
}

function toClientType(value: DomainContactType): "customer" | "supplier" {
  return value === "CUSTOMER" ? "customer" : "supplier"
}

function toClientStatus(value: DomainContactStatus): "active" | "inactive" {
  return value === "ACTIVE" ? "active" : "inactive"
}

export function mapContact(contact: ContactLikeRecord) {
  return {
    id: contact.id,
    userId: contact.userId,
    name: contact.name,
    email: contact.email,
    phone: contact.phone,
    identifier: contact.identifier,
    document: contact.identifier,
    type: toClientType(contact.type),
    status: toClientStatus(contact.status),
    createdAt: contact.createdAt.toISOString(),
    updatedAt: contact.updatedAt.toISOString(),
  }
}
