import type { PaginatedResult } from "../repositories/base-repository"
import type {
  CategoryGroupFilters,
  CategoryGroupRecord,
  CategoryGroupRepository,
  CreateCategoryGroupRecordInput,
  UpdateCategoryGroupRecordInput,
} from "../repositories/category-group-repository"

export class CategoryGroupService {
  constructor(private readonly repository: CategoryGroupRepository) {}

  async list(
    filters: CategoryGroupFilters,
    pagination?: { page?: number; pageSize?: number },
  ): Promise<PaginatedResult<CategoryGroupRecord>> {
    return this.repository.findMany(filters, pagination)
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

    return this.repository.create({
      ...input,
      name: input.name.trim(),
      description: input.description?.trim() || null,
    })
  }

  async getById(id: string, userId: string): Promise<CategoryGroupRecord | null> {
    return this.repository.findById(id, userId)
  }

  async update(id: string, userId: string, input: UpdateCategoryGroupRecordInput): Promise<CategoryGroupRecord> {
    const existing = await this.repository.findById(id, userId)

    if (!existing) {
      throw new Error("Grupo de categoria nao encontrado para este usuario")
    }

    const updated = await this.repository.update(id, userId, {
      name: input.name?.trim(),
      description: input.description === undefined ? undefined : (input.description?.trim() ?? null),
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
    const deleted = await this.repository.delete(id, userId)

    if (!deleted) {
      throw new Error("Grupo de categoria nao encontrado para este usuario")
    }

    return deleted
  }
}
