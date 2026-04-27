import { Injectable, Inject } from "@nestjs/common"
import {
  AccountEntity,
  type AccountEntityProps,
  type CreateAccountEntityInput,
  type UpdateAccountEntityInput,
} from "../domain/account-entity"
import type { PaginatedResult } from "@/common/types/pagination.types"
import { ACCOUNT_REPOSITORY, type IAccountRepository } from "./ports/account-repository.port"
import type {
  AccountBalance,
  AccountFilters,
  AccountRecord,
} from "../domain/account.types"

function toEntityProps(record: AccountRecord): AccountEntityProps {
  return {
    userId: record.userId,
    name: record.name,
    institutionName: record.institutionName,
    type: record.type,
    status: record.status,
    currency: record.currency,
    openingBalance: record.openingBalance,
    openingBalanceDate: record.openingBalanceDate,
    color: record.color,
    icon: record.icon,
    isBusiness: record.isBusiness,
    creditLimit: record.creditLimit,
    closingDay: record.closingDay,
    dueDay: record.dueDay,
    bankConnectionId: record.bankConnectionId,
    externalId: record.externalId,
    archivedAt: record.archivedAt,
  }
}

export class AccountNotFoundError extends Error {
  readonly code = "ACCOUNT_NOT_FOUND"
  constructor() {
    super("Conta nao encontrada para este usuario")
  }
}

export class AccountNameTakenError extends Error {
  readonly code = "ACCOUNT_NAME_TAKEN"
  constructor() {
    super("Ja existe uma conta com este nome")
  }
}

@Injectable()
export class AccountApplicationService {
  constructor(
    @Inject(ACCOUNT_REPOSITORY) private readonly repo: IAccountRepository,
  ) {}

  async list(
    filters: AccountFilters,
    pagination?: { page?: number; pageSize?: number },
  ): Promise<PaginatedResult<AccountRecord>> {
    return this.repo.findMany(filters, pagination)
  }

  async getById(id: string, userId: string): Promise<AccountRecord | null> {
    return this.repo.findById(id, userId)
  }

  async create(input: CreateAccountEntityInput): Promise<AccountRecord> {
    const entity = AccountEntity.create(input)

    const existing = await this.repo.findByUserAndName(entity.value.userId, entity.value.name)
    if (existing) {
      throw new AccountNameTakenError()
    }

    return this.repo.create({
      userId: entity.value.userId,
      name: entity.value.name,
      institutionName: entity.value.institutionName,
      type: entity.value.type,
      status: entity.value.status,
      currency: entity.value.currency,
      openingBalance: entity.value.openingBalance,
      openingBalanceDate: entity.value.openingBalanceDate,
      color: entity.value.color,
      icon: entity.value.icon,
      isBusiness: entity.value.isBusiness,
      creditLimit: entity.value.creditLimit,
      closingDay: entity.value.closingDay,
      dueDay: entity.value.dueDay,
      bankConnectionId: entity.value.bankConnectionId,
      externalId: entity.value.externalId,
    })
  }

  async update(
    id: string,
    userId: string,
    input: UpdateAccountEntityInput,
  ): Promise<AccountRecord> {
    const existing = await this.repo.findById(id, userId)
    if (!existing) {
      throw new AccountNotFoundError()
    }

    if (input.name && input.name.trim() !== existing.name) {
      const conflict = await this.repo.findByUserAndName(userId, input.name.trim())
      if (conflict && conflict.id !== id) {
        throw new AccountNameTakenError()
      }
    }

    const entity = AccountEntity.fromRecord(toEntityProps(existing))
    const data = entity.buildUpdatePayload(input)

    const updated = await this.repo.update(id, userId, data)
    if (!updated) {
      throw new AccountNotFoundError()
    }

    return updated
  }

  async archive(id: string, userId: string): Promise<AccountRecord> {
    const existing = await this.repo.findById(id, userId)
    if (!existing) {
      throw new AccountNotFoundError()
    }

    const archived = await this.repo.archive(id, userId)
    if (!archived) {
      throw new AccountNotFoundError()
    }

    return archived
  }

  async getBalance(id: string, userId: string): Promise<AccountBalance> {
    const existing = await this.repo.findById(id, userId)
    if (!existing) {
      throw new AccountNotFoundError()
    }

    const movement = await this.repo.computeMovement(id, userId)
    const opening = Number(existing.openingBalance)
    const totalMovement = Number(movement)

    return {
      accountId: existing.id,
      currency: existing.currency,
      openingBalance: opening,
      movement: totalMovement,
      currentBalance: opening + totalMovement,
    }
  }
}
