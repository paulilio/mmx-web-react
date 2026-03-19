"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { api } from "@/lib/client/api"
import { USE_API } from "@/lib/shared/config"
import { logAuditEvent } from "@/lib/shared/utils"

interface SessionData {
  token: string
  userId: string
  expiresAt: string
}

type ApiRefreshResponse = {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

const DEFAULT_API_ACCESS_EXPIRES_IN_SECONDS = 15 * 60
const API_SESSION_TOKEN = "cookie-session"

interface SessionHook {
  isSessionValid: boolean
  sessionData: SessionData | null
  refreshSession: () => Promise<void>
  clearSession: () => void
  extendSession: () => void
  timeUntilExpiry: number | null
}

export function useSession(): SessionHook {
  const [sessionData, setSessionData] = useState<SessionData | null>(null)
  const [isSessionValid, setIsSessionValid] = useState(false)
  const [timeUntilExpiry, setTimeUntilExpiry] = useState<number | null>(null)
  const router = useRouter()

  const sessionDataRef = useRef<SessionData | null>(null)
  const isSessionValidRef = useRef(false)
  const isRefreshingRef = useRef(false)

  // Update refs when state changes
  useEffect(() => {
    sessionDataRef.current = sessionData
  }, [sessionData])

  useEffect(() => {
    isSessionValidRef.current = isSessionValid
  }, [isSessionValid])

  const getCurrentUserId = useCallback((): string | null => {
    try {
      const userData = localStorage.getItem("auth_user")
      if (!userData) return null

      const parsedUser = JSON.parse(userData) as { id?: string }
      return parsedUser.id || null
    } catch {
      return null
    }
  }, [])

  const buildApiSession = useCallback((userId: string, expiresInSeconds?: number): SessionData => {
    const ttlSeconds = expiresInSeconds && expiresInSeconds > 0 ? expiresInSeconds : DEFAULT_API_ACCESS_EXPIRES_IN_SECONDS
    return {
      token: API_SESSION_TOKEN,
      userId,
      expiresAt: new Date(Date.now() + ttlSeconds * 1000).toISOString(),
    }
  }, [])

  const applySessionState = useCallback((session: SessionData) => {
    const expiryTime = new Date(session.expiresAt).getTime()
    const timeLeft = Math.max(0, expiryTime - Date.now())

    setSessionData(session)
    setIsSessionValid(timeLeft > 0)
    setTimeUntilExpiry(Math.floor(timeLeft / 1000))
  }, [])

  const resetSessionState = useCallback(() => {
    setSessionData(null)
    setIsSessionValid(false)
    setTimeUntilExpiry(null)
  }, [])

  const clearSession = useCallback(() => {
    const currentSession = sessionDataRef.current
    localStorage.removeItem("auth_session")
    localStorage.removeItem("auth_user")
    resetSessionState()

    if (currentSession) {
      logAuditEvent("session_cleared", currentSession.userId, {
        sessionToken: `${currentSession.token.substring(0, 8)}...`,
        clearedAt: new Date().toISOString(),
      })
    }
  }, [resetSessionState])

  const refreshSession = useCallback(async () => {
    if (isRefreshingRef.current) {
      return
    }

    if (!USE_API) {
      const currentSessionData = sessionDataRef.current
      if (!currentSessionData) return

      try {
        const newExpiryTime = new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutes
        const updatedSession: SessionData = {
          ...currentSessionData,
          expiresAt: newExpiryTime,
        }

        localStorage.setItem("auth_session", JSON.stringify(updatedSession))
        applySessionState(updatedSession)

        logAuditEvent("session_extended", currentSessionData.userId, {
          previousExpiry: currentSessionData.expiresAt,
          newExpiry: newExpiryTime,
          extensionDuration: "30 minutes",
        })
      } catch (error) {
        console.error("Error extending session:", error)
      }

      return
    }

    const userId = getCurrentUserId()
    if (!userId) {
      clearSession()
      return
    }

    isRefreshingRef.current = true
    try {
      const response = await api.post<ApiRefreshResponse>("/auth/refresh", {})
      const refreshedSession = buildApiSession(userId, response.expiresIn)
      applySessionState(refreshedSession)

      logAuditEvent("session_extended", userId, {
        source: "api_refresh",
        newExpiry: refreshedSession.expiresAt,
      })
    } catch (error) {
      const status = (error as { status?: number }).status

      logAuditEvent("session_refresh_failed", userId, {
        status: status ?? null,
      })

      clearSession()

      if (status === 429) {
        toast.warning("Muitas tentativas de renovação. Tente novamente em instantes")
        return
      }

      toast.error("Sessão expirada. Faça login novamente.")
      router.push("/auth")
    } finally {
      isRefreshingRef.current = false
    }
  }, [applySessionState, buildApiSession, clearSession, getCurrentUserId, router])

  const checkSession = useCallback(async () => {
    try {
      const userId = getCurrentUserId()
      if (!userId) {
        resetSessionState()
        return
      }

      if (USE_API) {
        const currentSession = sessionDataRef.current

        if (currentSession) {
          const currentSessionTimeLeft = new Date(currentSession.expiresAt).getTime() - Date.now()
          if (currentSessionTimeLeft > 0) {
            applySessionState(currentSession)
            return
          }
        }

        await refreshSession()
        return
      }

      const sessionString = localStorage.getItem("auth_session")

      if (!sessionString) {
        resetSessionState()
        return
      }

      const session: SessionData = JSON.parse(sessionString)
      const expiryTime = new Date(session.expiresAt).getTime()
      const currentTime = Date.now()
      const timeLeft = expiryTime - currentTime

      if (timeLeft <= 0) {
        // Session expired
        logAuditEvent("session_expired", session.userId, {
          expiryTime: session.expiresAt,
          currentTime: new Date().toISOString(),
        })

        if (USE_API) {
          await refreshSession()
        } else {
          clearSession()
          toast.error("Sessão expirada. Faça login novamente.")
          router.push("/auth")
        }

        return
      }

      applySessionState(session)

      // Warn user when session is about to expire (5 minutes before)
      if (timeLeft <= 5 * 60 * 1000 && timeLeft > 4 * 60 * 1000) {
        toast.warning("Sua sessão expirará em 5 minutos. Salve seu trabalho.")
      }
    } catch (error) {
      console.error("Error checking session:", error)
      clearSession()
    }
  }, [applySessionState, clearSession, getCurrentUserId, refreshSession, resetSessionState, router])

  const extendSession = useCallback(() => {
    void refreshSession()
  }, [refreshSession])

  useEffect(() => {
    // Initial session check
    void checkSession()

    // Check session every minute
    const sessionInterval = setInterval(() => {
      void checkSession()
    }, 60 * 1000)

    // Track user activity for session extension
    let activityTimer: NodeJS.Timeout

    const resetActivityTimer = () => {
      clearTimeout(activityTimer)
      activityTimer = setTimeout(
        () => {
          // Extend session if user has been active
          if (isSessionValidRef.current) {
            void refreshSession()
          }
        },
        5 * 60 * 1000,
      ) // Extend after 5 minutes of activity
    }

    const handleActivity = () => {
      if (isSessionValidRef.current) {
        resetActivityTimer()
      }
    }

    // Listen for user activity
    const activityEvents = ["mousedown", "mousemove", "keypress", "scroll", "touchstart", "click"]
    activityEvents.forEach((event) => {
      document.addEventListener(event, handleActivity, { passive: true })
    })

    // Cleanup
    return () => {
      clearInterval(sessionInterval)
      clearTimeout(activityTimer)
      activityEvents.forEach((event) => {
        document.removeEventListener(event, handleActivity)
      })
    }
  }, [checkSession, refreshSession])

  useEffect(() => {
    if (!sessionData) return

    const timer = setInterval(() => {
      const expiryTime = new Date(sessionData.expiresAt).getTime()
      const currentTime = Date.now()
      const timeLeft = Math.max(0, Math.floor((expiryTime - currentTime) / 1000))

      setTimeUntilExpiry(timeLeft)

      if (timeLeft === 0) {
        if (USE_API) {
          void refreshSession()
          return
        }

        clearSession()
        toast.error("Sessão expirada. Faça login novamente.")
        router.push("/auth")
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [sessionData, clearSession, refreshSession, router])

  return {
    isSessionValid,
    sessionData,
    refreshSession,
    clearSession,
    extendSession,
    timeUntilExpiry,
  }
}
