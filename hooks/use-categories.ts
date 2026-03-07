"use client"

import useSWR, { mutate as globalMutate } from "swr"
import { api } from "@/lib/client/api"
import type { Category } from "@/lib/shared/types"

export function useCategories(onCategoryGroupsChange?: () => void) {
  const { data, error, mutate } = useSWR<Category[]>("/categories", api.get)

  const createCategory = async (data: Omit<Category, "id">) => {
    const result = await api.post<Category>("/categories", data)
    console.log("[v0] Category created:", result.id)
    mutate()
    if (data.categoryGroupId) {
      onCategoryGroupsChange?.()
      globalMutate("/category-groups")
    }
    return result
  }

  const updateCategory = async (id: string, data: Partial<Category>) => {
    console.log("[v0] Category updated:", id)

    const currentCategory = (await api.get<Category>(`/categories/${id}`)) as Category
    const oldCategoryGroupId = currentCategory.categoryGroupId
    const newCategoryGroupId = data.categoryGroupId

    const result = await api.put<Category>(`/categories/${id}`, data)
    mutate()

    if (oldCategoryGroupId !== newCategoryGroupId) {
      // Remove from old group
      if (oldCategoryGroupId) {
        try {
          const oldGroup = await api.get(`/category-groups/${oldCategoryGroupId}`)
          const updatedCategoryIds = oldGroup.categoryIds.filter((catId: string) => catId !== id)
          await api.put(`/category-groups/${oldCategoryGroupId}`, {
            ...oldGroup,
            categoryIds: updatedCategoryIds,
          })
        } catch (error) {
          console.error("[v0] Error removing from old group:", error)
        }
      }

      // Add to new group
      if (newCategoryGroupId) {
        try {
          const newGroup = await api.get(`/category-groups/${newCategoryGroupId}`)
          const updatedCategoryIds = [...new Set([...newGroup.categoryIds, id])]
          await api.put(`/category-groups/${newCategoryGroupId}`, {
            ...newGroup,
            categoryIds: updatedCategoryIds,
          })
        } catch (error) {
          console.error("[v0] Error adding to new group:", error)
        }
      }
    }

    onCategoryGroupsChange?.()
    globalMutate("/category-groups")

    return result
  }

  const deleteCategory = async (id: string) => {
    await api.delete(`/categories/${id}`)
    console.log("[v0] Category deleted:", id)
    mutate()
    onCategoryGroupsChange?.()
    globalMutate("/category-groups")
  }

  return {
    categories: data || [],
    isLoading: !error && !data,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
    mutate,
  }
}
