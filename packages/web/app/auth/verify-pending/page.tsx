"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mail } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "sonner"

export default function VerifyPendingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, resendConfirmation, logout } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const email = user?.email || searchParams.get("email") || ""

  const handleResend = async () => {
    setIsLoading(true)
    try {
      await resendConfirmation(email || undefined)
      toast.success("Se o email estiver cadastrado e pendente, o link foi reenviado.")
    } catch (error) {
      toast.error((error as Error).message || "Não foi possível reenviar agora. Tente novamente em instantes.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = async () => {
    await logout()
    router.replace("/auth")
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Verifique seu email</CardTitle>
          <CardDescription>
            {email
              ? <>Enviamos um link de confirmação para <strong>{email}</strong>. Abra o email e clique no botão para ativar sua conta.</>
              : "Enviamos um link de confirmação para seu email. Abra o email e clique no botão para ativar sua conta."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Não chegou? Verifique sua caixa de spam ou solicite um novo email abaixo.
          </p>
          <Button className="w-full" onClick={handleResend} disabled={isLoading}>
            {isLoading ? "Enviando..." : "Reenviar email de confirmação"}
          </Button>
          <Button variant="ghost" className="w-full" onClick={handleSignOut}>
            Sair
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
