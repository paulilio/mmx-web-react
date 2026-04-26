import { ForbiddenException, Inject, Injectable, NotFoundException } from "@nestjs/common"
import { ImportedTransactionEntity } from "../../domain/imported-transaction-entity"
import {
  BANK_CONNECTION_REPOSITORY,
  type BankConnectionRepositoryPort,
} from "../ports/bank-connection-repository.port"
import {
  IMPORTED_TRANSACTION_REPOSITORY,
  type ImportedTransactionRepositoryPort,
} from "../ports/imported-transaction-repository.port"

export type ReconcileAction =
  | { kind: "match"; matchedTransactionId: string }
  | { kind: "ignore" }
  | { kind: "duplicate" }

export interface ReconcileTransactionInput {
  userId: string
  importedTransactionId: string
  action: ReconcileAction
}

@Injectable()
export class ReconcileTransactionUseCase {
  constructor(
    @Inject(IMPORTED_TRANSACTION_REPOSITORY)
    private readonly imported: ImportedTransactionRepositoryPort,
    @Inject(BANK_CONNECTION_REPOSITORY)
    private readonly connections: BankConnectionRepositoryPort,
  ) {}

  async execute(input: ReconcileTransactionInput): Promise<void> {
    const found = await this.imported.findById(input.importedTransactionId)
    if (!found) {
      throw new NotFoundException({
        data: null,
        error: { code: "NOT_FOUND", message: "Transação importada não encontrada" },
      })
    }
    if (!found.id) throw new Error("ImportedTransaction sem id")

    const conn = await this.connections.findById(found.bankConnectionId)
    if (!conn || conn.userId !== input.userId) {
      throw new ForbiddenException({
        data: null,
        error: { code: "FORBIDDEN", message: "Sem permissão" },
      })
    }

    const entity = ImportedTransactionEntity.fromRecord(found)
    let patch
    switch (input.action.kind) {
      case "match":
        patch = entity.markImported(input.action.matchedTransactionId)
        break
      case "ignore":
        patch = entity.markIgnored()
        break
      case "duplicate":
        patch = entity.markDuplicate()
        break
    }
    await this.imported.update(found.id, patch)
  }
}
