"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, ArrowLeft, CheckCircle, AlertCircle, TrendingUp } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { validateEmail } from "@/lib/auth-validations"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isEmailSent, setIsEmailSent] = useState(false)
  const [error, setError] = useState("")
  const { resetPassword } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // Validate email
      const emailValidation = validateEmail(email)
      if (!emailValidation.isValid) {
        setError(emailValidation.errors[0])
        return
      }

      await resetPassword(email)
      setIsEmailSent(true)
    } catch (error) {
      setError((error as Error).message || "Erro ao enviar email de recuperação")
    } finally {
      setIsLoading(false)
    }
  }

  if (isEmailSent) {
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
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-card-foreground">Email Enviado!</CardTitle>
              <CardDescription className="text-muted-foreground">
                Enviamos instruções de recuperação para <strong>{email}</strong>
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <Alert className="border-blue-200 bg-blue-50">
                <Mail className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  <strong>Para teste:</strong> Use o token "RESET-123" na próxima tela
                  <br />
                  <span className="text-sm text-blue-600">Em produção, este token seria enviado por email</span>
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <p className="text-sm text-muted-foreground text-center">
                  Verifique sua caixa de entrada e pasta de spam. O link expira em 1 hora.
                </p>

                <Button
                  onClick={() => router.push(`/auth/reset-password?email=${encodeURIComponent(email)}`)}
                  className="w-full"
                >
                  Continuar com Reset
                </Button>

                <Button variant="outline" onClick={() => router.push("/auth")} className="w-full">
                  Voltar ao Login
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
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
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
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
            <CardTitle className="text-2xl font-bold text-card-foreground">Recuperar Senha</CardTitle>
            <CardDescription className="text-muted-foreground">
              Digite seu email para receber instruções de recuperação
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground">Enviaremos um link de recuperação para este email</p>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Enviando..." : "Enviar Instruções"}
              </Button>
            </form>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Lembrou da senha?{" "}
                <button
                  type="button"
                  onClick={() => router.push("/auth")}
                  className="text-primary hover:underline font-medium"
                >
                  Fazer Login
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
