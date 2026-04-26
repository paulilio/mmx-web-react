"use client"

import { mutate as globalMutate } from "swr"
import { api } from "@/lib/client/api"
import { useAuth } from "@/hooks/use-auth"
import { useSettingsMaintenance } from "@/hooks/use-settings-maintenance"

const SETTINGS_CACHE_KEYS = [
  "/areas",
  "/category-groups",
  "/categories",
  "/transactions",
  "/contacts",
  "/reports/summary",
  "/reports/aging",
  "/reports/cashflow",
]

async function revalidateSettingsCaches() {
  await Promise.all(SETTINGS_CACHE_KEYS.map((key) => globalMutate(key)))
}

async function patchPreferences(patch: Record<string, unknown>) {
  await api.patch<{ preferences: unknown }>("/auth/preferences", patch)
}

export function useOnboarding() {
  const { user, hydrateFromSession } = useAuth()
  const { getDefaultSeed, importData } = useSettingsMaintenance()

  const showWelcome = user != null && user.preferences?.hasSeenWelcome === false

  const markWelcomeSeen = async () => {
    await patchPreferences({ hasSeenWelcome: true })
    await hydrateFromSession()
  }

  const loadSampleData = async () => {
    const seed = await getDefaultSeed()
    await importData(seed)
    await patchPreferences({ hasSeenWelcome: true })
    await revalidateSettingsCaches()
    await hydrateFromSession()
  }

  return {
    showWelcome,
    markWelcomeSeen,
    loadSampleData,
  }
}
