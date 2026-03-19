import {
  normalizeContactStatus,
  normalizeContactType,
  validateContactEmail,
  validateContactName,
} from "./contact-rules"

export type DomainContactType = "CUSTOMER" | "SUPPLIER"
export type DomainContactStatus = "ACTIVE" | "INACTIVE"

export interface ContactEntityProps {
  userId: string
  name: string
  email?: string | null
  phone?: string | null
  identifier?: string | null
  type: DomainContactType
  status: DomainContactStatus
}

export interface CreateContactEntityInput {
  userId: string
  name: string
  email?: string | null
  phone?: string | null
  identifier?: string | null
  type: string
  status?: string
}

export interface UpdateContactEntityInput {
  name?: string
  email?: string | null
  phone?: string | null
  identifier?: string | null
  type?: string
  status?: string
}

export interface ContactEntityUpdatePayload {
  name?: string
  email?: string | null
  phone?: string | null
  identifier?: string | null
  type?: DomainContactType
  status?: DomainContactStatus
}

export class ContactEntity {
  constructor(private readonly props: ContactEntityProps) {}

  static create(input: CreateContactEntityInput): ContactEntity {
    validateContactName(input.name)
    validateContactEmail(input.email)

    return new ContactEntity({
      userId: input.userId,
      name: input.name.trim(),
      email: input.email?.trim() || null,
      phone: input.phone?.trim() || null,
      identifier: input.identifier?.trim() || null,
      type: normalizeContactType(input.type),
      status: input.status ? normalizeContactStatus(input.status) : "ACTIVE",
    })
  }

  static fromRecord(record: ContactEntityProps): ContactEntity {
    return new ContactEntity(record)
  }

  get value(): ContactEntityProps {
    return this.props
  }

  buildUpdatePayload(input: UpdateContactEntityInput): ContactEntityUpdatePayload {
    if (typeof input.name === "string") {
      validateContactName(input.name)
    }

    validateContactEmail(input.email)

    return {
      name: input.name?.trim(),
      email: input.email != null ? input.email.trim() || null : undefined,
      phone: input.phone != null ? input.phone.trim() || null : undefined,
      identifier: input.identifier != null ? input.identifier.trim() || null : undefined,
      type: input.type ? normalizeContactType(input.type) : undefined,
      status: input.status ? normalizeContactStatus(input.status) : undefined,
    }
  }
}
