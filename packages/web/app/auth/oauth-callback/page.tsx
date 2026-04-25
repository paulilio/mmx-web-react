"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, CheckCircle, AlertCircle } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "sonner"

const ERROR_MESSAGES: Record<string, string> = {
  OAUTH_STATE_INVALID: "Sessão OAuth expirada ou inválida. Tente novamente.",
  OAUTH_CODE_MISSING: "Código de autorização ausente. Tente novamente.",
  GOOGLE_EMAIL_NOT_VERIFIED: "Seu email Google não está verificado. Verifique no Google e tente novamente.",
  GOOGLE_OAUTH_NOT_CONFIGURED: "Login com Google está temporariamente indisponível.",
  MICROSOFT_OAUTH_NOT_CONFIGURED: "Login com Microsoft está temporariamente indisponível.",
  GOOGLE_OAUTH_CALLBACK_ERROR: "Não foi possível completar o login com Google.",
  MICROSOFT_OAUTH_CALLBACK_ERROR: "Não foi possível completar o login com Microsoft.",
}

export default function OAuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { hydrateFromSession } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [provider, setProvider] = useState<string>("provedor")

  useEffect(() => {
    const status = searchParams.get("status")
    const code = searchParams.get("code")
    const providerParam = searchParams.get("provider") ?? "provedor"
    setProvider(providerParam)

    if (status === "error") {
      const message = (code && ERROR_MESSAGES[code]) || "Não foi possível completar o login. Tente novamente."
      setError(message)
      return
    }

    if (status !== "success") {
      setError("Resposta inesperada do servidor.")
      return
    }

    void (async () => {
      try {
        await hydrateFromSession()
        toast.success(`Login com ${providerParam} realizado com sucesso!`)
        router.replace("/dashboard")
      } catch {
        setError("Não foi possível obter o seu usuário após o login. Tente novamente.")
      }
    })()
  }, [hydrateFromSession, router, searchParams])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            {error ? (
              <AlertCircle className="w-8 h-8 text-destructive" />
            ) : (
              <TrendingUp className="w-8 h-8 text-primary animate-pulse" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {error ? "Falha no login" : "Concluindo login..."}
          </CardTitle>
          <CardDescription>
            {error ? error : `Aguarde enquanto finalizamos o login com ${provider}.`}
          </CardDescription>
        </CardHeader>
        {error && (
          <CardContent className="flex flex-col gap-2">
            <Button onClick={() => router.replace("/auth")}>Voltar ao login</Button>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
