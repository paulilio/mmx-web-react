import {
  ContactEntity,
  type ContactEntityProps,
  type CreateContactEntityInput,
  type UpdateContactEntityInput,
} from "../../domain/contacts/contact-entity"
import type { PaginatedResult } from "../repositories/base-repository"
import type {
  ContactFilters,
  ContactRecord,
  ContactRepository,
} from "../repositories/contact-repository"

function toEntityProps(record: ContactRecord): ContactEntityProps {
  return {
    userId: record.userId,
    name: record.name,
    email: record.email,
    phone: record.phone,
    identifier: record.identifier,
    type: record.type,
    status: record.status,
  }
}

export class ContactService {
  constructor(private readonly repository: ContactRepository) {}

  async list(
    filters: ContactFilters,
    pagination?: { page?: number; pageSize?: number },
  ): Promise<PaginatedResult<ContactRecord>> {
    return this.repository.findMany(filters, pagination)
  }

  async getById(id: string, userId: string): Promise<ContactRecord | null> {
    return this.repository.findById(id, userId)
  }

  async create(input: CreateContactEntityInput): Promise<ContactRecord> {
    const entity = ContactEntity.create(input)

    return this.repository.create({
      userId: entity.value.userId,
      name: entity.value.name,
      email: entity.value.email,
      phone: entity.value.phone,
      identifier: entity.value.identifier,
      type: entity.value.type,
      status: entity.value.status,
    })
  }

  async update(id: string, userId: string, input: UpdateContactEntityInput): Promise<ContactRecord> {
    const existing = await this.repository.findById(id, userId)

    if (!existing) {
      throw new Error("Contato nao encontrado para este usuario")
    }

    const entity = ContactEntity.fromRecord(toEntityProps(existing))
    const data = entity.buildUpdatePayload(input)

    const updated = await this.repository.update(id, userId, data)

    if (!updated) {
      throw new Error("Contato nao encontrado para este usuario")
    }

    return updated
  }

  async remove(id: string, userId: string): Promise<ContactRecord> {
    const deleted = await this.repository.delete(id, userId)

    if (!deleted) {
      throw new Error("Contato nao encontrado para este usuario")
    }

    return deleted
  }
}
