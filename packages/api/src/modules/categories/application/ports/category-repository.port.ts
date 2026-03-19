import type { PaginatedResult } from "@/common/types/pagination.types"
import type {
  CategoryRecord,
  CreateCategoryRecordInput,
  UpdateCategoryRecordInput,
  CategoryFilters,
} from "../../domain/category.types"

export const CATEGORY_REPOSITORY = Symbol("ICategoryRepository")

export interface ICategoryRepository {
  findById(id: string, userId: string): Promise<CategoryRecord | null>
  findMany(
    filters: CategoryFilters,
    pagination?: { page?: number; pageSize?: number },
  ): Promise<PaginatedResult<CategoryRecord>>
  create(data: CreateCategoryRecordInput): Promise<CategoryRecord>
  update(
    id: string,
    userId: string,
    data: UpdateCategoryRecordInput,
  ): Promise<CategoryRecord | null>
  delete(id: string, userId: string): Promise<CategoryRecord | null>
}
