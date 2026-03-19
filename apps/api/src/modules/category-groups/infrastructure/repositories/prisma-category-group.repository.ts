import { Injectable } from "@nestjs/common"
import { PrismaService } from "@/infrastructure/database/prisma/prisma.service"
import { getPagination, type PaginatedResult } from "@/common/types/pagination.types"
import type { ICategoryGroupRepository } from "../../application/ports/category-group-repository.port"
import type {
  CategoryGroupRecord,
  CreateCategoryGroupRecordInput,
  UpdateCategoryGroupRecordInput,
  CategoryGroupFilters,
} from "../../domain/category-group.types"

@Injectable()
export class PrismaCategoryGroupRepository implements ICategoryGroupRepository {
  constructor(private readonly prisma: PrismaService) {}

  private normalizeCategoryIds(value: unknown): string[] {
    if (!Array.isArray(value)) {
      return []
    }

    return value.filter((id): id is string => typeof id === "string")
  }

  private toRecord(item: {
    id: string
    userId: string
    name: string
    description: string | null
    color: string
    icon: string
    status: "ACTIVE" | "INACTIVE"
    areaId: string | null
    categoryIds: unknown
    createdAt: Date
    updatedAt: Date
  }): CategoryGroupRecord {
    return {
      id: item.id,
      userId: item.userId,
      name: item.name,
      description: item.description,
      color: item.color,
      icon: item.icon,
      status: item.status,
      areaId: item.areaId,
      categoryIds: this.normalizeCategoryIds(item.categoryIds),
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }
  }

  async findById(id: string, userId: string): Promise<CategoryGroupRecord | null> {
    const record = await this.prisma.categoryGroup.findFirst({
      where: { id, userId },
    })

    if (!record) {
      return null
    }

    return this.toRecord(
      record as {
        id: string
        userId: string
        name: string
        description: string | null
        color: string
        icon: string
        status: "ACTIVE" | "INACTIVE"
        areaId: string | null
        categoryIds: unknown
        createdAt: Date
        updatedAt: Date
      },
    )
  }

  async findMany(
    filters: CategoryGroupFilters,
    pagination?: { page?: number; pageSize?: number },
  ): Promise<PaginatedResult<CategoryGroupRecord>> {
    const { skip, take, page, pageSize } = getPagination(pagination)
    const where = {
      userId: filters.userId,
      status: filters.status,
      areaId: filters.areaId,
      name: filters.name
        ? {
            contains: filters.name,
            mode: "insensitive" as const,
          }
        : undefined,
    }

    const [data, total] = (await Promise.all([
      this.prisma.categoryGroup.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      this.prisma.categoryGroup.count({ where }),
    ])) as [
      Array<{
        id: string
        userId: string
        name: string
        description: string | null
        color: string
        icon: string
        status: "ACTIVE" | "INACTIVE"
        areaId: string | null
        categoryIds: unknown
        createdAt: Date
        updatedAt: Date
      }>,
      number,
    ]

    return {
      data: data.map((item) => this.toRecord(item)),
      total,
      page,
      pageSize,
    }
  }

  async create(data: CreateCategoryGroupRecordInput): Promise<CategoryGroupRecord> {
    const created = (await this.prisma.categoryGroup.create({
      data: {
        userId: data.userId,
        name: data.name,
        description: data.description ?? null,
        color: data.color,
        icon: data.icon,
        status: data.status ?? "ACTIVE",
        areaId: data.areaId ?? null,
        categoryIds: data.categoryIds ?? [],
      },
    })) as {
      id: string
      userId: string
      name: string
      description: string | null
      color: string
      icon: string
      status: "ACTIVE" | "INACTIVE"
      areaId: string | null
      categoryIds: unknown
      createdAt: Date
      updatedAt: Date
    }

    return this.toRecord(created)
  }

  async update(
    id: string,
    userId: string,
    data: UpdateCategoryGroupRecordInput,
  ): Promise<CategoryGroupRecord | null> {
    const existing = await this.findById(id, userId)

    if (!existing) {
      return null
    }

    const updated = await this.prisma.categoryGroup.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        color: data.color,
        icon: data.icon,
        status: data.status,
        areaId: data.areaId,
        categoryIds: data.categoryIds,
      },
    })

    return this.toRecord(
      updated as {
        id: string
        userId: string
        name: string
        description: string | null
        color: string
        icon: string
        status: "ACTIVE" | "INACTIVE"
        areaId: string | null
        categoryIds: unknown
        createdAt: Date
        updatedAt: Date
      },
    )
  }

  async delete(id: string, userId: string): Promise<CategoryGroupRecord | null> {
    const existing = await this.findById(id, userId)

    if (!existing) {
      return null
    }

    const deleted = await this.prisma.categoryGroup.delete({
      where: { id },
    })

    return this.toRecord(
      deleted as {
        id: string
        userId: string
        name: string
        description: string | null
        color: string
        icon: string
        status: "ACTIVE" | "INACTIVE"
        areaId: string | null
        categoryIds: unknown
        createdAt: Date
        updatedAt: Date
      },
    )
  }
}
