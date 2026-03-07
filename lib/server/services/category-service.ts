import {
  CategoryEntity,
  type CategoryEntityProps,
  type CreateCategoryEntityInput,
  type UpdateCategoryEntityInput,
} from "../../domain/categories/category-entity"
import type { PaginatedResult } from "../repositories/base-repository"
import type {
  CategoryFilters,
  CategoryRecord,
  CategoryRepository,
} from "../repositories/category-repository"

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

export class CategoryService {
  constructor(private readonly repository: CategoryRepository) {}

  async list(
    filters: CategoryFilters,
    pagination?: { page?: number; pageSize?: number },
  ): Promise<PaginatedResult<CategoryRecord>> {
    return this.repository.findMany(filters, pagination)
  }

  async getById(id: string, userId: string): Promise<CategoryRecord | null> {
    return this.repository.findById(id, userId)
  }

  async create(input: CreateCategoryEntityInput): Promise<CategoryRecord> {
    const entity = CategoryEntity.create(input)

    return this.repository.create({
      userId: entity.value.userId,
      name: entity.value.name,
      description: entity.value.description,
      type: entity.value.type,
      categoryGroupId: entity.value.categoryGroupId,
      areaId: entity.value.areaId,
      status: entity.value.status,
    })
  }

  async update(id: string, userId: string, input: UpdateCategoryEntityInput): Promise<CategoryRecord> {
    const existing = await this.repository.findById(id, userId)

    if (!existing) {
      throw new Error("Categoria nao encontrada para este usuario")
    }

    const entity = CategoryEntity.fromRecord(toEntityProps(existing))
    const data = entity.buildUpdatePayload(input)

    const updated = await this.repository.update(id, userId, data)

    if (!updated) {
      throw new Error("Categoria nao encontrada para este usuario")
    }

    return updated
  }

  async remove(id: string, userId: string): Promise<CategoryRecord> {
    const deleted = await this.repository.delete(id, userId)

    if (!deleted) {
      throw new Error("Categoria nao encontrada para este usuario")
    }

    return deleted
  }
}
