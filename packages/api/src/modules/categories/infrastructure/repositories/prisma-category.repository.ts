import { Injectable } from "@nestjs/common"
import { PrismaService } from "@/infrastructure/database/prisma/prisma.service"
import { getPagination, type PaginatedResult } from "@/common/types/pagination.types"
import type { ICategoryRepository } from "../../application/ports/category-repository.port"
import type {
  CategoryRecord,
  CreateCategoryRecordInput,
  UpdateCategoryRecordInput,
  CategoryFilters,
} from "../../domain/category.types"

@Injectable()
export class PrismaCategoryRepository implements ICategoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string, userId: string): Promise<CategoryRecord | null> {
    return this.prisma.category.findFirst({ where: { id, userId } }) as Promise<CategoryRecord | null>
  }

  async findMany(
    filters: CategoryFilters,
    pagination?: { page?: number; pageSize?: number },
  ): Promise<PaginatedResult<CategoryRecord>> {
    const { skip, take, page, pageSize } = getPagination(pagination)
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
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      this.prisma.category.count({ where }),
    ])) as [CategoryRecord[], number]

    return { data, total, page, pageSize }
  }

  create(data: CreateCategoryRecordInput): Promise<CategoryRecord> {
    return this.prisma.category.create({ data }) as Promise<CategoryRecord>
  }

  async update(
    id: string,
    userId: string,
    data: UpdateCategoryRecordInput,
  ): Promise<CategoryRecord | null> {
    const existing = await this.findById(id, userId)
    if (!existing) {
      return null
    }

    return this.prisma.category.update({ where: { id }, data }) as Promise<CategoryRecord>
  }

  async delete(id: string, userId: string): Promise<CategoryRecord | null> {
    const existing = await this.findById(id, userId)
    if (!existing) {
      return null
    }

    return this.prisma.category.delete({ where: { id } }) as Promise<CategoryRecord>
  }
}
