"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, AlertCircle } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "sonner"

const ERROR_MESSAGES: Record<string, string> = {
  TOKEN_MISSING: "Link inválido. Solicite um novo email de verificação.",
  TOKEN_INVALID: "Link expirado ou já usado. Solicite um novo email de verificação.",
  USER_NOT_FOUND: "Usuário não encontrado. Cadastre-se novamente.",
}

export default function VerifyCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { hydrateFromSession } = useAuth()
  const [state, setState] = useState<"loading" | "success" | "error">("loading")
  const [errorMessage, setErrorMessage] = useState<string>("Não foi possível verificar seu email.")

  useEffect(() => {
    const status = searchParams.get("status")
    const code = searchParams.get("code")

    if (status === "error") {
      const message = (code && ERROR_MESSAGES[code]) || "Não foi possível verificar seu email."
      setErrorMessage(message)
      setState("error")
      return
    }

    if (status !== "success") {
      setState("error")
      return
    }

    void (async () => {
      try {
        await hydrateFromSession()
        toast.success("Email confirmado com sucesso!")
        setState("success")
        setTimeout(() => router.replace("/dashboard"), 1200)
      } catch {
        setErrorMessage("Email confirmado, mas não conseguimos carregar seu usuário. Faça login novamente.")
        setState("error")
      }
    })()
  }, [hydrateFromSession, router, searchParams])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center bg-primary/10">
            {state === "error" ? (
              <AlertCircle className="w-8 h-8 text-destructive" />
            ) : (
              <CheckCircle className={`w-8 h-8 ${state === "success" ? "text-green-600" : "text-primary animate-pulse"}`} />
            )}
          </div>
          <CardTitle className="text-2xl">
            {state === "loading" && "Confirmando seu email..."}
            {state === "success" && "Email confirmado!"}
            {state === "error" && "Falha na confirmação"}
          </CardTitle>
          <CardDescription>
            {state === "loading" && "Aguarde só um instante."}
            {state === "success" && "Redirecionando para o seu painel..."}
            {state === "error" && errorMessage}
          </CardDescription>
        </CardHeader>
        {state === "error" && (
          <CardContent className="flex flex-col gap-2">
            <Button onClick={() => router.replace("/auth/verify-pending")}>Reenviar email</Button>
            <Button variant="ghost" onClick={() => router.replace("/auth")}>Voltar ao login</Button>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
