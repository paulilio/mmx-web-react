"use client"

import type React from "react"
import { useRouter } from "next/navigation"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Building2,
  Shield,
  TrendingUp,
  PieChart,
  AlertCircle,
  Zap,
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { validateRegistrationForm, validateEmail, validatePassword } from "@/lib/shared/auth-validations"
import { hashMockPassword } from "@/lib/shared/mock-auth-password"
import { toast } from "sonner"

type LocalAuthUser = {
  id: string
  email: string
  firstName: string
  lastName: string
  phone: string
  cpfCnpj: string
  password: string
  isEmailConfirmed: boolean
  defaultOrganizationId: string
  organizations: Array<{
    id: string
    name: string
    role: string
    permissions: string[]
    joinedAt: string
  }>
  planType: "free" | "pro" | "enterprise"
  preferences: {
    theme: string
    language: string
    notifications: {
      email: boolean
      push: boolean
      sms: boolean
    }
    layout: {
      sidebarCollapsed: boolean
      compactMode: boolean
    }
  }
  status: "active" | "inactive"
  createdAt: string
  updatedAt: string
  failedAttempts: number
  lockedUntil: string | null
}

export default function AuthPage() {
  const isDevMode = process.env.NODE_ENV !== "production"
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const { login, register } = useAuth()
  const router = useRouter()

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  })

  const [registerForm, setRegisterForm] = useState({
    firstName: "",
    email: "",
    password: "",
  })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setValidationErrors([])

    try {
      // Basic validation
      const emailValidation = validateEmail(loginForm.email)
      const passwordValidation = validatePassword(loginForm.password)

      const errors: string[] = []
      if (!emailValidation.isValid) errors.push(...emailValidation.errors)
      if (!passwordValidation.isValid) errors.push(...passwordValidation.errors)

      if (errors.length > 0) {
        setValidationErrors(errors)
        return
      }

      await login(loginForm.email, loginForm.password)
      toast.success("Login realizado com sucesso!")
    } catch (error) {
      toast.error((error as Error).message || "Erro no login. Verifique suas credenciais.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDirectLogin = async () => {
    if (!isDevMode) {
      toast.error("Login direto indisponivel neste ambiente")
      return
    }

    setIsLoading(true)
    try {
      const testEmail = "paulilio.ferreira@gmail.com"
      const testPassword = "123456"
      const testPasswordHash = await hashMockPassword(testPassword)

      // Check if localStorage is available
      const isLocalStorageAvailable = (() => {
        try {
          const testKey = "__localStorage_test__"
          localStorage.setItem(testKey, "test")
          localStorage.removeItem(testKey)
          return true
        } catch {
          return false
        }
      })()

      if (!isLocalStorageAvailable) {
        toast.error("Login direto não disponível neste navegador. Tente desabilitar o modo privado.")
        return
      }

      // Get existing users
      let users: LocalAuthUser[] = []
      try {
        const usersData = localStorage.getItem("users")
        users = usersData ? (JSON.parse(usersData) as LocalAuthUser[]) : []
      } catch {
        users = []
      }

      // Check if test user exists
      let testUser = users.find((u) => u.email === testEmail)

      if (!testUser) {
        const userId = "user_" + Math.random().toString(36).substring(2)
        const organizationId = "org_" + Math.random().toString(36).substring(2)

        // Create complete mock user object with all required fields
        testUser = {
          id: userId,
          email: testEmail,
          firstName: "Paulilio",
          lastName: "Ferreira",
          phone: "(11) 99999-9999",
          cpfCnpj: "123.456.789-00",
          password: testPasswordHash,
          isEmailConfirmed: true, // confirmed=true as required
          defaultOrganizationId: organizationId,
          organizations: [
            {
              id: organizationId,
              name: "Paulilio Ferreira",
              role: "owner",
              permissions: ["*"],
              joinedAt: new Date().toISOString(),
            },
          ],
          planType: "free", // planType=free as required
          preferences: {
            theme: "system",
            language: "pt-BR",
            notifications: {
              email: true,
              push: true,
              sms: false,
            },
            layout: {
              sidebarCollapsed: false,
              compactMode: false,
            },
          },
          status: "active",
          createdAt: new Date().toISOString(), // createdAt as required
          updatedAt: new Date().toISOString(), // updatedAt as required
          failedAttempts: 0,
          lockedUntil: null,
        }

        users.push(testUser)
      } else {
        // Ensure password is correct and reset any failed attempts
        testUser.password = testPasswordHash
        testUser.failedAttempts = 0
        testUser.lockedUntil = null
        testUser.updatedAt = new Date().toISOString()

        const userIndex = users.findIndex((u) => u.email === testEmail)
        if (userIndex !== -1) {
          users[userIndex] = testUser
        }
      }

      // Save to localStorage with error handling
      try {
        localStorage.setItem("users", JSON.stringify(users))

        // Verify the save was successful
        const verifyData = localStorage.getItem("users")
        if (!verifyData) {
          throw new Error("localStorage write failed - data not persisted")
        }

        const verifyUsers = JSON.parse(verifyData) as LocalAuthUser[]
        const verifyUser = verifyUsers.find((u) => u.email === testEmail)
        if (!verifyUser) {
          throw new Error("Test user not found after localStorage write")
        }
      } catch {
        toast.error("Erro ao salvar dados do usuário. Tente recarregar a página.")
        return
      }

      // Proceed with login
      await login(testEmail, testPassword)
      toast.success("Login direto realizado com sucesso!")
    } catch (error) {
      toast.error("Erro no login direto: " + (error as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setValidationErrors([])

    try {
      const validation = validateRegistrationForm(registerForm)

      if (!validation.isValid) {
        setValidationErrors(validation.errors)
        return
      }

      await register(registerForm)
      toast.success("Conta criada com sucesso! Verifique seu email para confirmar.")
    } catch (error) {
      toast.error((error as Error).message || "Erro ao criar conta. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuthLogin = (provider: "google" | "microsoft") => {
    window.location.href = `/api/auth/oauth/${provider}`
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
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-auth-nav-muted hover:text-auth-nav-foreground transition-colors">
                Recursos
              </a>
              <a href="#security" className="text-auth-nav-muted hover:text-auth-nav-foreground transition-colors">
                Segurança
              </a>
              <a href="#contact" className="text-auth-nav-muted hover:text-auth-nav-foreground transition-colors">
                Contato
              </a>
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[calc(100vh-200px)]">
          <div className="space-y-8">
            <div className="space-y-6">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-auth-accent text-auth-accent-foreground text-sm font-medium">
                <Shield className="w-4 h-4 mr-2" />
                Sistema Seguro e Confiável
              </div>

              <h1 className="text-4xl lg:text-5xl font-bold text-auth-foreground leading-tight text-balance">
                Gestão Financeira
                <span className="text-primary block">Inteligente e Simples</span>
              </h1>

              <p className="text-lg text-auth-muted leading-relaxed text-pretty">
                Controle completo das suas finanças com o MoedaMix. Gerencie contas a pagar e receber, acompanhe fluxo
                de caixa e tome decisões financeiras mais inteligentes com nossa plataforma profissional.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-auth-feature rounded-lg flex items-center justify-center flex-shrink-0">
                  <PieChart className="w-6 h-6 text-auth-feature-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-auth-foreground mb-2">Dashboard Intuitivo</h3>
                  <p className="text-auth-muted text-sm leading-relaxed">
                    Visualize suas finanças com gráficos e relatórios em tempo real
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-auth-feature rounded-lg flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-6 h-6 text-auth-feature-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-auth-foreground mb-2">Multi-empresa</h3>
                  <p className="text-auth-muted text-sm leading-relaxed">
                    Gerencie múltiplas empresas e contas em uma única plataforma
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-auth-feature rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-auth-feature-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-auth-foreground mb-2">Segurança Total</h3>
                  <p className="text-auth-muted text-sm leading-relaxed">
                    Seus dados protegidos com criptografia de ponta a ponta
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-auth-feature rounded-lg flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-6 h-6 text-auth-feature-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-auth-foreground mb-2">Relatórios Avançados</h3>
                  <p className="text-auth-muted text-sm leading-relaxed">
                    Análises detalhadas para decisões financeiras estratégicas
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center lg:justify-end">
            <Card className="w-full max-w-md bg-card border-auth-border shadow-lg">
              <CardHeader className="space-y-1 text-center">
                <CardTitle className="text-2xl font-bold text-card-foreground">Acesse sua conta</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Entre com suas credenciais ou crie uma nova conta
                </CardDescription>
              </CardHeader>
              <CardContent>
                {validationErrors.length > 0 && (
                  <Alert variant="destructive" className="mb-4">
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

                <Tabs defaultValue="login" className="space-y-4">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="login">Entrar</TabsTrigger>
                    <TabsTrigger value="register">Criar Conta</TabsTrigger>
                  </TabsList>

                  <TabsContent value="login" className="space-y-4">
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="login-email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="login-email"
                            type="email"
                            placeholder="seu@email.com"
                            className="pl-10"
                            value={loginForm.email}
                            onChange={(e) => setLoginForm((prev) => ({ ...prev, email: e.target.value }))}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="login-password">Senha</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="login-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Sua senha"
                            className="pl-10 pr-10"
                            value={loginForm.password}
                            onChange={(e) => setLoginForm((prev) => ({ ...prev, password: e.target.value }))}
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

                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? "Entrando..." : "Entrar"}
                      </Button>

                      {isDevMode && (
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full bg-transparent"
                          onClick={handleDirectLogin}
                          disabled={isLoading}
                        >
                          <Zap className="mr-2 h-4 w-4" />
                          Login Direto (Teste)
                        </Button>
                      )}

                      <div className="text-center">
                        <button
                          type="button"
                          className="text-sm text-primary hover:underline"
                          onClick={() => router.push("/auth/forgot-password")}
                        >
                          Esqueceu sua senha?
                        </button>
                      </div>
                    </form>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <Separator className="w-full" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">Ou continue com</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Button variant="outline" onClick={() => handleOAuthLogin("google")} disabled={isLoading}>
                        <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                          <path
                            fill="currentColor"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="currentColor"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="currentColor"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          />
                          <path
                            fill="currentColor"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          />
                        </svg>
                        Google
                      </Button>
                      <Button variant="outline" onClick={() => handleOAuthLogin("microsoft")} disabled={isLoading}>
                        <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                          <path
                            fill="currentColor"
                            d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zM24 11.4H12.6V0H24v11.4z"
                          />
                        </svg>
                        Microsoft
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="register" className="space-y-4">
                    <form onSubmit={handleRegister} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">Nome</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="firstName"
                            placeholder="Como devemos te chamar?"
                            className="pl-10"
                            value={registerForm.firstName}
                            onChange={(e) => setRegisterForm((prev) => ({ ...prev, firstName: e.target.value }))}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="email"
                            type="email"
                            placeholder="seu@email.com"
                            className="pl-10"
                            value={registerForm.email}
                            onChange={(e) => setRegisterForm((prev) => ({ ...prev, email: e.target.value }))}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="password">Senha</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Mínimo 8 caracteres"
                            className="pl-10 pr-10"
                            value={registerForm.password}
                            onChange={(e) => setRegisterForm((prev) => ({ ...prev, password: e.target.value }))}
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

                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? "Criando conta..." : "Criar Conta"}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
