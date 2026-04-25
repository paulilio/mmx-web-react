"use client"

import { useCallback, useState } from "react"
import { useAuth } from "./use-auth"
import { api } from "@/lib/client/api"

export interface TwoFactorSetup {
  secret: string
  qrCode: string // Data URL
}

export interface TwoFactorStatus {
  enabled: boolean
  enabledAt?: string
}

/**
 * Hook para gerenciar 2FA (Two-Factor Authentication)
 * Permite enable/disable TOTP e verificar código durante login
 */
export function use2FA() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [setupData, setSetupData] = useState<TwoFactorSetup | null>(null)

  /**
   * Fetch 2FA setup data (QR code e secret)
   */
  const fetchSetupData = useCallback(async () => {
    if (!user) {
      setError("User not authenticated")
      return null
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await api.get<TwoFactorSetup>("/auth/2fa/setup")
      setSetupData(response)
      return response
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch 2FA setup"
      setError(message)
      console.error("[use2FA] Fetch setup failed:", err)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [user])

  /**
   * Enable 2FA with TOTP code
   */
  const enableTwoFactor = useCallback(
    async (secret: string, token: string) => {
      if (!user) {
        setError("User not authenticated")
        return false
      }

      setIsLoading(true)
      setError(null)

      try {
        await api.post<{ success: boolean; backupCodes: string[] }>("/auth/2fa/setup", {
          secret,
          token,
        })

        setSetupData(null)
        return true
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to enable 2FA"
        setError(message)
        console.error("[use2FA] Enable failed:", err)
        return false
      } finally {
        setIsLoading(false)
      }
    },
    [user],
  )

  /**
   * Disable 2FA
   */
  const disableTwoFactor = useCallback(async () => {
    if (!user) {
      setError("User not authenticated")
      return false
    }

    setIsLoading(true)
    setError(null)

    try {
      await api.delete("/auth/2fa")
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to disable 2FA"
      setError(message)
      console.error("[use2FA] Disable failed:", err)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [user])

  /**
   * Verify 2FA code during login and return tokens
   */
  const verifyLoginCode = useCallback(
    async (userId: string, totpToken?: string, backupCode?: string) => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await api.post<{ 
          success: boolean
          accessToken?: string
          refreshToken?: string
          expiresIn?: number
        }>("/auth/2fa/verify-login", {
          userId,
          totpToken,
          backupCode,
        })

        // Store tokens if returned
        if (response.accessToken && typeof window !== "undefined") {
          localStorage.setItem("auth_token", response.accessToken)
          if (response.refreshToken) {
            localStorage.setItem("auth_refresh_token", response.refreshToken)
          }
        }

        return response.success
      } catch (err) {
        const message = err instanceof Error ? err.message : "Invalid 2FA code"
        setError(message)
        console.error("[use2FA] Verify failed:", err)
        return false
      } finally {
        setIsLoading(false)
      }
    },
    [],
  )

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    isLoading,
    error,
    setupData,
    fetchSetupData,
    enableTwoFactor,
    disableTwoFactor,
    verifyLoginCode,
    clearError,
  }
}
