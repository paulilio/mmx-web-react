"use client"

import { createContext, useCallback, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import type { ReactNode } from "react"
import type { User, UserPreferences } from "@/types/auth"
import { api } from "@/lib/client/api"
import { USE_API } from "@/lib/shared/config"
import { logAuditEvent } from "@/lib/shared/utils"
import { userDataService } from "@/lib/mock/user-data-service"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  logout: () => Promise<void>
  logoutAllDevices: () => Promise<{ revokedCount: number }>
  hydrateFromSession: () => Promise<void>
  switchOrganization: (organizationId: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

type ApiAuthUser = {
  id: string
  email: string
  firstName: string
  lastName?: string
  isEmailConfirmed?: boolean
  planType?: User["planType"]
  preferences?: unknown
}

function mergePreferences(raw: unknown): UserPreferences {
  const base: UserPreferences = {
    theme: "system",
    language: "pt-BR",
    notifications: { email: true, push: true, sms: false },
    layout: { sidebarCollapsed: false, compactMode: false },
  }
  if (raw && typeof raw === "object") {
    const incoming = raw as Partial<UserPreferences>
    return {
      ...base,
      ...incoming,
      notifications: { ...base.notifications, ...(incoming.notifications ?? {}) },
      layout: { ...base.layout, ...(incoming.layout ?? {}) },
    }
  }
  return base
}

function mapApiUser(data: ApiAuthUser): User {
  return {
    id: data.id,
    email: data.email,
    firstName: data.firstName,
    lastName: data.lastName ?? "",
    isEmailConfirmed: Boolean(data.isEmailConfirmed),
    createdAt: new Date().toISOString(),
    planType: data.planType ?? "free",
    preferences: mergePreferences(data.preferences),
  }
}

function clearLocalSession() {
  if (typeof window === "undefined") return
  localStorage.removeItem("auth_session")
  localStorage.removeItem("auth_user")
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const hydrateFromSession = useCallback(async () => {
    if (!USE_API) return
    try {
      const apiUser = await api.get<ApiAuthUser>("/auth/me")
      const mapped = mapApiUser(apiUser)
      setUser(mapped)
      if (typeof window !== "undefined") {
        localStorage.setItem("auth_user", JSON.stringify(mapped))
      }
      userDataService.setContext(mapped, mapped.defaultOrganizationId)
    } catch (error) {
      const status = (error as { status?: number }).status
      if (status === 401 || status === 403) {
        clearLocalSession()
        setUser(null)
      } else {
        throw error
      }
    }
  }, [])

  useEffect(() => {
    void (async () => {
      try {
        if (USE_API) {
          await hydrateFromSession()
        } else if (typeof window !== "undefined") {
          const cached = localStorage.getItem("auth_user")
          if (cached) {
            const parsed = JSON.parse(cached) as User
            setUser(parsed)
            userDataService.setContext(parsed, parsed.defaultOrganizationId)
          }
        }
      } catch (error) {
        console.error("[Auth] Failed to initialize:", error)
      } finally {
        setIsLoading(false)
      }
    })()
  }, [hydrateFromSession])

  const logout = async () => {
    if (USE_API) {
      try {
        await api.post<{ success: boolean }>("/auth/logout", {})
      } catch {
        // Mesmo se o backend falhar, segue limpando estado local.
      }
    }
    userDataService.cleanupUserData()
    clearLocalSession()
    setUser(null)
    logAuditEvent("logout", user?.id ?? null, { email: user?.email })
    router.push("/auth")
  }

  const logoutAllDevices = async () => {
    if (!USE_API) {
      throw new Error("Disponível somente com backend ativo")
    }
    const result = await api.post<{ revokedCount: number }>("/auth/logout-all", {})
    userDataService.cleanupUserData()
    clearLocalSession()
    setUser(null)
    router.push("/auth")
    return result
  }

  const switchOrganization = async (organizationId: string) => {
    if (!user) return
    userDataService.setContext(user, organizationId)
    logAuditEvent("organization_switched", user.id, { organizationId })
    if (typeof window !== "undefined") window.location.reload()
  }

  const value: AuthContextType = {
    user,
    isLoading,
    logout,
    logoutAllDevices,
    hydrateFromSession,
    switchOrganization,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
