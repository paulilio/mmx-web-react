import {
  AreaEntity,
  type AreaEntityProps,
  type CreateAreaEntityInput,
  type UpdateAreaEntityInput,
} from "../../domain/areas/area-entity"
import type { PaginatedResult } from "../repositories/base-repository"
import type { AreaFilters, AreaRecord, AreaRepository } from "../repositories/area-repository"

function toEntityProps(record: AreaRecord): AreaEntityProps {
  return {
    userId: record.userId,
    name: record.name,
    description: record.description,
    type: record.type,
    color: record.color,
    icon: record.icon,
    status: record.status,
  }
}

export class AreaService {
  constructor(private readonly repository: AreaRepository) {}

  async list(
    filters: AreaFilters,
    pagination?: { page?: number; pageSize?: number },
  ): Promise<PaginatedResult<AreaRecord>> {
    return this.repository.findMany(filters, pagination)
  }

  async getById(id: string, userId: string): Promise<AreaRecord | null> {
    return this.repository.findById(id, userId)
  }

  async create(input: CreateAreaEntityInput): Promise<AreaRecord> {
    const entity = AreaEntity.create(input)

    return this.repository.create({
      userId: entity.value.userId,
      name: entity.value.name,
      description: entity.value.description,
      type: entity.value.type,
      color: entity.value.color,
      icon: entity.value.icon,
      status: entity.value.status,
    })
  }

  async update(id: string, userId: string, input: UpdateAreaEntityInput): Promise<AreaRecord> {
    const existing = await this.repository.findById(id, userId)

    if (!existing) {
      throw new Error("Area nao encontrada para este usuario")
    }

    const entity = AreaEntity.fromRecord(toEntityProps(existing))
    const data = entity.buildUpdatePayload(input)

    const updated = await this.repository.update(id, userId, data)

    if (!updated) {
      throw new Error("Area nao encontrada para este usuario")
    }

    return updated
  }

  async remove(id: string, userId: string): Promise<AreaRecord> {
    const deleted = await this.repository.delete(id, userId)

    if (!deleted) {
      throw new Error("Area nao encontrada para este usuario")
    }

    return deleted
  }
}
