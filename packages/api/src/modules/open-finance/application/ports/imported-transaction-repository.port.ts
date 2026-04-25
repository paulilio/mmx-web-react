import type {
  ImportedTransactionEntity,
  ImportedTransactionProps,
  ImportedTransactionStatus,
} from "../../domain/imported-transaction-entity"

export interface ImportedTransactionListOptions {
  status?: ImportedTransactionStatus
  page?: number
  pageSize?: number
}

export interface PaginatedImportedTransactions {
  items: ImportedTransactionProps[]
  total: number
  page: number
  pageSize: number
}

export interface ImportedTransactionRepositoryPort {
  upsertMany(entities: ImportedTransactionEntity[]): Promise<{ created: number; skipped: number }>
  findByExternalId(bankConnectionId: string, externalId: string): Promise<ImportedTransactionProps | null>
  listByConnection(
    bankConnectionId: string,
    opts?: ImportedTransactionListOptions,
  ): Promise<PaginatedImportedTransactions>
  countByConnection(bankConnectionId: string): Promise<number>
  update(id: string, patch: Partial<ImportedTransactionProps>): Promise<ImportedTransactionProps>
}

export const IMPORTED_TRANSACTION_REPOSITORY = Symbol("IMPORTED_TRANSACTION_REPOSITORY")
