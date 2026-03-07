import { BudgetEntity, type CreateBudgetInput, type UpdateBudgetInput } from "../../domain/budgets/budget-entity"
import type { PaginatedResult } from "../repositories/base-repository"
import { BudgetRepository } from "../repositories/budget-repository"
import { BudgetAllocationRepository } from "../repositories/budget-allocation-repository"

export class BudgetService {
  constructor(private readonly repository = new BudgetRepository(), private readonly allocationRepo = new BudgetAllocationRepository()) {}

  async list(filters: any, pagination?: { page?: number; pageSize?: number }): Promise<PaginatedResult<any>> {
    return this.repository.findMany(filters, pagination)
  }

  async getById(id: string, userId: string) {
    return this.repository.findById(id, userId)
  }

  async create(input: CreateBudgetInput) {
    const entity = BudgetEntity.create(input)

    return this.repository.create({
      userId: entity.value.userId,
      categoryGroupId: entity.value.categoryGroupId,
      month: entity.value.month,
      year: entity.value.year,
      planned: entity.value.planned,
      funded: entity.value.funded,
      rolloverEnabled: entity.value.rolloverEnabled,
      rolloverAmount: entity.value.rolloverAmount,
    })
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
      rolloverAmount: existing.rolloverAmount ?? null,
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
  async listAllocations(filters: any, pagination?: { page?: number; pageSize?: number }) {
    return this.allocationRepo.findMany(filters, pagination)
  }

  async getAllocationById(id: string, userId: string) {
    return this.allocationRepo.findById(id, userId)
  }

  async createAllocation(input: any) {
    return this.allocationRepo.create(input)
  }

  async updateAllocation(id: string, userId: string, input: any) {
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

    return this.allocationRepo.update(allocationId, userId, { fundedAmount: newFunded, availableAmount: newAvailable })
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
