import { Injectable } from "@nestjs/common"
import { PrismaService } from "@/infrastructure/database/prisma/prisma.service"
import { getPagination, type PaginatedResult } from "@/common/types/pagination.types"
import type { IAreaRepository } from "../../application/ports/area-repository.port"
import type {
  AreaRecord,
  CreateAreaRecordInput,
  UpdateAreaRecordInput,
  AreaFilters,
} from "../../domain/area.types"

@Injectable()
export class PrismaAreaRepository implements IAreaRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string, userId: string): Promise<AreaRecord | null> {
    return this.prisma.area.findFirst({ where: { id, userId } }) as Promise<AreaRecord | null>
  }

  async findMany(
    filters: AreaFilters,
    pagination?: { page?: number; pageSize?: number },
  ): Promise<PaginatedResult<AreaRecord>> {
    const { skip, take, page, pageSize } = getPagination(pagination)
    const where = {
      userId: filters.userId,
      type: filters.type,
      status: filters.status,
    }

    const [data, total] = (await Promise.all([
      this.prisma.area.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      this.prisma.area.count({ where }),
    ])) as [AreaRecord[], number]

    return { data, total, page, pageSize }
  }

  create(data: CreateAreaRecordInput): Promise<AreaRecord> {
    return this.prisma.area.create({ data }) as Promise<AreaRecord>
  }

  async update(
    id: string,
    userId: string,
    data: UpdateAreaRecordInput,
  ): Promise<AreaRecord | null> {
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
