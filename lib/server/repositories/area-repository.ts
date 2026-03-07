import { prisma } from "@/lib/server/db/prisma"
import type { DomainAreaStatus, DomainAreaType } from "@/lib/domain/areas/area-entity"
import { BaseRepository, type PaginatedResult } from "./base-repository"

export interface AreaRecord {
  id: string
  userId: string
  name: string
  description?: string | null
  type: DomainAreaType
  color: string
  icon: string
  status: DomainAreaStatus
  createdAt: Date
  updatedAt: Date
}

export interface CreateAreaRecordInput {
  userId: string
  name: string
  description?: string | null
  type: DomainAreaType
  color: string
  icon: string
  status: DomainAreaStatus
}

export interface UpdateAreaRecordInput {
  name?: string
  description?: string | null
  type?: DomainAreaType
  color?: string
  icon?: string
  status?: DomainAreaStatus
}

export interface AreaFilters {
  userId: string
  type?: DomainAreaType
  status?: DomainAreaStatus
}

export class AreaRepository extends BaseRepository {
  constructor(dbClient = prisma) {
    super(dbClient)
  }

  async findById(id: string, userId: string): Promise<AreaRecord | null> {
    return this.prisma.area.findFirst({
      where: {
        id,
        userId,
      },
    }) as Promise<AreaRecord | null>
  }

  async findMany(
    filters: AreaFilters,
    pagination?: { page?: number; pageSize?: number },
  ): Promise<PaginatedResult<AreaRecord>> {
    const { skip, take, page, pageSize } = this.getPagination(pagination)

    const where = {
      userId: filters.userId,
      type: filters.type,
      status: filters.status,
    }

    const [data, total] = (await Promise.all([
      this.prisma.area.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take,
      }),
      this.prisma.area.count({ where }),
    ])) as [AreaRecord[], number]

    return this.toPaginatedResult(data, total, page, pageSize)
  }

  async create(data: CreateAreaRecordInput): Promise<AreaRecord> {
    return this.prisma.area.create({ data }) as Promise<AreaRecord>
  }

  async update(id: string, userId: string, data: UpdateAreaRecordInput): Promise<AreaRecord | null> {
    const existing = await this.findById(id, userId)

    if (!existing) {
      return null
    }

    return this.prisma.area.update({ where: { id }, data }) as Promise<AreaRecord>
  }

  async delete(id: string, userId: string): Promise<AreaRecord | null> {
    const existing = await this.findById(id, userId)

    if (!existing) {
      return null
    }

    return this.prisma.area.delete({ where: { id } }) as Promise<AreaRecord>
  }
}
