import { prisma } from "../db/prisma"
import { BaseRepository } from "./base-repository"

export interface BudgetAllocationRecord {
  id: string
  userId: string
  budgetGroupId: string
  categoryGroupId?: string | null
  month: string
  plannedAmount: any
  fundedAmount: any
  spentAmount: any
  availableAmount: any
  createdAt: Date
  updatedAt: Date
}

export interface CreateBudgetAllocationInput {
  userId: string
  budgetGroupId: string
  categoryGroupId?: string | null
  month: string
  plannedAmount: any
  fundedAmount: any
}

export interface UpdateBudgetAllocationInput {
  plannedAmount?: any
  fundedAmount?: any
  spentAmount?: any
  availableAmount?: any
}

export interface BudgetAllocationFilters {
  userId: string
  month?: string
  budgetGroupId?: string
}

export class BudgetAllocationRepository extends BaseRepository {
  constructor(dbClient = prisma) {
    super(dbClient)
  }

  async findById(id: string, userId: string): Promise<BudgetAllocationRecord | null> {
    return this.prisma.budgetAllocation.findFirst({ where: { id, userId } }) as Promise<BudgetAllocationRecord | null>
  }

  async findMany(filters: BudgetAllocationFilters, pagination?: { page?: number; pageSize?: number }) {
    const { skip, take, page, pageSize } = this.getPagination(pagination)

    const where: any = {
      userId: filters.userId,
      month: filters.month,
      budgetGroupId: filters.budgetGroupId,
    }

    const [data, total] = (await Promise.all([
      this.prisma.budgetAllocation.findMany({ where, orderBy: { createdAt: "desc" }, skip, take }),
      this.prisma.budgetAllocation.count({ where }),
    ])) as [BudgetAllocationRecord[], number]

    return this.toPaginatedResult(data, total, page, pageSize)
  }

  async create(data: CreateBudgetAllocationInput): Promise<BudgetAllocationRecord> {
    return this.prisma.budgetAllocation.create({ data }) as Promise<BudgetAllocationRecord>
  }

  async update(id: string, userId: string, data: UpdateBudgetAllocationInput): Promise<BudgetAllocationRecord | null> {
    const existing = await this.findById(id, userId)
    if (!existing) return null

    return this.prisma.budgetAllocation.update({ where: { id }, data }) as Promise<BudgetAllocationRecord>
  }

  async delete(id: string, userId: string): Promise<BudgetAllocationRecord | null> {
    const existing = await this.findById(id, userId)
    if (!existing) return null

    return this.prisma.budgetAllocation.delete({ where: { id } }) as Promise<BudgetAllocationRecord>
  }
}
