"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Lock, CheckCircle, AlertCircle, TrendingUp, Key } from "lucide-react"
import { validatePassword } from "@/lib/shared/auth-validations"
import { hashMockPassword } from "@/lib/shared/mock-auth-password"
import { consumeTimedValue, findLatestActiveValue, type TimedTokenRecord } from "@/lib/shared/mock-auth-flow"
import { toast } from "sonner"

type LocalResetUser = {
  email: string
  id: string
  password: string
  failedAttempts?: number
  lockedUntil?: string | null
}

const CANONICAL_AUDIT_KEY = "mmx_audit_log"

export default function ResetPasswordPage() {
  const isDevMode = process.env.NODE_ENV !== "production"
  const [resetToken, setResetToken] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [isSuccess, setIsSuccess] = useState(false)
  const [devToken, setDevToken] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get("email")

  useEffect(() => {
    if (!isDevMode || !email) {
      setDevToken(null)
      return
    }

    try {
      const stored = localStorage.getItem("reset_tokens")
      const records = stored ? (JSON.parse(stored) as TimedTokenRecord[]) : []
      setDevToken(findLatestActiveValue(records, email, "token"))
    } catch {
      setDevToken(null)
    }
  }, [email, isDevMode])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setValidationErrors([])

    try {
      if (!isDevMode) {
        setError("Recuperacao de senha indisponivel neste ambiente")
        return
      }

      if (!email) {
        setError("Email de recuperacao nao informado")
        return
      }

      const rawResetTokens = localStorage.getItem("reset_tokens")
      const resetTokens = rawResetTokens ? (JSON.parse(rawResetTokens) as TimedTokenRecord[]) : []
      const consumedToken = consumeTimedValue(resetTokens, email, resetToken.trim().toUpperCase(), "token")

      if (!consumedToken.valid) {
        setError("Token de recuperação inválido ou expirado")
        return
      }

      localStorage.setItem("reset_tokens", JSON.stringify(consumedToken.updatedRecords))

      // Validate password
      const passwordValidation = validatePassword(newPassword)
      if (!passwordValidation.isValid) {
        setValidationErrors(passwordValidation.errors)
        return
      }

      // Check password confirmation
      if (newPassword !== confirmPassword) {
        setError("Senhas não coincidem")
        return
      }

      const users = JSON.parse(localStorage.getItem("users") || "[]") as LocalResetUser[]
      const userIndex = users.findIndex((u) => u.email === email)

      if (userIndex !== -1) {
        const userToUpdate = users[userIndex]
        if (!userToUpdate) {
          setError("Usuário não encontrado para atualização de senha")
          return
        }

        userToUpdate.password = await hashMockPassword(newPassword)
        userToUpdate.failedAttempts = 0
        userToUpdate.lockedUntil = null
        localStorage.setItem("users", JSON.stringify(users))

        // Log audit event
        const auditLogs = JSON.parse(localStorage.getItem(CANONICAL_AUDIT_KEY) || "[]")
        auditLogs.push({
          id: "log_" + Math.random().toString(36).substring(2),
          action: "password_reset_completed",
          userId: userToUpdate.id,
          metadata: { email },
          timestamp: new Date().toISOString(),
          ip: "mock_ip",
          userAgent: navigator.userAgent,
        })
        localStorage.setItem(CANONICAL_AUDIT_KEY, JSON.stringify(auditLogs))
      }

      setIsSuccess(true)
      toast.success("Senha alterada com sucesso!")

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push("/auth")
      }, 3000)
    } catch {
      setError("Erro ao alterar senha. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-auth-background flex items-center justify-center p-6">
        <Card className="w-full max-w-md bg-card border-auth-border shadow-lg">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-card-foreground">Senha Alterada!</CardTitle>
            <CardDescription className="text-muted-foreground">
              Sua senha foi alterada com sucesso. Redirecionando para o login...
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
              <Key className="w-8 h-8 text-auth-feature-foreground" />
            </div>
            <CardTitle className="text-2xl font-bold text-card-foreground">Nova Senha</CardTitle>
            <CardDescription className="text-muted-foreground">
              {email ? (
                <>
                  Digite o token de recuperação e sua nova senha para <strong>{email}</strong>
                </>
              ) : (
                "Digite o token de recuperação e sua nova senha"
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

            {validationErrors.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <ul className="list-disc list-inside space-y-1">
                    {validationErrors.map((error, index) => (
                      <li key={index} className="text-sm">
                        {error}
                      </li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {isDevMode && devToken && (
              <Alert className="border-blue-200 bg-blue-50">
                <Key className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  <strong>Token de teste:</strong> {devToken}
                  <br />
                  <span className="text-sm text-blue-600">Use este token para testar a recuperação de senha</span>
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="resetToken" className="text-sm font-medium">
                  Token de Recuperação
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="resetToken"
                    type="text"
                    placeholder={isDevMode ? "Digite o token (ex: RESET-123)" : "Digite o token recebido"}
                    className="pl-10 text-center font-mono tracking-wider"
                    value={resetToken}
                    onChange={(e) => setResetToken(e.target.value.toUpperCase())}
                    maxLength={10}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="newPassword" className="text-sm font-medium">
                  Nova Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Mínimo 8 caracteres"
                    className="pl-10 pr-10"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium">
                  Confirmar Nova Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirme sua nova senha"
                    className="pl-10 pr-10"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Alterando..." : "Alterar Senha"}
              </Button>
            </form>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Não recebeu o token?{" "}
                <button
                  type="button"
                  onClick={() => router.push("/auth/forgot-password")}
                  className="text-primary hover:underline font-medium"
                >
                  Solicitar Novamente
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
