import type { PaginatedResult } from "@/common/types/pagination.types"
import type {
  ContactRecord,
  CreateContactRecordInput,
  UpdateContactRecordInput,
  ContactFilters,
} from "../../domain/contact.types"

export const CONTACT_REPOSITORY = Symbol("IContactRepository")

export interface IContactRepository {
  findById(id: string, userId: string): Promise<ContactRecord | null>
  findMany(
    filters: ContactFilters,
    pagination?: { page?: number; pageSize?: number },
  ): Promise<PaginatedResult<ContactRecord>>
  create(data: CreateContactRecordInput): Promise<ContactRecord>
  update(
    id: string,
    userId: string,
    data: UpdateContactRecordInput,
  ): Promise<ContactRecord | null>
  delete(id: string, userId: string): Promise<ContactRecord | null>
}
