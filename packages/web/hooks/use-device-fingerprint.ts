"use client"

import { useCallback, useMemo } from "react"

export interface DeviceFingerprint {
  userAgent: string
  screenResolution: string
  timezone: string
  language: string
  fingerprint: string // Hash das características
}

/**
 * Generate a device fingerprint for session tracking
 * Used to detect unusual login locations/devices
 */
export function useDeviceFingerprint() {
  const fingerprint = useMemo((): DeviceFingerprint | null => {
    if (typeof window === "undefined") return null

    const navigator_ = window.navigator
    const screen_ = window.screen

    const userAgent = navigator_.userAgent
    const screenResolution = `${screen_.width}x${screen_.height}`
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    const language = navigator_.language

    // Create simple hash of fingerprint components
    const fingerprintString = `${userAgent}|${screenResolution}|${timezone}|${language}`
    const fingerprintHash = simpleHash(fingerprintString).substring(0, 16).toUpperCase()

    return {
      userAgent,
      screenResolution,
      timezone,
      language,
      fingerprint: fingerprintHash,
    }
  }, [])

  const sendFingerprint = useCallback(async (endpoint: string) => {
    if (!fingerprint) return null

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceFingerprint: fingerprint.fingerprint }),
      })

      return response.ok
    } catch (error) {
      console.error("[DeviceFingerprint] Send failed:", error)
      return false
    }
  }, [fingerprint])

  return {
    fingerprint,
    sendFingerprint,
  }
}

/**
 * Simple hash function for fingerprint (not cryptographic)
 */
function simpleHash(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16)
}
