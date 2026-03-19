import useSWR, { mutate as globalMutate } from "swr"
import type { Category, CategoryGroup, CategoryGroupFormData } from "@/lib/shared/types"
import { api } from "@/lib/client/api"
import { logger } from "@/lib/shared/logger"

const categoryGroupsLogger = logger.scope("CategoryGroupsHook")

export function useCategoryGroups() {
  const { data, error, mutate } = useSWR<CategoryGroup[]>("/category-groups", api.get)

  const createCategoryGroup = async (data: CategoryGroupFormData) => {
    const result = await api.post<CategoryGroup>("/category-groups", data)
    mutate()
    return result
  }

  const updateCategoryGroup = async (id: string, data: Partial<CategoryGroupFormData>) => {
    const result = await api.put<CategoryGroup>(`/category-groups/${id}`, data)
    mutate()
    return result
  }

  const deleteCategoryGroup = async (id: string) => {
    const categories = await api.get<Category[]>("/categories")
    const associatedCategories = categories.filter((cat) => cat.categoryGroupId === id)

    for (const category of associatedCategories) {
      try {
        await api.put(`/categories/${category.id}`, { ...category, categoryGroupId: undefined })
      } catch (error) {
        categoryGroupsLogger.warn("Failed to clear categoryGroupId from category", { categoryId: category.id })
      }
    }

    await api.delete(`/category-groups/${id}`)

    await globalMutate("/categories")

    mutate()
  }

  return {
    categoryGroups: data || [],
    isLoading: !error && !data,
    error,
    createCategoryGroup,
    updateCategoryGroup,
    deleteCategoryGroup,
    mutate,
  }
}
