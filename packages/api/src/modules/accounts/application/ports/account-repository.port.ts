import type { PaginatedResult } from "@/common/types/pagination.types"
import type {
  AccountFilters,
  AccountRecord,
  CreateAccountRecordInput,
  UpdateAccountRecordInput,
} from "../../domain/account.types"

export const ACCOUNT_REPOSITORY = Symbol("IAccountRepository")

export interface IAccountRepository {
  findById(id: string, userId: string): Promise<AccountRecord | null>
  findByUserAndName(userId: string, name: string): Promise<AccountRecord | null>
  findMany(
    filters: AccountFilters,
    pagination?: { page?: number; pageSize?: number },
  ): Promise<PaginatedResult<AccountRecord>>
  create(data: CreateAccountRecordInput): Promise<AccountRecord>
  update(
    id: string,
    userId: string,
    data: UpdateAccountRecordInput,
  ): Promise<AccountRecord | null>
  archive(id: string, userId: string): Promise<AccountRecord | null>
  computeMovement(accountId: string, userId: string): Promise<number>
}
