import { prisma } from "@/lib/server/db/prisma"
import { BaseRepository, type PaginatedResult } from "./base-repository"

export interface BudgetRecord {
  id: string
  userId: string
  categoryGroupId: string
  month: number
  year: number
  planned: any
  funded: any
  spent: any
  rolloverEnabled: boolean
  rolloverAmount?: any | null
  createdAt: Date
  updatedAt: Date
}

export interface CreateBudgetRecordInput {
  userId: string
  categoryGroupId: string
  month: number
  year: number
  planned: any
  funded: any
  rolloverEnabled?: boolean
  rolloverAmount?: any | null
}

export interface UpdateBudgetRecordInput {
  planned?: any
  funded?: any
  rolloverEnabled?: boolean
  rolloverAmount?: any | null
}

export interface BudgetFilters {
  userId: string
  categoryGroupId?: string
  month?: number
  year?: number
}

export class BudgetRepository extends BaseRepository {
  constructor(dbClient = prisma) {
    super(dbClient)
  }

  async findById(id: string, userId: string): Promise<BudgetRecord | null> {
    return this.prisma.budget.findFirst({ where: { id, userId } }) as Promise<BudgetRecord | null>
  }

  async findMany(filters: BudgetFilters, pagination?: { page?: number; pageSize?: number }) {
    const { skip, take, page, pageSize } = this.getPagination(pagination)

    const where: any = {
      userId: filters.userId,
      categoryGroupId: filters.categoryGroupId,
      month: filters.month,
      year: filters.year,
    }

    const [data, total] = (await Promise.all([
      this.prisma.budget.findMany({ where, orderBy: { createdAt: "desc" }, skip, take }),
      this.prisma.budget.count({ where }),
    ])) as [BudgetRecord[], number]

    return this.toPaginatedResult(data, total, page, pageSize)
  }

  async create(data: CreateBudgetRecordInput): Promise<BudgetRecord> {
    return this.prisma.budget.create({ data }) as Promise<BudgetRecord>
  }

  async update(id: string, userId: string, data: UpdateBudgetRecordInput): Promise<BudgetRecord | null> {
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
