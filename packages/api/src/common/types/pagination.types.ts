export interface PaginationParams {
  page?: number
  pageSize?: number
}

export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
}

export function getPagination(
  params?: PaginationParams,
): { skip: number; take: number; page: number; pageSize: number } {
  const page = Math.max(1, params?.page ?? 1)
  const pageSize = Math.max(1, Math.min(100, params?.pageSize ?? 20))
  const skip = (page - 1) * pageSize

  return {
    skip,
    take: pageSize,
    page,
    pageSize,
  }
}
