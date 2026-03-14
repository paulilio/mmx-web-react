import { Injectable, Inject } from "@nestjs/common"
import {
  BudgetEntity,
  type CreateBudgetInput,
  type UpdateBudgetInput,
} from "../domain/budget-entity"
import type { PaginatedResult } from "@/common/types/pagination.types"
import {
  BUDGET_REPOSITORY,
  type IBudgetRepository,
} from "./ports/budget-repository.port"
import {
  BUDGET_ALLOCATION_REPOSITORY,
  type IBudgetAllocationRepository,
} from "./ports/budget-allocation-repository.port"
import type {
  BudgetFilters,
  BudgetRecord,
  BudgetAllocationFilters,
  BudgetAllocationRecord,
  CreateBudgetAllocationInput,
  UpdateBudgetAllocationInput,
} from "../domain/budget.types"

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === "P2002"
  )
}

@Injectable()
export class BudgetApplicationService {
  constructor(
    @Inject(BUDGET_REPOSITORY) private readonly repository: IBudgetRepository,
    @Inject(BUDGET_ALLOCATION_REPOSITORY)
    private readonly allocationRepo: IBudgetAllocationRepository,
  ) {}

  async list(
    filters: BudgetFilters,
    pagination?: { page?: number; pageSize?: number },
  ): Promise<PaginatedResult<BudgetRecord>> {
    return this.repository.findMany(filters, pagination)
  }

  async getById(id: string, userId: string) {
    return this.repository.findById(id, userId)
  }

  async create(input: CreateBudgetInput) {
    const entity = BudgetEntity.create(input)

    try {
      return await this.repository.create({
        userId: entity.value.userId,
        categoryGroupId: entity.value.categoryGroupId,
        month: entity.value.month,
        year: entity.value.year,
        planned: entity.value.planned,
        funded: entity.value.funded,
        rolloverEnabled: entity.value.rolloverEnabled,
        rolloverAmount: entity.value.rolloverAmount,
      })
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw new Error("Ja existe um orçamento para este grupo no mes informado")
      }

      throw error
    }
  }

  async update(id: string, userId: string, input: UpdateBudgetInput) {
    const existing = await this.repository.findById(id, userId)
    if (!existing) throw new Error("Orçamento não encontrado para este usuário")

    const entity = BudgetEntity.fromRecord({
      userId: existing.userId,
      categoryGroupId: existing.categoryGroupId,
      month: existing.month,
      year: existing.year,
      planned: Number(existing.planned),
      funded: Number(existing.funded),
      spent: Number(existing.spent),
      rolloverEnabled: existing.rolloverEnabled,
      rolloverAmount:
        existing.rolloverAmount != null ? Number(existing.rolloverAmount) : null,
    })

    const data = entity.buildUpdatePayload(input)

    const updated = await this.repository.update(id, userId, data)
    if (!updated) throw new Error("Orçamento não encontrado para este usuário")

    return updated
  }

  async remove(id: string, userId: string) {
    const deleted = await this.repository.delete(id, userId)
    if (!deleted) throw new Error("Orçamento não encontrado para este usuário")
    return deleted
  }

  async listAllocations(
    filters: BudgetAllocationFilters,
    pagination?: { page?: number; pageSize?: number },
  ): Promise<PaginatedResult<BudgetAllocationRecord>> {
    return this.allocationRepo.findMany(filters, pagination)
  }

  async getAllocationById(id: string, userId: string) {
    return this.allocationRepo.findById(id, userId)
  }

  async createAllocation(input: CreateBudgetAllocationInput) {
    try {
      return await this.allocationRepo.create(input)
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw new Error("Ja existe uma alocacao para este grupo no mes informado")
      }

      throw error
    }
  }

  async updateAllocation(
    id: string,
    userId: string,
    input: UpdateBudgetAllocationInput,
  ) {
    const updated = await this.allocationRepo.update(id, userId, input)
    if (!updated) throw new Error("Alocação não encontrada para este usuário")
    return updated
  }

  async deleteAllocation(id: string, userId: string) {
    const deleted = await this.allocationRepo.delete(id, userId)
    if (!deleted) throw new Error("Alocação não encontrada para este usuário")
    return deleted
  }

  async addFunds(allocationId: string, amount: number, userId: string) {
    const alloc = await this.allocationRepo.findById(allocationId, userId)
    if (!alloc) throw new Error("Alocação não encontrada")

    const newFunded = Number(alloc.fundedAmount) + amount
    const newAvailable = newFunded - Number(alloc.spentAmount)

    const updated = await this.allocationRepo.update(allocationId, userId, {
      fundedAmount: newFunded,
      availableAmount: newAvailable,
    })

    if (!updated) {
      throw new Error("Alocação não encontrada")
    }

    return updated
  }

  async transferFunds(
    fromId: string,
    toId: string,
    amount: number,
    userId: string,
  ) {
    return this.allocationRepo.transferFundsAtomic(fromId, toId, amount, userId)
  }
}
