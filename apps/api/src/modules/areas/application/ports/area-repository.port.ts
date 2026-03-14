import type { PaginatedResult } from "@/common/types/pagination.types"
import type {
  AreaRecord,
  CreateAreaRecordInput,
  UpdateAreaRecordInput,
  AreaFilters,
} from "../../domain/area.types"

export const AREA_REPOSITORY = Symbol("IAreaRepository")

export interface IAreaRepository {
  findById(id: string, userId: string): Promise<AreaRecord | null>
  findMany(
    filters: AreaFilters,
    pagination?: { page?: number; pageSize?: number },
  ): Promise<PaginatedResult<AreaRecord>>
  create(data: CreateAreaRecordInput): Promise<AreaRecord>
  update(
    id: string,
    userId: string,
    data: UpdateAreaRecordInput,
  ): Promise<AreaRecord | null>
  delete(id: string, userId: string): Promise<AreaRecord | null>
}
