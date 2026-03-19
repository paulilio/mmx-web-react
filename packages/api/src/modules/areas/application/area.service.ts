import { Injectable, Inject } from "@nestjs/common"
import {
  AreaEntity,
  type AreaEntityProps,
  type CreateAreaEntityInput,
  type UpdateAreaEntityInput,
} from "../domain/area-entity"
import type { PaginatedResult } from "@/common/types/pagination.types"
import { AREA_REPOSITORY, type IAreaRepository } from "./ports/area-repository.port"
import type { AreaRecord, AreaFilters } from "../domain/area.types"

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

@Injectable()
export class AreaApplicationService {
  constructor(
    @Inject(AREA_REPOSITORY) private readonly repo: IAreaRepository,
  ) {}

  async list(
    filters: AreaFilters,
    pagination?: { page?: number; pageSize?: number },
  ): Promise<PaginatedResult<AreaRecord>> {
    return this.repo.findMany(filters, pagination)
  }

  async getById(id: string, userId: string): Promise<AreaRecord | null> {
    return this.repo.findById(id, userId)
  }

  async create(input: CreateAreaEntityInput): Promise<AreaRecord> {
    const entity = AreaEntity.create(input)

    return this.repo.create({
      userId: entity.value.userId,
      name: entity.value.name,
      description: entity.value.description,
      type: entity.value.type,
      color: entity.value.color,
      icon: entity.value.icon,
      status: entity.value.status,
    })
  }

  async update(
    id: string,
    userId: string,
    input: UpdateAreaEntityInput,
  ): Promise<AreaRecord> {
    const existing = await this.repo.findById(id, userId)

    if (!existing) {
      throw new Error("Area nao encontrada para este usuario")
    }

    const entity = AreaEntity.fromRecord(toEntityProps(existing))
    const data = entity.buildUpdatePayload(input)

    const updated = await this.repo.update(id, userId, data)

    if (!updated) {
      throw new Error("Area nao encontrada para este usuario")
    }

    return updated
  }

  async remove(id: string, userId: string): Promise<AreaRecord> {
    const deleted = await this.repo.delete(id, userId)

    if (!deleted) {
      throw new Error("Area nao encontrada para este usuario")
    }

    return deleted
  }
}
