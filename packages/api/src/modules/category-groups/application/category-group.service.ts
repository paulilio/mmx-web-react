import { Injectable, Inject } from "@nestjs/common"
import type { PaginatedResult } from "@/common/types/pagination.types"
import {
  CATEGORY_GROUP_REPOSITORY,
  type ICategoryGroupRepository,
} from "./ports/category-group-repository.port"
import type {
  CategoryGroupRecord,
  CreateCategoryGroupRecordInput,
  UpdateCategoryGroupRecordInput,
  CategoryGroupFilters,
} from "../domain/category-group.types"

@Injectable()
export class CategoryGroupApplicationService {
  constructor(
    @Inject(CATEGORY_GROUP_REPOSITORY)
    private readonly repo: ICategoryGroupRepository,
  ) {}

  async list(
    filters: CategoryGroupFilters,
    pagination?: { page?: number; pageSize?: number },
  ): Promise<PaginatedResult<CategoryGroupRecord>> {
    return this.repo.findMany(filters, pagination)
  }

  async getById(id: string, userId: string): Promise<CategoryGroupRecord | null> {
    return this.repo.findById(id, userId)
  }

  async create(input: CreateCategoryGroupRecordInput): Promise<CategoryGroupRecord> {
    if (!input.userId) {
      throw new Error("Usuario obrigatorio")
    }

    if (!input.name || !input.name.trim()) {
      throw new Error("Nome do grupo obrigatorio")
    }

    if (!input.color || !input.color.trim()) {
      throw new Error("Cor do grupo obrigatoria")
    }

    if (!input.icon || !input.icon.trim()) {
      throw new Error("Icone do grupo obrigatorio")
    }

    return this.repo.create({
      ...input,
      name: input.name.trim(),
      description: input.description?.trim() || null,
    })
  }

  async update(
    id: string,
    userId: string,
    input: UpdateCategoryGroupRecordInput,
  ): Promise<CategoryGroupRecord> {
    const existing = await this.repo.findById(id, userId)

    if (!existing) {
      throw new Error("Grupo de categoria nao encontrado para este usuario")
    }

    const updated = await this.repo.update(id, userId, {
      name: input.name?.trim(),
      description:
        input.description === undefined
          ? undefined
          : (input.description?.trim() ?? null),
      color: input.color,
      icon: input.icon,
      status: input.status,
      areaId: input.areaId,
      categoryIds: input.categoryIds,
    })

    if (!updated) {
      throw new Error("Grupo de categoria nao encontrado para este usuario")
    }

    return updated
  }

  async remove(id: string, userId: string): Promise<CategoryGroupRecord> {
    const deleted = await this.repo.delete(id, userId)

    if (!deleted) {
      throw new Error("Grupo de categoria nao encontrado para este usuario")
    }

    return deleted
  }
}
