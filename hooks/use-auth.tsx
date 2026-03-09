"use client"

import { createContext, useContext, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import type { ReactNode } from "react"
import { toast } from "react-toastify"
import type { User, SessionData, RegisterData } from "@/types/auth"
import { api } from "@/lib/client/api"
import { USE_API } from "@/lib/shared/config"
import { generateSessionToken, generateUserId, createDefaultAccount, logAuditEvent } from "@/lib/shared/utils"
import { validateRegistrationForm } from "@/lib/shared/auth-validations"
import { hashMockPassword, isHashedMockPassword, verifyMockPassword } from "@/lib/shared/mock-auth-password"
import { consumeTimedValue, generateConfirmationCode, generateResetToken } from "@/lib/shared/mock-auth-flow"
import { userDataService } from "@/lib/server/user-data-service"
import { migrationService, UNIFIED_STORAGE_KEYS } from "@/lib/server/migration-service"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
  confirmEmail: (code: string) => Promise<boolean>
  resendConfirmation: (email?: string) => Promise<void>
  switchOrganization: (organizationId: string) => Promise<void>
  resetPassword: (email: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const IS_DEV_MODE = process.env.NODE_ENV !== "production"

type ApiLoginResponse = {
  accessToken: string
  refreshToken: string
  expiresIn: number
  user: {
    id: string
    email: string
    firstName: string
    lastName: string
    planType?: User["planType"]
  }
}

function parseApiErrorMessage(rawMessage: string): string {
  try {
    const parsed = JSON.parse(rawMessage) as {
      error?: {
        message?: string
      }
    }
    return parsed.error?.message || rawMessage
  } catch {
    return rawMessage
  }
}

function mapApiLoginUser(data: ApiLoginResponse["user"]): User {
  return {
    id: data.id,
    email: data.email,
    firstName: data.firstName,
    lastName: data.lastName,
    isEmailConfirmed: true,
    createdAt: new Date().toISOString(),
    planType: data.planType || "free",
    preferences: {
      theme: "system",
      language: "pt-BR",
      notifications: {
        email: true,
        push: true,
        sms: false,
      },
      layout: {
        sidebarCollapsed: false,
        compactMode: false,
      },
    },
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (migrationService.needsMigration()) {
          console.log("[Auth] Running automatic migration on startup...")
          await migrationService.migrateToUnifiedStructure()
        }

        if (USE_API) {
          const userData = localStorage.getItem("auth_user")
          if (!userData) {
            return
          }

          const apiUser = JSON.parse(userData) as User
          setUser(apiUser)
          userDataService.setContext(apiUser, apiUser.defaultOrganizationId)
          return
        }

        const sessionData = localStorage.getItem("auth_session")
        if (sessionData) {
          const session: SessionData = JSON.parse(sessionData)

          if (new Date(session.expiresAt) > new Date()) {
            const userData = localStorage.getItem("auth_user")
            if (userData) {
              const user = JSON.parse(userData)
              setUser(user)

              userDataService.setContext(user, session.organizationId)

              console.log("[Auth] User context set, migration handled automatically")
            }
          } else {
            localStorage.removeItem("auth_session")
            localStorage.removeItem("auth_user")
          }
        }
      } catch (error) {
        console.error("Error initializing auth:", error)
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)

    try {
      console.log("[Auth] Login attempt")

      if (USE_API) {
        const response = await api.post<ApiLoginResponse>("/auth/login", {
          email,
          password,
        })

        const authenticatedUser = mapApiLoginUser(response.user)

        localStorage.removeItem("auth_session")
        localStorage.setItem("auth_user", JSON.stringify(authenticatedUser))

        userDataService.setContext(authenticatedUser, authenticatedUser.defaultOrganizationId)

        logAuditEvent("login_success", authenticatedUser.id, { email })

        setUser(authenticatedUser)

        router.replace("/dashboard")
        return
      }

      const usersData = migrationService.getUserData(UNIFIED_STORAGE_KEYS.users, "global") || []
      const globalUsers = localStorage.getItem("users")
      const users = globalUsers ? JSON.parse(globalUsers) : usersData

      const user = users.find((u: any) => u.email === email)

      if (!user) {
        throw new Error("Usuário não encontrado")
      }

      if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
        throw new Error("Conta bloqueada devido a muitas tentativas de login")
      }

      const isValidPassword = await verifyMockPassword(user.password, password)

      if (!isValidPassword) {
        user.failedAttempts = (user.failedAttempts || 0) + 1

        if (user.failedAttempts >= 5) {
          user.lockedUntil = new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutes
          toast.error("Conta bloqueada por 30 minutos devido a muitas tentativas")
        }

        const updatedUsers = users.map((u: any) => (u.id === user.id ? { ...u, userId: u.id } : { ...u, userId: u.id }))
        localStorage.setItem("users", JSON.stringify(updatedUsers))

        throw new Error("Senha incorreta")
      }

      if (!isHashedMockPassword(user.password)) {
        user.password = await hashMockPassword(password)
      }

      if (!user.isEmailConfirmed) {
        router.push(`/auth/confirm?email=${encodeURIComponent(user.email)}`)
        throw new Error("Email não confirmado. Redirecionando para confirmação...")
      }

      user.failedAttempts = 0
      user.lockedUntil = null
      user.lastLogin = new Date().toISOString()

      const updatedUsers = users.map((u: any) =>
        u.id === user.id ? { ...user, userId: user.id } : { ...u, userId: u.id },
      )
      localStorage.setItem("users", JSON.stringify(updatedUsers))

      const sessionToken = generateSessionToken()
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutes

      const sessionData: SessionData = {
        token: sessionToken,
        userId: user.id,
        organizationId: user.defaultOrganizationId,
        expiresAt,
      }

      localStorage.setItem("auth_session", JSON.stringify(sessionData))
      localStorage.setItem("auth_user", JSON.stringify(user))

      userDataService.setContext(user, user.defaultOrganizationId)

      logAuditEvent("login_success", user.id, { email })

      setUser(user)

      console.log("[Auth] Login successful, redirecting to dashboard")

      try {
        router.replace("/dashboard")

        setTimeout(() => {
          if (window.location.pathname === "/auth") {
            console.log("[Auth] Fallback navigation to dashboard")
            window.location.href = "/dashboard"
          }
        }, 500)
      } catch (routerError) {
        console.error("[Auth] Router error:", routerError)
        window.location.href = "/dashboard"
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro no login"
      const parsedMessage = parseApiErrorMessage(message)
      const errorWithStatus = error as { status?: number }

      if (USE_API) {
        logAuditEvent("login_failure", null, { email, error: parsedMessage })

        if (errorWithStatus.status === 401) {
          throw new Error("Email ou senha inválidos")
        }

        if (errorWithStatus.status === 429) {
          throw new Error("Muitas tentativas de login. Tente novamente em instantes")
        }

        if (errorWithStatus.status === 0) {
          throw new Error("Não foi possível conectar com o servidor")
        }

        if (typeof errorWithStatus.status === "number" && errorWithStatus.status >= 500) {
          throw new Error("Serviço de autenticação indisponível. Tente novamente em instantes")
        }

        throw new Error("Não foi possível realizar login. Verifique seus dados e tente novamente")
      }

      logAuditEvent("login_failure", null, { email, error: parsedMessage })
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

      const usersData = migrationService.getUserData(UNIFIED_STORAGE_KEYS.users, "global") || []
      const globalUsers = localStorage.getItem("users")
      const users = globalUsers ? JSON.parse(globalUsers) : usersData

      if (users.some((u: any) => u.email === data.email)) {
        throw new Error("Email já está em uso")
      }

      const organizationId = "org_" + Math.random().toString(36).substring(2)

      const newUser: User = {
        id: generateUserId(),
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        cpfCnpj: data.cpfCnpj,
        isEmailConfirmed: false,
        defaultOrganizationId: organizationId,
        organizations: [
          {
            id: organizationId,
            name: data.organizationName || `${data.firstName} ${data.lastName}`,
            role: "owner",
            permissions: ["*"],
            joinedAt: new Date().toISOString(),
          },
        ],
        createdAt: new Date().toISOString(),
        planType: "free",
        preferences: {
          theme: "system",
          language: "pt-BR",
          notifications: {
            email: true,
            push: true,
            sms: false,
          },
          layout: {
            sidebarCollapsed: false,
            compactMode: false,
          },
        },
      }

      const userWithPassword = {
        ...newUser,
        userId: newUser.id,
        password: await hashMockPassword(data.password),
        failedAttempts: 0,
        lockedUntil: null,
      }

      users.push(userWithPassword)
      localStorage.setItem("users", JSON.stringify(users))

      const confirmationCode = generateConfirmationCode()
      const confirmationCodesData = migrationService.getUserData(UNIFIED_STORAGE_KEYS.authSessions, "global") || []
      const globalConfirmationCodes = localStorage.getItem("confirmation_codes")
      const confirmationCodes = globalConfirmationCodes ? JSON.parse(globalConfirmationCodes) : confirmationCodesData

      const filteredCodes = confirmationCodes.filter((c: { email?: string }) => c.email !== data.email)
      filteredCodes.push({
        email: data.email,
        code: confirmationCode,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        used: false,
        createdAt: new Date().toISOString(),
        userId: newUser.id,
      })
      localStorage.setItem("confirmation_codes", JSON.stringify(filteredCodes))

      userDataService.setContext(newUser, organizationId)

      createDefaultAccount(newUser.id)

      logAuditEvent("user_created", newUser.id, { email: data.email })

      setUser(newUser)
      localStorage.setItem("auth_user", JSON.stringify(newUser))

      if (IS_DEV_MODE) {
        toast.success(`Conta criada com sucesso! Codigo de teste: ${confirmationCode}`)
      } else {
        toast.success("Conta criada com sucesso! Redirecionando para confirmação...")
      }

      setTimeout(() => {
        router.push(`/auth/confirm?email=${encodeURIComponent(data.email)}`)
      }, 1000)
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    if (USE_API) {
      // Keep logout signature sync while still revoking server refresh session/cookies.
      void api.post<{ success: boolean }>("/auth/logout", {}).catch(() => {
        // Local cleanup must still happen even when backend logout is unavailable.
      })
    }

    userDataService.cleanupUserData()

    localStorage.removeItem("auth_session")
    localStorage.removeItem("auth_user")
    setUser(null)
    router.push("/auth")
  }

  const switchOrganization = async (organizationId: string) => {
    if (!user) return

    if (USE_API) {
      userDataService.setContext(user, organizationId)
      logAuditEvent("organization_switched", user.id, { organizationId, source: "api_mode" })
      toast.success("Organização alterada com sucesso!")
      window.location.reload()
      return
    }

    try {
      const sessionData = localStorage.getItem("auth_session")
      if (sessionData) {
        const session: SessionData = JSON.parse(sessionData)
        session.organizationId = organizationId
        localStorage.setItem("auth_session", JSON.stringify(session))

        userDataService.setContext(user, organizationId)

        logAuditEvent("organization_switched", user.id, { organizationId })

        toast.success("Organização alterada com sucesso!")

        window.location.reload()
      }
    } catch (error) {
      toast.error("Erro ao alterar organização")
    }
  }

  const resetPassword = async (email: string) => {
    try {
      const usersData = migrationService.getUserData(UNIFIED_STORAGE_KEYS.users, "global") || []
      const globalUsers = localStorage.getItem("users")
      const users = globalUsers ? JSON.parse(globalUsers) : usersData

      const user = users.find((u: any) => u.email === email)

      if (user) {
        const resetToken = generateResetToken()
        const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000).toISOString()

        const resetTokensData = migrationService.getUserData(UNIFIED_STORAGE_KEYS.authSessions, "global") || []
        const globalResetTokens = localStorage.getItem("reset_tokens")
        const resetTokens = globalResetTokens ? JSON.parse(globalResetTokens) : resetTokensData

        resetTokens.push({
          email,
          token: resetToken,
          expiresAt: resetTokenExpiry,
          used: false,
          createdAt: new Date().toISOString(),
          userId: user.id,
        })
        localStorage.setItem("reset_tokens", JSON.stringify(resetTokens))

        logAuditEvent("password_reset_requested", user.id, { email })

        if (IS_DEV_MODE) {
          toast.success(`Instrucoes de recuperacao enviadas. Token de teste: ${resetToken}`)
        } else {
          toast.success("Instruções de recuperação enviadas para seu email.")
        }
      } else {
        toast.success("Se o email existir em nossa base, você receberá instruções de recuperação.")
      }
    } catch (error) {
      toast.error("Erro ao processar solicitação. Tente novamente.")
    }
  }

  const confirmEmail = async (code: string): Promise<boolean> => {
    try {
      const confirmationCodesData = migrationService.getUserData(UNIFIED_STORAGE_KEYS.authSessions, "global") || []
      const globalConfirmationCodes = localStorage.getItem("confirmation_codes")
      const confirmationCodes = globalConfirmationCodes ? JSON.parse(globalConfirmationCodes) : confirmationCodesData

      const targetEmail =
        user?.email || (typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("email") : null)

      if (!targetEmail) {
        return false
      }

      const consumeResult = consumeTimedValue(confirmationCodes, targetEmail, code, "code")
      if (!consumeResult.valid) {
        logAuditEvent("email_confirmation_failed", user?.id || null, {
          email: targetEmail,
          reason: "invalid_code",
        })
        return false
      }

      localStorage.setItem("confirmation_codes", JSON.stringify(consumeResult.updatedRecords))

      const usersData = migrationService.getUserData(UNIFIED_STORAGE_KEYS.users, "global") || []
      const globalUsers = localStorage.getItem("users")
      const users = globalUsers ? JSON.parse(globalUsers) : usersData

      const targetUser = users.find((u: { email?: string }) => u.email === targetEmail)
      if (!targetUser) {
        return false
      }

      const updatedUsers = users.map((u: { id: string; userId?: string; isEmailConfirmed?: boolean }) => {
        if (u.id === targetUser.id) {
          return { ...u, isEmailConfirmed: true, userId: u.id }
        }
        return { ...u, userId: u.id }
      })
      localStorage.setItem("users", JSON.stringify(updatedUsers))

      const confirmedUser = updatedUsers.find((u: { id: string }) => u.id === targetUser.id)
      if (!confirmedUser) {
        return false
      }

      const sessionToken = generateSessionToken()
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutes

      const sessionData: SessionData = {
        token: sessionToken,
        userId: confirmedUser.id,
        organizationId: confirmedUser.defaultOrganizationId,
        expiresAt,
      }

      localStorage.setItem("auth_session", JSON.stringify(sessionData))
      localStorage.setItem("auth_user", JSON.stringify(confirmedUser))

      userDataService.setContext(confirmedUser, confirmedUser.defaultOrganizationId)

      setUser(confirmedUser)

      logAuditEvent("email_confirmed", targetUser.id, { email: targetEmail })
      logAuditEvent("login_success", confirmedUser.id, { email: targetEmail, source: "email_confirmation" })

      return true
    } catch (error) {
      console.error("[Auth] Error confirming email:", error)
      logAuditEvent("email_confirmation_error", user?.id || null, {
        email: user?.email,
        error: (error as Error).message,
      })
      return false
    }
  }

  const resendConfirmation = async (email?: string): Promise<void> => {
    try {
      console.log("[Auth] Resending confirmation code")

      let targetEmail = email || user?.email
      let targetUser = user

      if (!targetEmail) {
        const urlParams = new URLSearchParams(window.location.search)
        targetEmail = urlParams.get("email") ?? undefined
      }

      if (!targetEmail) {
        throw new Error("Email não encontrado")
      }

      if (!targetUser) {
        const usersData = migrationService.getUserData(UNIFIED_STORAGE_KEYS.users, "global") || []
        const globalUsers = localStorage.getItem("users")
        const users = globalUsers ? JSON.parse(globalUsers) : usersData

        targetUser = users.find((u: any) => u.email === targetEmail)
      }

      if (!targetUser) {
        throw new Error("Usuário não encontrado")
      }

      const newCode = generateConfirmationCode()
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours

      const confirmationCodesData = migrationService.getUserData(UNIFIED_STORAGE_KEYS.authSessions, "global") || []
      const globalConfirmationCodes = localStorage.getItem("confirmation_codes")
      const confirmationCodes = globalConfirmationCodes ? JSON.parse(globalConfirmationCodes) : confirmationCodesData

      const filteredCodes = confirmationCodes.filter((c: any) => c.email !== targetEmail)

      filteredCodes.push({
        email: targetEmail,
        code: newCode,
        expiresAt,
        used: false,
        createdAt: new Date().toISOString(),
        userId: targetUser.id,
      })

      localStorage.setItem("confirmation_codes", JSON.stringify(filteredCodes))

      logAuditEvent("confirmation_code_resent", targetUser.id, {
        email: targetEmail,
      })

      if (IS_DEV_MODE) {
        toast.success(`Novo codigo enviado. Codigo de teste: ${newCode}`)
      } else {
        toast.success("Novo codigo enviado com sucesso")
      }
    } catch (error) {
      console.error("[Auth] Error resending confirmation:", error)
      logAuditEvent("confirmation_resend_error", null, {
        email: email || user?.email,
        error: (error as Error).message,
      })
      throw error
    }
  }

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    register,
    logout,
    confirmEmail,
    resendConfirmation,
    switchOrganization,
    resetPassword,
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
