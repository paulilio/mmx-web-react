import useSWR, { mutate as globalMutate } from "swr"
import type { CategoryGroup, CategoryGroupFormData } from "@/lib/shared/types"
import { api } from "@/lib/client/api"

export function useCategoryGroups() {
  const { data, error, mutate } = useSWR<CategoryGroup[]>("/category-groups", api.get)

  const createCategoryGroup = async (data: CategoryGroupFormData) => {
    const result = await api.post("/category-groups", data)
    mutate()
    return result
  }

  const updateCategoryGroup = async (id: string, data: CategoryGroupFormData) => {
    const result = await api.put(`/category-groups/${id}`, data)
    mutate()
    return result
  }

  const deleteCategoryGroup = async (id: string) => {
    const categories = await api.get("/categories")
    const associatedCategories = categories.filter((cat: any) => cat.categoryGroupId === id)

    for (const category of associatedCategories) {
      try {
        await api.put(`/categories/${category.id}`, { ...category, categoryGroupId: undefined })
      } catch (error) {
        console.error("[v0] Error removing categoryGroupId from category:", category.id, error)
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
