import { Injectable } from "@nestjs/common"
import { PrismaService } from "@/infrastructure/database/prisma/prisma.service"
import { getPagination, type PaginatedResult } from "@/common/types/pagination.types"
import type { IBudgetAllocationRepository } from "../../application/ports/budget-allocation-repository.port"
import type {
  BudgetAllocationRecord,
  CreateBudgetAllocationInput,
  UpdateBudgetAllocationInput,
  BudgetAllocationFilters,
} from "../../domain/budget.types"

@Injectable()
export class PrismaBudgetAllocationRepository
  implements IBudgetAllocationRepository
{
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string, userId: string): Promise<BudgetAllocationRecord | null> {
    return this.prisma.budgetAllocation.findFirst({
      where: { id, userId },
    }) as Promise<BudgetAllocationRecord | null>
  }

  async findMany(
    filters: BudgetAllocationFilters,
    pagination?: { page?: number; pageSize?: number },
  ): Promise<PaginatedResult<BudgetAllocationRecord>> {
    const { skip, take, page, pageSize } = getPagination(pagination)

    const where: Record<string, unknown> = {
      userId: filters.userId,
      month: filters.month,
      budgetGroupId: filters.budgetGroupId,
    }

    const [data, total] = (await Promise.all([
      this.prisma.budgetAllocation.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      this.prisma.budgetAllocation.count({ where }),
    ])) as [BudgetAllocationRecord[], number]

    return { data, total, page, pageSize }
  }

  create(data: CreateBudgetAllocationInput): Promise<BudgetAllocationRecord> {
    return this.prisma.budgetAllocation.create({
      data: {
        userId: data.userId,
        budgetGroupId: data.budgetGroupId,
        categoryGroupId: data.categoryGroupId,
        month: data.month,
        plannedAmount: data.plannedAmount,
        fundedAmount: data.fundedAmount,
        spentAmount: 0,
        availableAmount: Number(data.fundedAmount),
      },
    }) as Promise<BudgetAllocationRecord>
  }

  async update(
    id: string,
    userId: string,
    data: UpdateBudgetAllocationInput,
  ): Promise<BudgetAllocationRecord | null> {
    const existing = await this.findById(id, userId)
    if (!existing) return null

    return this.prisma.budgetAllocation.update({
      where: { id },
      data,
    }) as Promise<BudgetAllocationRecord>
  }

  async delete(id: string, userId: string): Promise<BudgetAllocationRecord | null> {
    const existing = await this.findById(id, userId)
    if (!existing) return null

    return this.prisma.budgetAllocation.delete({
      where: { id },
    }) as Promise<BudgetAllocationRecord>
  }

  async transferFundsAtomic(
    fromId: string,
    toId: string,
    amount: number,
    userId: string,
  ): Promise<{ from: BudgetAllocationRecord; to: BudgetAllocationRecord }> {
    if (amount <= 0) {
      throw new Error("Valor da transferencia deve ser maior que zero")
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const from = (await tx.budgetAllocation.findFirst({
        where: { id: fromId, userId },
      })) as BudgetAllocationRecord | null

      const to = (await tx.budgetAllocation.findFirst({
        where: { id: toId, userId },
      })) as BudgetAllocationRecord | null

      if (!from || !to) {
        throw new Error("Alocações não encontradas")
      }

      if (Number(from.availableAmount) < amount) {
        throw new Error("Fundos insuficientes")
      }

      const updatedFrom = (await tx.budgetAllocation.update({
        where: { id: fromId },
        data: {
          fundedAmount: Number(from.fundedAmount) - amount,
          availableAmount: Number(from.availableAmount) - amount,
        },
      })) as BudgetAllocationRecord

      const updatedTo = (await tx.budgetAllocation.update({
        where: { id: toId },
        data: {
          fundedAmount: Number(to.fundedAmount) + amount,
          availableAmount: Number(to.availableAmount) + amount,
        },
      })) as BudgetAllocationRecord

      return { from: updatedFrom, to: updatedTo }
    })

    return result
  }
}
