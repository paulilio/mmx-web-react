import { Injectable } from "@nestjs/common"
import { PrismaService } from "@/infrastructure/database/prisma/prisma.service"
import { getPagination, type PaginatedResult } from "@/common/types/pagination.types"
import type { IBudgetRepository } from "../../application/ports/budget-repository.port"
import type {
  BudgetRecord,
  CreateBudgetRecordInput,
  UpdateBudgetRecordInput,
  BudgetFilters,
} from "../../domain/budget.types"

@Injectable()
export class PrismaBudgetRepository implements IBudgetRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string, userId: string): Promise<BudgetRecord | null> {
    return this.prisma.budget.findFirst({ where: { id, userId } }) as Promise<BudgetRecord | null>
  }

  async findMany(
    filters: BudgetFilters,
    pagination?: { page?: number; pageSize?: number },
  ): Promise<PaginatedResult<BudgetRecord>> {
    const { skip, take, page, pageSize } = getPagination(pagination)

    const where: Record<string, unknown> = {
      userId: filters.userId,
      categoryGroupId: filters.categoryGroupId,
      month: filters.month,
      year: filters.year,
    }

    const [data, total] = (await Promise.all([
      this.prisma.budget.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      this.prisma.budget.count({ where }),
    ])) as [BudgetRecord[], number]

    return { data, total, page, pageSize }
  }

  create(data: CreateBudgetRecordInput): Promise<BudgetRecord> {
    return this.prisma.budget.create({ data }) as Promise<BudgetRecord>
  }

  async update(
    id: string,
    userId: string,
    data: UpdateBudgetRecordInput,
  ): Promise<BudgetRecord | null> {
    const existing = await this.findById(id, userId)
    if (!existing) return null

    return this.prisma.budget.update({ where: { id }, data }) as Promise<BudgetRecord>
  }

  async delete(id: string, userId: string): Promise<BudgetRecord | null> {
    const existing = await this.findById(id, userId)
    if (!existing) return null

    return this.prisma.budget.delete({ where: { id } }) as Promise<BudgetRecord>
  }
}
