import type { PaginatedResult } from "@/common/types/pagination.types"
import type {
  TransactionRecord,
  CreateTransactionRecordInput,
  UpdateTransactionRecordInput,
  TransactionFilters,
  TransactionSummaryGroupRecord,
  TransactionAgingGroupRecord,
  TransactionCashflowGroupRecord,
  CashflowStatusFilter,
} from "../../domain/transaction.types"

export const TRANSACTION_REPOSITORY = Symbol("ITransactionRepository")

export interface ITransactionRepository {
  findById(id: string, userId: string): Promise<TransactionRecord | null>
  findMany(
    filters: TransactionFilters,
    pagination?: { page?: number; pageSize?: number },
  ): Promise<PaginatedResult<TransactionRecord>>
  create(data: CreateTransactionRecordInput): Promise<TransactionRecord>
  update(
    id: string,
    userId: string,
    data: UpdateTransactionRecordInput,
  ): Promise<TransactionRecord | null>
  delete(id: string, userId: string): Promise<TransactionRecord | null>
  summarizeByTypeAndStatus(
    userId: string,
  ): Promise<TransactionSummaryGroupRecord[]>
  summarizeAgingExpenses(
    userId: string,
    options: { fromDate: Date; toDate?: Date },
  ): Promise<TransactionAgingGroupRecord[]>
  summarizeCashflowByDate(
    userId: string,
    options: { fromDate: Date; status: CashflowStatusFilter },
  ): Promise<TransactionCashflowGroupRecord[]>
}
