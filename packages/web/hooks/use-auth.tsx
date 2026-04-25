"use client"

import { createContext, useCallback, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import type { ReactNode } from "react"
import { toast } from "react-toastify"
import type { User, RegisterData } from "@/types/auth"
import { api } from "@/lib/client/api"
import { USE_API } from "@/lib/shared/config"
import { logAuditEvent } from "@/lib/shared/utils"
import { validateRegistrationForm } from "@/lib/shared/auth-validations"
import { userDataService } from "@/lib/mock/user-data-service"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => Promise<void>
  logoutAllDevices: () => Promise<{ revokedCount: number }>
  resendConfirmation: () => Promise<void>
  forgotPassword: (email: string) => Promise<void>
  resetPasswordWithToken: (token: string, newPassword: string) => Promise<void>
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
  totpEnabled?: boolean // 2FA status
}

type ApiLoginResponse = {
  accessToken: string
  refreshToken: string
  expiresIn: number
  user: ApiAuthUser
}

type ApiRegisterResponse = {
  user: ApiAuthUser
  requiresEmailVerification: true
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
    preferences: {
      theme: "system",
      language: "pt-BR",
      notifications: { email: true, push: true, sms: false },
      layout: { sidebarCollapsed: false, compactMode: false },
    },
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

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      if (!USE_API) {
        throw new Error("Login local desativado neste ambiente. Use o backend de auth.")
      }
      const response = await api.post<ApiLoginResponse>("/auth/login", { email, password })
      const mapped = mapApiUser({ ...response.user, isEmailConfirmed: true })

      // Check if 2FA is required
      if (mapped && (response.user as any).totpEnabled) {
        // Store tokens temporarily
        if (typeof window !== "undefined") {
          sessionStorage.setItem("2fa_pending_user", JSON.stringify(mapped))
          sessionStorage.setItem("2fa_pending_tokens", JSON.stringify({
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
          }))
        }

        logAuditEvent("login_2fa_required", mapped.id, { email })
        // Redirect to 2FA verification
        router.replace(`/auth/verify-2fa?userId=${mapped.id}`)
        return
      }

      // Normal login (no 2FA)
      if (typeof window !== "undefined") {
        localStorage.setItem("auth_user", JSON.stringify(mapped))
        localStorage.setItem("auth_token", response.accessToken)
        localStorage.setItem("auth_refresh_token", response.refreshToken)
      }
      userDataService.setContext(mapped, mapped.defaultOrganizationId)
      logAuditEvent("login_success", mapped.id, { email })
      setUser(mapped)
      router.replace("/dashboard")
    } catch (error) {
      const status = (error as { status?: number }).status
      logAuditEvent("login_failure", null, { email, error: (error as Error).message })
      if (status === 403) {
        router.replace(`/auth/verify-pending?email=${encodeURIComponent(email)}`)
        throw new Error("Confirme seu email para acessar.")
      }
      if (status === 401) throw new Error("Email ou senha inválidos")
      if (status === 429) throw new Error("Muitas tentativas. Tente novamente em alguns instantes")
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (data: RegisterData) => {
    setIsLoading(true)
    try {
      const validation = validateRegistrationForm(data)
      if (!validation.isValid) {
        throw new Error(validation.errors[0])
      }
      if (!USE_API) {
        throw new Error("Cadastro local desativado neste ambiente. Use o backend de auth.")
      }
      const response = await api.post<ApiRegisterResponse>("/auth/register", {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        cpfCnpj: data.cpfCnpj,
      })
      logAuditEvent("user_created", response.user.id, { email: data.email })
      toast.success("Conta criada! Confira seu email para confirmar.")
      router.replace(`/auth/verify-pending?email=${encodeURIComponent(data.email)}`)
    } catch (error) {
      const status = (error as { status?: number }).status
      if (status === 409) throw new Error("Email já está em uso")
      throw error
    } finally {
      setIsLoading(false)
    }
  }

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

  const resendConfirmation = async (email?: string) => {
    if (!USE_API) throw new Error("Disponível somente com backend ativo")
    const target = email || user?.email
    if (target) {
      // Endpoint público com anti-enumeration — funciona mesmo sem JWT.
      await api.post<{ success: boolean }>("/auth/email/resend-verification", { email: target })
    } else {
      await api.post<{ success: boolean }>("/auth/email/request-verification", {})
    }
  }

  const forgotPassword = async (email: string) => {
    if (!USE_API) throw new Error("Disponível somente com backend ativo")
    await api.post<{ success: boolean }>("/auth/password/forgot", { email })
  }

  const resetPasswordWithToken = async (token: string, newPassword: string) => {
    if (!USE_API) throw new Error("Disponível somente com backend ativo")
    await api.post<{ success: boolean }>("/auth/password/reset", { token, newPassword })
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
    login,
    register,
    logout,
    logoutAllDevices,
    resendConfirmation,
    forgotPassword,
    resetPasswordWithToken,
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
