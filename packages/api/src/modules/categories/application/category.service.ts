import { Injectable, Inject } from "@nestjs/common"
import {
  CategoryEntity,
  type CategoryEntityProps,
  type CreateCategoryEntityInput,
  type UpdateCategoryEntityInput,
} from "../domain/category-entity"
import type { PaginatedResult } from "@/common/types/pagination.types"
import {
  CATEGORY_REPOSITORY,
  type ICategoryRepository,
} from "./ports/category-repository.port"
import type { CategoryRecord, CategoryFilters } from "../domain/category.types"

function toEntityProps(record: CategoryRecord): CategoryEntityProps {
  return {
    userId: record.userId,
    name: record.name,
    description: record.description,
    type: record.type,
    categoryGroupId: record.categoryGroupId,
    areaId: record.areaId,
    status: record.status,
  }
}

@Injectable()
export class CategoryApplicationService {
  constructor(
    @Inject(CATEGORY_REPOSITORY) private readonly repo: ICategoryRepository,
  ) {}

  async list(
    filters: CategoryFilters,
    pagination?: { page?: number; pageSize?: number },
  ): Promise<PaginatedResult<CategoryRecord>> {
    return this.repo.findMany(filters, pagination)
  }

  async getById(id: string, userId: string): Promise<CategoryRecord | null> {
    return this.repo.findById(id, userId)
  }

  async create(input: CreateCategoryEntityInput): Promise<CategoryRecord> {
    const entity = CategoryEntity.create(input)

    return this.repo.create({
      userId: entity.value.userId,
      name: entity.value.name,
      description: entity.value.description,
      type: entity.value.type,
      categoryGroupId: entity.value.categoryGroupId,
      areaId: entity.value.areaId,
      status: entity.value.status,
    })
  }

  async update(
    id: string,
    userId: string,
    input: UpdateCategoryEntityInput,
  ): Promise<CategoryRecord> {
    const existing = await this.repo.findById(id, userId)

    if (!existing) {
      throw new Error("Categoria nao encontrada para este usuario")
    }

    const entity = CategoryEntity.fromRecord(toEntityProps(existing))
    const data = entity.buildUpdatePayload(input)

    const updated = await this.repo.update(id, userId, data)

    if (!updated) {
      throw new Error("Categoria nao encontrada para este usuario")
    }

    return updated
  }

  async remove(id: string, userId: string): Promise<CategoryRecord> {
    const deleted = await this.repo.delete(id, userId)

    if (!deleted) {
      throw new Error("Categoria nao encontrada para este usuario")
    }

    return deleted
  }
}
