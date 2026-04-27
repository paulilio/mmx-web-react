import { Inject, Injectable } from "@nestjs/common"
import { randomUUID } from "node:crypto"
import {
  TRANSACTION_REPOSITORY,
  type ITransactionRepository,
} from "../ports/transaction-repository.port"
import {
  ACCOUNT_REPOSITORY,
  type IAccountRepository,
} from "@/modules/accounts/application/ports/account-repository.port"
import type {
  TransactionRecord,
  CreateTransactionRecordInput,
} from "../../domain/transaction.types"

export interface CreateTransferInput {
  userId: string
  fromAccountId: string
  toAccountId: string
  amount: number
  date: string
  description: string
  notes?: string | null
  transferKind?: string | null
  status?: "PENDING" | "COMPLETED"
}

export class TransferValidationError extends Error {
  constructor(message: string, readonly code: string) {
    super(message)
    Object.assign(this, { status: 400 })
  }
}

@Injectable()
export class CreateTransferUseCase {
  constructor(
    @Inject(TRANSACTION_REPOSITORY)
    private readonly txRepo: ITransactionRepository,
    @Inject(ACCOUNT_REPOSITORY)
    private readonly accountRepo: IAccountRepository,
  ) {}

  async execute(input: CreateTransferInput): Promise<{
    transferGroupId: string
    debit: TransactionRecord
    credit: TransactionRecord
  }> {
    if (!input.fromAccountId?.trim() || !input.toAccountId?.trim()) {
      throw new TransferValidationError(
        "fromAccountId e toAccountId sao obrigatorios",
        "MISSING_ACCOUNT",
      )
    }

    if (input.fromAccountId === input.toAccountId) {
      throw new TransferValidationError(
        "Origem e destino devem ser contas diferentes",
        "SAME_ACCOUNT",
      )
    }

    const amount = Number(input.amount)
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new TransferValidationError(
        "Valor da transferencia deve ser maior que zero",
        "INVALID_AMOUNT",
      )
    }

    const parsedDate = new Date(input.date)
    if (Number.isNaN(parsedDate.getTime())) {
      throw new TransferValidationError("Data invalida", "INVALID_DATE")
    }

    const fromAccount = await this.accountRepo.findById(input.fromAccountId, input.userId)
    if (!fromAccount) {
      throw new TransferValidationError(
        "Conta de origem nao encontrada",
        "FROM_ACCOUNT_NOT_FOUND",
      )
    }

    const toAccount = await this.accountRepo.findById(input.toAccountId, input.userId)
    if (!toAccount) {
      throw new TransferValidationError(
        "Conta de destino nao encontrada",
        "TO_ACCOUNT_NOT_FOUND",
      )
    }

    if (fromAccount.status === "ARCHIVED" || toAccount.status === "ARCHIVED") {
      throw new TransferValidationError(
        "Nao e possivel transferir envolvendo conta arquivada",
        "ARCHIVED_ACCOUNT",
      )
    }

    const transferGroupId = `tx_${randomUUID().replace(/-/g, "")}`
    const status = input.status ?? "PENDING"
    const description =
      input.description?.trim() ||
      `Transferência ${fromAccount.name} → ${toAccount.name}`

    const debitInput: CreateTransactionRecordInput = {
      userId: input.userId,
      description,
      amount,
      type: "TRANSFER",
      categoryId: null,
      date: parsedDate,
      status,
      notes: input.notes ?? null,
      contactId: null,
      areaId: null,
      categoryGroupId: null,
      accountId: input.fromAccountId,
      transferGroupId,
      transferRole: "DEBIT",
      transferKind: input.transferKind ?? null,
    }

    const creditInput: CreateTransactionRecordInput = {
      userId: input.userId,
      description,
      amount,
      type: "TRANSFER",
      categoryId: null,
      date: parsedDate,
      status,
      notes: input.notes ?? null,
      contactId: null,
      areaId: null,
      categoryGroupId: null,
      accountId: input.toAccountId,
      transferGroupId,
      transferRole: "CREDIT",
      transferKind: input.transferKind ?? null,
    }

    const debit = await this.txRepo.create(debitInput)
    const credit = await this.txRepo.create(creditInput)

    return { transferGroupId, debit, credit }
  }
}
