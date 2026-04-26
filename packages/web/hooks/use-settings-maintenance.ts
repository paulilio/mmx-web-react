"use client"

import { mutate } from "swr"
import { api } from "@/lib/client/api"

export type SeedTableKey =
  | "mmx_areas"
  | "mmx_category_groups"
  | "mmx_categories"
  | "mmx_transactions"
  | "mmx_contacts"

export type SeedData = Record<SeedTableKey, unknown[]>

type ImportResult = {
  imported: Record<SeedTableKey, number>
}

type ClearResult = {
  cleared: Record<SeedTableKey, number>
}

const REQUIRED_SEED_KEYS: SeedTableKey[] = [
  "mmx_areas",
  "mmx_category_groups",
  "mmx_categories",
  "mmx_transactions",
  "mmx_contacts",
]

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

export function validateSeedJSON(data: unknown): data is SeedData {
  if (!isRecord(data)) {
    return false
  }

  return REQUIRED_SEED_KEYS.every((key) => Array.isArray(data[key]))
}

async function revalidateSettingsCaches() {
  await Promise.all([
    mutate("/areas"),
    mutate("/category-groups"),
    mutate("/categories"),
    mutate("/transactions"),
    mutate("/contacts"),
    mutate("/reports/summary"),
    mutate("/reports/aging"),
    mutate("/reports/cashflow"),
  ])
}

export function useSettingsMaintenance() {
  const getDefaultSeed = async (): Promise<SeedData> => {
    return api.get<SeedData>("/settings/default-seed")
  }

  const exportData = async (tables: SeedTableKey[]) => {
    if (!Array.isArray(tables) || tables.length === 0) {
      throw new Error("Selecione pelo menos uma tabela para exportar")
    }

    return api.post<Partial<SeedData>>("/settings/export", { tables })
  }

  const importData = async (data: unknown): Promise<ImportResult> => {
    if (!validateSeedJSON(data)) {
      throw new Error(
        "JSON invalido. Verifique se contem todas as chaves obrigatorias: mmx_areas, mmx_category_groups, mmx_categories, mmx_transactions, mmx_contacts",
      )
    }

    const result = await api.post<ImportResult>("/settings/import", { data })
    await revalidateSettingsCaches()
    return result
  }

  const clearData = async (tables?: SeedTableKey[]): Promise<ClearResult> => {
    const result = await api.post<ClearResult>("/settings/clear", {
      tables: Array.isArray(tables) && tables.length > 0 ? tables : undefined,
    })

    await revalidateSettingsCaches()
    return result
  }

  return {
    exportData,
    importData,
    clearData,
    getDefaultSeed,
    validateSeedJSON,
  }
}
