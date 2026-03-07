import useSWR, { mutate as globalMutate } from "swr"
import type { Category, GrupoCategoria, GrupoCategoriaFormData } from "@/lib/shared/types"
import { api } from "@/lib/client/api"

export function useGruposCategorias() {
  const { data, error, mutate } = useSWR<GrupoCategoria[]>("/category-groups", api.get)

  const createGrupoCategoria = async (data: GrupoCategoriaFormData) => {
    const result = await api.post<GrupoCategoria>("/category-groups", data)
    mutate()
    return result
  }

  const updateGrupoCategoria = async (id: string, data: GrupoCategoriaFormData) => {
    const result = await api.put<GrupoCategoria>(`/category-groups/${id}`, data)
    mutate()
    return result
  }

  const deleteGrupoCategoria = async (id: string) => {
    // Remove grupoCategoriaId from associated categories
    const categories = await api.get<Category[]>("/categories")
    const associatedCategories = categories.filter((cat: any) => cat.grupoCategoriaId === id)

    for (const category of associatedCategories) {
      try {
        await api.put(`/categories/${category.id}`, { ...category, grupoCategoriaId: undefined })
      } catch (error) {
        console.error("[v0] Error removing grupoCategoriaId from category:", category.id, error)
      }
    }

    await api.delete(`/category-groups/${id}`)

    await globalMutate("/categories")

    mutate()
  }

  return {
    gruposCategorias: data || [],
    isLoading: !error && !data,
    error,
    createGrupoCategoria,
    updateGrupoCategoria,
    deleteGrupoCategoria,
    mutate,
  }
}

// Backward compatibility alias
export const useBudgetGroups = useGruposCategorias
