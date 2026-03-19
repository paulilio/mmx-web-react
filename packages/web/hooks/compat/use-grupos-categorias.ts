import type { GrupoCategoria, GrupoCategoriaFormData } from "@/lib/shared/types"
import { useCategoryGroups } from "../use-category-groups"

export function useGruposCategorias() {
  const {
    categoryGroups,
    isLoading,
    error,
    createCategoryGroup,
    updateCategoryGroup,
    deleteCategoryGroup,
    mutate,
  } = useCategoryGroups()

  const createGrupoCategoria = async (data: GrupoCategoriaFormData): Promise<GrupoCategoria> => {
    return createCategoryGroup(data)
  }

  const updateGrupoCategoria = async (id: string, data: GrupoCategoriaFormData): Promise<GrupoCategoria> => {
    return updateCategoryGroup(id, data)
  }

  const deleteGrupoCategoria = async (id: string) => {
    await deleteCategoryGroup(id)
  }

  return {
    gruposCategorias: categoryGroups as GrupoCategoria[],
    isLoading,
    error,
    createGrupoCategoria,
    updateGrupoCategoria,
    deleteGrupoCategoria,
    mutate,
  }
}

// Backward compatibility alias
export const useBudgetGroups = useGruposCategorias
