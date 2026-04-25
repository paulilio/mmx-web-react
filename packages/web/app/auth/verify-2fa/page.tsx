"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { TwoFactorLogin } from "@/components/auth/two-factor-login"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { toast } from "sonner"

/**
 * 2FA verification page during login flow
 * User must verify TOTP or backup code to complete login
 */
export default function Verify2FAPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const userId = searchParams.get("userId")
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    if (!userId) {
      // No userId means user shouldn't be here
      router.replace("/auth")
      return
    }
    setIsReady(true)
  }, [userId, router])

  const handleSuccess = () => {
    // Retrieve stored user data from sessionStorage
    const userData = sessionStorage.getItem("2fa_pending_user")
    const tokensData = sessionStorage.getItem("2fa_pending_tokens")

    if (userData && tokensData) {
      const user = JSON.parse(userData)
      const tokens = JSON.parse(tokensData)

      // Store in localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("auth_user", JSON.stringify(user))
        localStorage.setItem("auth_token", tokens.accessToken)
        localStorage.setItem("auth_refresh_token", tokens.refreshToken)

        // Clear session storage
        sessionStorage.removeItem("2fa_pending_user")
        sessionStorage.removeItem("2fa_pending_tokens")
      }
    }

    toast.success("Login bem-sucedido!")
    router.replace("/dashboard")
  }

  const handleCancel = () => {
    // Clear session storage
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("2fa_pending_user")
      sessionStorage.removeItem("2fa_pending_tokens")
    }

    router.replace("/auth")
  }

  if (!isReady || !userId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Sessão inválida. Faça login novamente.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold">Autenticação em Dois Fatores</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Insira o código do seu app de autenticação para completar o login
          </p>
        </div>

        <TwoFactorLogin
          userId={userId}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />

        <div className="mt-6 text-center">
          <Button variant="ghost" size="sm" onClick={handleCancel}>
            Voltar para login
          </Button>
        </div>
      </div>
    </div>
  )
}
