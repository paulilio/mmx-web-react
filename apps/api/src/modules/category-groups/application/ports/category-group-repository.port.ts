import type { PaginatedResult } from "@/common/types/pagination.types"
import type {
  CategoryGroupRecord,
  CreateCategoryGroupRecordInput,
  UpdateCategoryGroupRecordInput,
  CategoryGroupFilters,
} from "../../domain/category-group.types"

export const CATEGORY_GROUP_REPOSITORY = Symbol("ICategoryGroupRepository")

export interface ICategoryGroupRepository {
  findById(id: string, userId: string): Promise<CategoryGroupRecord | null>
  findMany(
    filters: CategoryGroupFilters,
    pagination?: { page?: number; pageSize?: number },
  ): Promise<PaginatedResult<CategoryGroupRecord>>
  create(data: CreateCategoryGroupRecordInput): Promise<CategoryGroupRecord>
  update(
    id: string,
    userId: string,
    data: UpdateCategoryGroupRecordInput,
  ): Promise<CategoryGroupRecord | null>
  delete(id: string, userId: string): Promise<CategoryGroupRecord | null>
}
