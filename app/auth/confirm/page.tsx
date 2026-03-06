"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, CheckCircle, AlertCircle, TrendingUp, RefreshCw } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "sonner"

export default function ConfirmEmailPage() {
  const [confirmationCode, setConfirmationCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [error, setError] = useState("")
  const [isConfirmed, setIsConfirmed] = useState(false)
  const { confirmEmail, resendConfirmation, user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get("email")

  useEffect(() => {
    if (user?.isEmailConfirmed && !isConfirmed) {
      console.log("[v0] User email already confirmed, redirecting to dashboard")
      router.push("/dashboard")
    }
  }, [user?.isEmailConfirmed, router, isConfirmed])

  const handleConfirmEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      if (!confirmationCode.trim()) {
        setError("Código de confirmação é obrigatório")
        return
      }

      const success = await confirmEmail(confirmationCode.trim().toUpperCase())

      if (success) {
        setIsConfirmed(true)
        toast.success("Email confirmado com sucesso!")

        console.log("[v0] Email confirmed, redirecting to dashboard immediately")
        router.push("/dashboard")
      } else {
        setError("Código de confirmação inválido. Verifique e tente novamente.")
      }
    } catch (error) {
      setError("Erro ao confirmar email. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendCode = async () => {
    setIsResending(true)

    try {
      // Pass email parameter to resendConfirmation
      await resendConfirmation(email || undefined)
      toast.success("Código reenviado com sucesso!")
    } catch (error) {
      toast.error("Erro ao reenviar código. Tente novamente.")
    } finally {
      setIsResending(false)
    }
  }

  const handleContactSupport = () => {
    toast.info("Entre em contato conosco pelo email: suporte@moedamix.com")
  }

  if (isConfirmed) {
    return (
      <div className="min-h-screen bg-auth-background flex items-center justify-center p-6">
        <Card className="w-full max-w-md bg-card border-auth-border shadow-lg">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-card-foreground">Email Confirmado!</CardTitle>
            <CardDescription className="text-muted-foreground">
              Sua conta foi ativada com sucesso. Redirecionando para o dashboard...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-auth-background">
      {/* Header */}
      <header className="bg-auth-nav border-b border-auth-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-auth-nav-foreground">MoedaMix</span>
            </div>
            <Button
              variant="ghost"
              onClick={() => router.push("/auth")}
              className="text-auth-nav-muted hover:text-auth-nav-foreground"
            >
              Voltar ao Login
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12 flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Card className="w-full max-w-md bg-card border-auth-border shadow-lg">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-auth-feature rounded-full flex items-center justify-center">
              <Mail className="w-8 h-8 text-auth-feature-foreground" />
            </div>
            <CardTitle className="text-2xl font-bold text-card-foreground">Confirme seu Email</CardTitle>
            <CardDescription className="text-muted-foreground">
              {email ? (
                <>
                  Enviamos um código de confirmação para <strong>{email}</strong>
                </>
              ) : (
                "Enviamos um código de confirmação para seu email"
              )}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Alert className="border-blue-200 bg-blue-50">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>Código de teste:</strong> XPX-7F5G
                <br />
                <span className="text-sm text-blue-600">Use este código para testar a confirmação de email</span>
              </AlertDescription>
            </Alert>

            <form onSubmit={handleConfirmEmail} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="confirmationCode">Código de Confirmação</Label>
                <Input
                  id="confirmationCode"
                  type="text"
                  placeholder="Digite o código (ex: XPX-7F5G)"
                  value={confirmationCode}
                  onChange={(e) => setConfirmationCode(e.target.value.toUpperCase())}
                  className="text-center text-lg font-mono tracking-wider"
                  maxLength={8}
                  required
                />
                <p className="text-xs text-muted-foreground text-center">
                  O código tem 8 caracteres e não diferencia maiúsculas de minúsculas
                </p>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Confirmando..." : "Confirmar Email"}
              </Button>
            </form>

            <div className="space-y-3">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-auth-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Não recebeu o código?</span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <Button
                  variant="outline"
                  onClick={handleResendCode}
                  disabled={isResending}
                  className="w-full bg-transparent"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isResending ? "animate-spin" : ""}`} />
                  {isResending ? "Reenviando..." : "Reenviar Código"}
                </Button>

                <Button
                  variant="ghost"
                  onClick={handleContactSupport}
                  className="w-full text-muted-foreground hover:text-foreground"
                >
                  Entrar em Contato com Suporte
                </Button>
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">Verifique também sua pasta de spam ou lixo eletrônico</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
