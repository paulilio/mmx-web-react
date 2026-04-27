"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import type { User } from "@/types/auth"
import { buildDefaultSeed } from "./seed"

const USER_ID = "dev-user-local"

const FAKE_USER: User = {
  id: USER_ID,
  email: "dev@mmx.local",
  firstName: "Dev",
  lastName: "User",
  isEmailConfirmed: true,
  createdAt: new Date().toISOString(),
  planType: "premium",
  preferences: {
    theme: "system",
    language: "pt-BR",
    notifications: { email: false, push: false, sms: false },
    layout: { sidebarCollapsed: false, compactMode: false },
    hasSeenWelcome: true,
  } as User["preferences"],
}

function seedLocalStorage() {
  const seed = buildDefaultSeed(USER_ID) as Record<string, unknown[]>
  for (const [storageKey, records] of Object.entries(seed)) {
    localStorage.setItem(storageKey, JSON.stringify(records))
  }
}

export default function DevLoginPage() {
  const router = useRouter()
  const [status, setStatus] = useState("Preparando sessão dev…")

  useEffect(() => {
    if (process.env.NODE_ENV === "production") {
      router.replace("/auth")
      return
    }
    if (typeof window === "undefined") return

    try {
      localStorage.setItem("auth_user", JSON.stringify(FAKE_USER))
      localStorage.setItem(
        "auth_session",
        JSON.stringify({
          token: "dev-token",
          userId: FAKE_USER.id,
          expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
        }),
      )
      seedLocalStorage()
      setStatus("Pronto. Redirecionando…")
      window.location.href = "/dashboard"
    } catch (error) {
      console.error("[dev-login] failed", error)
      setStatus("Erro ao seed — confira o console")
    }
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center p-6 text-sm text-muted-foreground">
      {status}
    </div>
  )
}
