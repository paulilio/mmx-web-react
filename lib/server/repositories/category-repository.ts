import { prisma } from "@/lib/server/db/prisma"
import type {
  DomainCategoryStatus,
  DomainCategoryType,
} from "@/lib/domain/categories/category-entity"
import { BaseRepository, type PaginatedResult } from "./base-repository"

export interface CategoryRecord {
  id: string
  userId: string
  name: string
  description?: string | null
  type: DomainCategoryType
  categoryGroupId?: string | null
  areaId?: string | null
  status: DomainCategoryStatus
  createdAt: Date
  updatedAt: Date
}

export interface CreateCategoryRecordInput {
  userId: string
  name: string
  description?: string | null
  type: DomainCategoryType
  categoryGroupId?: string | null
  areaId?: string | null
  status: DomainCategoryStatus
}

export interface UpdateCategoryRecordInput {
  name?: string
  description?: string | null
  type?: DomainCategoryType
  categoryGroupId?: string | null
  areaId?: string | null
  status?: DomainCategoryStatus
}

export interface CategoryFilters {
  userId: string
  type?: DomainCategoryType
  status?: DomainCategoryStatus
  categoryGroupId?: string
  areaId?: string
}

export class CategoryRepository extends BaseRepository {
  constructor(dbClient = prisma) {
    super(dbClient)
  }

  async findById(id: string, userId: string): Promise<CategoryRecord | null> {
    return this.prisma.category.findFirst({
      where: {
        id,
        userId,
      },
    }) as Promise<CategoryRecord | null>
  }

  async findMany(
    filters: CategoryFilters,
    pagination?: { page?: number; pageSize?: number },
  ): Promise<PaginatedResult<CategoryRecord>> {
    const { skip, take, page, pageSize } = this.getPagination(pagination)

    const where = {
      userId: filters.userId,
      type: filters.type,
      status: filters.status,
      categoryGroupId: filters.categoryGroupId,
      areaId: filters.areaId,
    }

    const [data, total] = (await Promise.all([
      this.prisma.category.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take,
      }),
      this.prisma.category.count({ where }),
    ])) as [CategoryRecord[], number]

    return this.toPaginatedResult(data, total, page, pageSize)
  }

  async create(data: CreateCategoryRecordInput): Promise<CategoryRecord> {
    return this.prisma.category.create({
      data,
    }) as Promise<CategoryRecord>
  }

  async update(id: string, userId: string, data: UpdateCategoryRecordInput): Promise<CategoryRecord | null> {
    const existing = await this.findById(id, userId)

    if (!existing) {
      return null
    }

    return this.prisma.category.update({
      where: { id },
      data,
    }) as Promise<CategoryRecord>
  }

  async delete(id: string, userId: string): Promise<CategoryRecord | null> {
    const existing = await this.findById(id, userId)

    if (!existing) {
      return null
    }

    return this.prisma.category.delete({
      where: { id },
    }) as Promise<CategoryRecord>
  }
}
