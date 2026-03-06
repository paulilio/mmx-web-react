"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { logAuditEvent } from "@/lib/utils"

interface SessionData {
  token: string
  userId: string
  expiresAt: string
}

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

  // Update refs when state changes
  useEffect(() => {
    sessionDataRef.current = sessionData
  }, [sessionData])

  useEffect(() => {
    isSessionValidRef.current = isSessionValid
  }, [isSessionValid])

  const clearSession = useCallback(() => {
    const currentSession = sessionDataRef.current
    localStorage.removeItem("auth_session")
    localStorage.removeItem("auth_user")
    setSessionData(null)
    setIsSessionValid(false)
    setTimeUntilExpiry(null)

    if (currentSession) {
      logAuditEvent("session_cleared", currentSession.userId, {
        sessionToken: currentSession.token.substring(0, 8) + "...", // Only log partial token for security
        clearedAt: new Date().toISOString(),
      })
    }
  }, [])

  const checkSession = useCallback(() => {
    try {
      const sessionString = localStorage.getItem("auth_session")
      if (!sessionString) {
        setIsSessionValid(false)
        setSessionData(null)
        setTimeUntilExpiry(null)
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
        clearSession()
        toast.error("Sessão expirada. Faça login novamente.")
        router.push("/auth")
        return
      }

      setSessionData(session)
      setIsSessionValid(true)
      setTimeUntilExpiry(Math.floor(timeLeft / 1000)) // Convert to seconds

      // Warn user when session is about to expire (5 minutes before)
      if (timeLeft <= 5 * 60 * 1000 && timeLeft > 4 * 60 * 1000) {
        toast.warning("Sua sessão expirará em 5 minutos. Salve seu trabalho.")
      }
    } catch (error) {
      console.error("Error checking session:", error)
      clearSession()
    }
  }, [clearSession, router])

  const extendSession = useCallback(() => {
    const currentSessionData = sessionDataRef.current
    if (!currentSessionData) return

    try {
      const newExpiryTime = new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutes
      const updatedSession: SessionData = {
        ...currentSessionData,
        expiresAt: newExpiryTime,
      }

      localStorage.setItem("auth_session", JSON.stringify(updatedSession))
      setSessionData(updatedSession)

      logAuditEvent("session_extended", currentSessionData.userId, {
        previousExpiry: currentSessionData.expiresAt,
        newExpiry: newExpiryTime,
        extensionDuration: "30 minutes",
      })
    } catch (error) {
      console.error("Error extending session:", error)
    }
  }, [])

  const refreshSession = useCallback(async () => {
    // In a real app, this would make an API call to refresh the token
    extendSession()
  }, [extendSession])

  useEffect(() => {
    // Initial session check
    checkSession()

    // Check session every minute
    const sessionInterval = setInterval(checkSession, 60 * 1000)

    // Track user activity for session extension
    let activityTimer: NodeJS.Timeout

    const resetActivityTimer = () => {
      clearTimeout(activityTimer)
      activityTimer = setTimeout(
        () => {
          // Extend session if user has been active
          if (isSessionValidRef.current) {
            extendSession()
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
  }, [checkSession, extendSession])

  useEffect(() => {
    if (!sessionData) return

    const timer = setInterval(() => {
      const expiryTime = new Date(sessionData.expiresAt).getTime()
      const currentTime = Date.now()
      const timeLeft = Math.max(0, Math.floor((expiryTime - currentTime) / 1000))

      setTimeUntilExpiry(timeLeft)

      if (timeLeft === 0) {
        clearSession()
        toast.error("Sessão expirada. Faça login novamente.")
        router.push("/auth")
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [sessionData, clearSession, router])

  return {
    isSessionValid,
    sessionData,
    refreshSession,
    clearSession,
    extendSession,
    timeUntilExpiry,
  }
}
