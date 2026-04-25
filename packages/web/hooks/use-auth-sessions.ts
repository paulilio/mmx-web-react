"use client"

import { useCallback, useState } from "react"
import { useAuth } from "./use-auth"
import { api } from "@/lib/client/api"

export interface Session {
  id: string
  deviceFingerprint?: string | null
  userAgent?: string | null
  lastIp?: string | null
  lastActivityAt: string
  createdAt: string
  expiresAt: string
}

export interface SessionsResponse {
  sessions: Session[]
  count: number
}

/**
 * Hook para gerenciar sessões ativas do usuário
 * Permite listar, revogar e logout de outros dispositivos
 */
export function useAuthSessions() {
  const { user } = useAuth()
  const [sessions, setSessions] = useState<Session[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Fetch all active sessions for current user
   */
  const fetchSessions = useCallback(async () => {
    if (!user) {
      setError("User not authenticated")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await api.get<SessionsResponse>("/auth/sessions")
      setSessions(response.sessions || [])
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch sessions"
      setError(message)
      console.error("[useAuthSessions] Fetch failed:", err)
    } finally {
      setIsLoading(false)
    }
  }, [user])

  /**
   * Revoke a specific session
   */
  const revokeSession = useCallback(
    async (sessionId: string) => {
      if (!user) {
        setError("User not authenticated")
        return false
      }

      try {
        await api.delete(`/auth/sessions/${sessionId}`)
        setSessions((prev) => prev.filter((s) => s.id !== sessionId))
        return true
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to revoke session"
        setError(message)
        console.error("[useAuthSessions] Revoke failed:", err)
        return false
      }
    },
    [user],
  )

  /**
   * Revoke all other sessions (logout all other devices)
   */
  const revokeAllOthers = useCallback(async () => {
    if (!user) {
      setError("User not authenticated")
      return 0
    }

    try {
      const response = await api.delete<{ revokedCount: number }>("/auth/sessions")
      const revokedCount = response.revokedCount || 0

      // Keep only current session (if in list)
      setSessions((prev) => (prev.length > 0 ? prev.slice(0, 1) : prev))
      return revokedCount
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to revoke sessions"
      setError(message)
      console.error("[useAuthSessions] Revoke all failed:", err)
      return 0
    }
  }, [user])

  /**
   * Clear error message
   */
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    sessions,
    isLoading,
    error,
    fetchSessions,
    revokeSession,
    revokeAllOthers,
    clearError,
  }
}
