import useSWR, { mutate as globalMutate } from "swr"
import type { BudgetGroup, BudgetGroupFormData, Category } from "@/lib/shared/types"
import { api } from "@/lib/client/api"

export function useBudgetGroups() {
  const { data, error, mutate } = useSWR<BudgetGroup[]>("/category-groups", api.get)

  const createBudgetGroup = async (data: BudgetGroupFormData) => {
    const result = await api.post<BudgetGroup>("/category-groups", data)

    if (data.categoryIds && data.categoryIds.length > 0) {
      for (const categoryId of data.categoryIds) {
        try {
          const category = await api.get<Category>(`/categories/${categoryId}`)
          await api.put(`/categories/${categoryId}`, { ...category, budgetGroupId: result.id })
        } catch (error) {
          console.error("[v0] Error updating category:", categoryId, error)
        }
      }

      await globalMutate("/categories")
    }

    mutate()
    return result
  }

  const updateBudgetGroup = async (id: string, data: BudgetGroupFormData) => {
    const categories = await api.get<Category[]>("/categories")
    const currentCategoryIds = categories.filter((cat: any) => cat.budgetGroupId === id).map((cat: any) => cat.id)
    const newCategoryIds = data.categoryIds || []

    const result = await api.put(`/category-groups/${id}`, data)

    // Remove budgetGroupId from categories no longer in the group
    for (const categoryId of currentCategoryIds) {
      if (!newCategoryIds.includes(categoryId)) {
        try {
          const category = await api.get<Category>(`/categories/${categoryId}`)
          await api.put(`/categories/${categoryId}`, { ...category, budgetGroupId: undefined })
        } catch (error) {
          console.error("[v0] Error removing budgetGroupId from category:", categoryId, error)
        }
      }
    }

    // Add budgetGroupId to new categories
    for (const categoryId of newCategoryIds) {
      try {
          const category = await api.get<Category>(`/categories/${categoryId}`)
        await api.put(`/categories/${categoryId}`, { ...category, budgetGroupId: id })
      } catch (error) {
        console.error("[v0] Error adding budgetGroupId to category:", categoryId, error)
      }
    }

    await globalMutate("/categories")

    mutate()
    return result
  }

  const deleteBudgetGroup = async (id: string) => {
    const categories = await api.get<Category[]>("/categories")
    const associatedCategories = categories.filter((cat: any) => cat.budgetGroupId === id)

    for (const category of associatedCategories) {
      try {
        await api.put(`/categories/${category.id}`, { ...category, budgetGroupId: undefined })
      } catch (error) {
        console.error("[v0] Error removing budgetGroupId from category:", category.id, error)
      }
    }

    await api.delete(`/category-groups/${id}`)

    await globalMutate("/categories")

    mutate()
  }

  return {
    budgetGroups: data || [],
    isLoading: !error && !data,
    error,
    createBudgetGroup,
    updateBudgetGroup,
    deleteBudgetGroup,
    mutate,
  }
}
