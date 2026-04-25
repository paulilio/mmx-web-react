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
import { useAuth } from "@/hooks/use-auth"
import { toast } from "sonner"

export default function ResetPasswordPage() {
  const [token, setToken] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [isSuccess, setIsSuccess] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { resetPasswordWithToken } = useAuth()

  useEffect(() => {
    const queryToken = searchParams.get("token")
    if (queryToken) setToken(queryToken)
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setValidationErrors([])

    try {
      if (!token.trim()) {
        setError("Token de recuperação ausente. Use o link enviado por email.")
        return
      }

      const passwordValidation = validatePassword(newPassword)
      if (!passwordValidation.isValid) {
        setValidationErrors(passwordValidation.errors)
        return
      }

      if (newPassword !== confirmPassword) {
        setError("Senhas não coincidem")
        return
      }

      await resetPasswordWithToken(token.trim(), newPassword)

      setIsSuccess(true)
      toast.success("Senha alterada com sucesso!")
      setTimeout(() => router.push("/auth"), 2500)
    } catch (err) {
      const status = (err as { status?: number }).status
      if (status === 400) setError("Token inválido ou expirado. Solicite um novo email de recuperação.")
      else if (status === 429) setError("Muitas tentativas. Aguarde alguns minutos.")
      else setError((err as Error).message || "Erro ao alterar senha. Tente novamente.")
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
            <CardTitle className="text-2xl font-bold text-card-foreground">Senha alterada</CardTitle>
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
              Voltar ao login
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
            <CardTitle className="text-2xl font-bold text-card-foreground">Nova senha</CardTitle>
            <CardDescription className="text-muted-foreground">
              Digite sua nova senha para concluir a recuperação.
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
                    {validationErrors.map((err, index) => (
                      <li key={index} className="text-sm">{err}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {!searchParams.get("token") && (
                <div className="space-y-2">
                  <label htmlFor="resetToken" className="text-sm font-medium">Token de recuperação</label>
                  <div className="relative">
                    <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="resetToken"
                      type="text"
                      placeholder="Cole aqui o token recebido"
                      className="pl-10 font-mono"
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      required
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="newPassword" className="text-sm font-medium">Nova senha</label>
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
                <label htmlFor="confirmPassword" className="text-sm font-medium">Confirmar nova senha</label>
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
                {isLoading ? "Alterando..." : "Alterar senha"}
              </Button>
            </form>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Não recebeu o email?{" "}
                <button
                  type="button"
                  onClick={() => router.push("/auth/forgot-password")}
                  className="text-primary hover:underline font-medium"
                >
                  Solicitar novamente
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
