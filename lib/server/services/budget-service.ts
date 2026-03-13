import { BudgetEntity, type CreateBudgetInput, type UpdateBudgetInput } from "../../domain/budgets/budget-entity"
import type { PaginatedResult } from "../repositories/base-repository"
import { BudgetRepository, type BudgetFilters, type BudgetRecord } from "../repositories/budget-repository"
import {
  BudgetAllocationRepository,
  type BudgetAllocationFilters,
  type BudgetAllocationRecord,
  type CreateBudgetAllocationInput,
  type UpdateBudgetAllocationInput,
} from "../repositories/budget-allocation-repository"

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === "P2002"
  )
}

export class BudgetService {
  constructor(private readonly repository = new BudgetRepository(), private readonly allocationRepo = new BudgetAllocationRepository()) {}

  async list(filters: BudgetFilters, pagination?: { page?: number; pageSize?: number }): Promise<PaginatedResult<BudgetRecord>> {
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
      rolloverAmount: existing.rolloverAmount != null ? Number(existing.rolloverAmount) : null,
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

  // Budget allocations
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

  async updateAllocation(id: string, userId: string, input: UpdateBudgetAllocationInput) {
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

  async transferFunds(fromId: string, toId: string, amount: number, userId: string) {
    const from = await this.allocationRepo.findById(fromId, userId)
    const to = await this.allocationRepo.findById(toId, userId)

    if (!from || !to) throw new Error("Alocações não encontradas")

    if (Number(from.availableAmount) < amount) throw new Error("Fundos insuficientes")

    await this.allocationRepo.update(fromId, userId, {
      fundedAmount: Number(from.fundedAmount) - amount,
      availableAmount: Number(from.availableAmount) - amount,
    })

    await this.allocationRepo.update(toId, userId, {
      fundedAmount: Number(to.fundedAmount) + amount,
      availableAmount: Number(to.availableAmount) + amount,
    })

    return { from: await this.allocationRepo.findById(fromId, userId), to: await this.allocationRepo.findById(toId, userId) }
  }
}
