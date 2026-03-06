"use client"

import { createContext, useContext, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import type { ReactNode } from "react"
import { toast } from "react-toastify"
import type { User, SessionData, RegisterData } from "@/types/auth"
import { generateSessionToken, generateUserId, createDefaultAccount, logAuditEvent } from "@/lib/utils"
import { validateRegistrationForm } from "@/lib/auth-validations"
import { userDataService } from "@/lib/user-data-service"
import { migrationService, UNIFIED_STORAGE_KEYS } from "@/lib/migration-service"

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
      console.log("[v0] Login attempt - email:", email, "password:", password)

      const usersData = migrationService.getUserData(UNIFIED_STORAGE_KEYS.users, "global") || []
      const globalUsers = localStorage.getItem("users")
      const users = globalUsers ? JSON.parse(globalUsers) : usersData

      const user = users.find((u: any) => u.email === email)

      if (!user) {
        throw new Error("Usuário não encontrado")
      }

      console.log("[v0] Found user:", user.email, "stored password:", user.password)

      if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
        throw new Error("Conta bloqueada devido a muitas tentativas de login")
      }

      console.log(
        "[v0] Password comparison - stored:",
        user.password,
        "provided:",
        password,
        "match:",
        user.password === password,
      )

      if (user.password !== password) {
        user.failedAttempts = (user.failedAttempts || 0) + 1

        if (user.failedAttempts >= 5) {
          user.lockedUntil = new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutes
          toast.error("Conta bloqueada por 30 minutos devido a muitas tentativas")
        }

        const updatedUsers = users.map((u: any) => (u.id === user.id ? { ...u, userId: u.id } : { ...u, userId: u.id }))
        localStorage.setItem("users", JSON.stringify(updatedUsers))

        throw new Error("Senha incorreta")
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

      console.log("[v0] Login successful, redirecting to dashboard...")
      console.log("[v0] Current router state:", { pathname: window.location.pathname })

      try {
        router.replace("/dashboard")
        console.log("[v0] Router.replace executed")

        setTimeout(() => {
          if (window.location.pathname === "/auth") {
            console.log("[v0] Still on auth page, forcing navigation with window.location")
            window.location.href = "/dashboard"
          }
        }, 500)
      } catch (routerError) {
        console.error("[v0] Router error:", routerError)
        window.location.href = "/dashboard"
      }

      console.log("[v0] Redirect commands executed")
    } catch (error) {
      logAuditEvent("login_failure", null, { email, error: (error as Error).message })
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
        password: data.password,
        failedAttempts: 0,
        lockedUntil: null,
      }

      users.push(userWithPassword)
      localStorage.setItem("users", JSON.stringify(users))

      userDataService.setContext(newUser, organizationId)

      createDefaultAccount(newUser.id)

      logAuditEvent("user_created", newUser.id, { email: data.email })

      setUser(newUser)
      localStorage.setItem("auth_user", JSON.stringify(newUser))

      toast.success("Conta criada com sucesso! Redirecionando para confirmação...")

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
    userDataService.cleanupUserData()

    localStorage.removeItem("auth_session")
    localStorage.removeItem("auth_user")
    setUser(null)
    router.push("/auth")
  }

  const switchOrganization = async (organizationId: string) => {
    if (!user) return

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
        const resetToken = "RESET-123"
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
        toast.success("Instruções de recuperação enviadas para seu email.")
      } else {
        toast.success("Se o email existir em nossa base, você receberá instruções de recuperação.")
      }
    } catch (error) {
      toast.error("Erro ao processar solicitação. Tente novamente.")
    }
  }

  const confirmEmail = async (code: string): Promise<boolean> => {
    try {
      console.log("[v0] Attempting to confirm email with code:", code)

      if (code === "XPX-7F5G") {
        console.log("[v0] Test code detected, confirming email")

        let targetUser = user
        let targetEmail = user?.email

        if (!user) {
          console.log("[v0] No user found in context, checking URL params")
          const urlParams = new URLSearchParams(window.location.search)
          targetEmail = urlParams.get("email")

          if (targetEmail) {
            const usersData = migrationService.getUserData(UNIFIED_STORAGE_KEYS.users, "global") || []
            const globalUsers = localStorage.getItem("users")
            const users = globalUsers ? JSON.parse(globalUsers) : usersData

            targetUser = users.find((u: any) => u.email === targetEmail)
            console.log("[v0] Found user by email:", targetUser?.email)
          }
        }

        if (!targetUser || !targetEmail) {
          console.log("[v0] No user or email found")
          return false
        }

        const usersData = migrationService.getUserData(UNIFIED_STORAGE_KEYS.users, "global") || []
        const globalUsers = localStorage.getItem("users")
        const users = globalUsers ? JSON.parse(globalUsers) : usersData

        const updatedUsers = users.map((u: any) => {
          if (u.id === targetUser.id) {
            return { ...u, isEmailConfirmed: true, userId: u.id }
          }
          return { ...u, userId: u.id }
        })

        localStorage.setItem("users", JSON.stringify(updatedUsers))

        if (user && user.id === targetUser.id) {
          const updatedUser = { ...user, isEmailConfirmed: true }
          setUser(updatedUser)
          localStorage.setItem("auth_user", JSON.stringify(updatedUser))
        }

        const confirmedUser = updatedUsers.find((u: any) => u.id === targetUser.id)

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

        logAuditEvent("email_confirmed", targetUser.id, { email: targetEmail, code })
        logAuditEvent("login_success", confirmedUser.id, { email: targetEmail, source: "email_confirmation" })

        console.log("[v0] Email confirmed successfully and user logged in")
        return true
      }

      const confirmationCodesData = migrationService.getUserData(UNIFIED_STORAGE_KEYS.authSessions, "global") || []
      const globalConfirmationCodes = localStorage.getItem("confirmation_codes")
      const confirmationCodes = globalConfirmationCodes ? JSON.parse(globalConfirmationCodes) : confirmationCodesData

      const validCode = confirmationCodes.find(
        (c: any) => c.code === code && c.email === user?.email && new Date(c.expiresAt) > new Date() && !c.used,
      )

      if (validCode && user) {
        console.log("[v0] Valid confirmation code found")

        const updatedCodes = confirmationCodes.map((c: any) =>
          c.code === code ? { ...c, used: true, userId: c.userId || user.id } : { ...c, userId: c.userId || user.id },
        )
        localStorage.setItem("confirmation_codes", JSON.stringify(updatedCodes))

        const usersData = migrationService.getUserData(UNIFIED_STORAGE_KEYS.users, "global") || []
        const globalUsers = localStorage.getItem("users")
        const users = globalUsers ? JSON.parse(globalUsers) : usersData

        const updatedUsers = users.map((u: any) => {
          if (u.id === user.id) {
            return { ...u, isEmailConfirmed: true, userId: u.id }
          }
          return { ...u, userId: u.id }
        })

        localStorage.setItem("users", JSON.stringify(updatedUsers))

        const confirmedUser = updatedUsers.find((u: any) => u.id === user.id)

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

        logAuditEvent("email_confirmed", user.id, { email: user.email, code })
        logAuditEvent("login_success", confirmedUser.id, { email: user.email, source: "email_confirmation" })

        console.log("[v0] Email confirmed successfully and user logged in")
        return true
      }

      console.log("[v0] Invalid or expired confirmation code")
      logAuditEvent("email_confirmation_failed", user?.id || null, {
        email: user?.email,
        code,
        reason: "invalid_code",
      })

      return false
    } catch (error) {
      console.error("[v0] Error confirming email:", error)
      logAuditEvent("email_confirmation_error", user?.id || null, {
        email: user?.email,
        code,
        error: (error as Error).message,
      })
      return false
    }
  }

  const resendConfirmation = async (email?: string): Promise<void> => {
    try {
      console.log("[v0] Resending confirmation code")

      let targetEmail = email || user?.email
      let targetUser = user

      if (!targetEmail) {
        const urlParams = new URLSearchParams(window.location.search)
        targetEmail = urlParams.get("email")
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

      console.log("[v0] Resending confirmation for email:", targetEmail)

      const newCode = "XPX-" + Math.random().toString(36).substring(2, 6).toUpperCase()
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
        newCode,
      })

      console.log("[v0] New confirmation code generated:", newCode)

      toast.success(`Novo código enviado! Código de teste: ${newCode}`)
    } catch (error) {
      console.error("[v0] Error resending confirmation:", error)
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
