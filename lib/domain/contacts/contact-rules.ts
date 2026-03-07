import type { DomainContactStatus, DomainContactType } from "./contact-entity"

export function validateContactName(name: string) {
  if (!name || !name.trim()) {
    throw new Error("Nome do contato e obrigatorio")
  }
}

export function normalizeContactType(value: string): DomainContactType {
  const normalized = value.trim().toUpperCase()

  if (normalized === "CUSTOMER") return "CUSTOMER"
  if (normalized === "SUPPLIER") return "SUPPLIER"

  throw new Error("Tipo do contato invalido")
}

export function normalizeContactStatus(value: string): DomainContactStatus {
  const normalized = value.trim().toUpperCase()

  if (normalized === "ACTIVE") return "ACTIVE"
  if (normalized === "INACTIVE") return "INACTIVE"

  throw new Error("Status do contato invalido")
}

export function validateContactEmail(email?: string | null) {
  if (!email) {
    return
  }

  const normalized = email.trim()
  if (!normalized) {
    return
  }

  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)
  if (!isValid) {
    throw new Error("Email do contato invalido")
  }
}
