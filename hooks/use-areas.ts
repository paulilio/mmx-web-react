import useSWR, { mutate as globalMutate } from "swr"
import { api } from "@/lib/client/api"
import type { Area, AreaFormData } from "@/lib/shared/types"

export function useAreas() {
  const { data: areas = [], error, isLoading, mutate } = useSWR<Area[]>("/areas", api.get)

  const createArea = async (data: AreaFormData) => {
    try {
      console.log("[v0] Creating area:", data)
      const newArea = await api.post<Area>("/areas", data)
      await mutate()
      return newArea
    } catch (error) {
      console.error("[v0] Error creating area:", error)
      throw new Error(`Erro ao criar área: ${error}`)
    }
  }

  const updateArea = async (id: string, data: Partial<AreaFormData>) => {
    try {
      console.log("[v0] Updating area:", id, data)
      const currentArea = await api.get<Area>(`/areas/${id}`)
      const updatedArea = await api.put<Area>(`/areas/${id}`, { ...currentArea, ...data })
      await mutate()
      // Invalidate grupos categorias cache since they reference areas
      globalMutate("/grupos-categorias")
      return updatedArea
    } catch (error) {
      console.error("[v0] Error updating area:", error)
      throw new Error(`Erro ao atualizar área: ${error}`)
    }
  }

  const deleteArea = async (id: string) => {
    try {
      console.log("[v0] Deleting area:", id)
      await api.delete(`/areas/${id}`)
      await mutate()
      // Invalidate grupos categorias cache since they reference areas
      globalMutate("/grupos-categorias")
    } catch (error) {
      console.error("[v0] Error deleting area:", error)
      throw new Error(`Erro ao excluir área: ${error}`)
    }
  }

  return {
    areas,
    loading: isLoading,
    error,
    createArea,
    updateArea,
    deleteArea,
    mutate,
  }
}
