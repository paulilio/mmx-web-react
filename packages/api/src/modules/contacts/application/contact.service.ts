import { Injectable, Inject } from "@nestjs/common"
import {
  ContactEntity,
  type ContactEntityProps,
  type CreateContactEntityInput,
  type UpdateContactEntityInput,
} from "../domain/contact-entity"
import type { PaginatedResult } from "@/common/types/pagination.types"
import { CONTACT_REPOSITORY, type IContactRepository } from "./ports/contact-repository.port"
import type { ContactRecord, ContactFilters } from "../domain/contact.types"

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

@Injectable()
export class ContactApplicationService {
  constructor(
    @Inject(CONTACT_REPOSITORY) private readonly repo: IContactRepository,
  ) {}

  async list(
    filters: ContactFilters,
    pagination?: { page?: number; pageSize?: number },
  ): Promise<PaginatedResult<ContactRecord>> {
    return this.repo.findMany(filters, pagination)
  }

  async getById(id: string, userId: string): Promise<ContactRecord | null> {
    return this.repo.findById(id, userId)
  }

  async create(input: CreateContactEntityInput): Promise<ContactRecord> {
    const entity = ContactEntity.create(input)

    return this.repo.create({
      userId: entity.value.userId,
      name: entity.value.name,
      email: entity.value.email,
      phone: entity.value.phone,
      identifier: entity.value.identifier,
      type: entity.value.type,
      status: entity.value.status,
    })
  }

  async update(
    id: string,
    userId: string,
    input: UpdateContactEntityInput,
  ): Promise<ContactRecord> {
    const existing = await this.repo.findById(id, userId)

    if (!existing) {
      throw new Error("Contato nao encontrado para este usuario")
    }

    const entity = ContactEntity.fromRecord(toEntityProps(existing))
    const data = entity.buildUpdatePayload(input)

    const updated = await this.repo.update(id, userId, data)

    if (!updated) {
      throw new Error("Contato nao encontrado para este usuario")
    }

    return updated
  }

  async remove(id: string, userId: string): Promise<ContactRecord> {
    const deleted = await this.repo.delete(id, userId)

    if (!deleted) {
      throw new Error("Contato nao encontrado para este usuario")
    }

    return deleted
  }
}
