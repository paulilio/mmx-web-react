"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Shield,
  TrendingUp,
  PieChart,
  Building2,
  AlertCircle,
} from "lucide-react"
import { toast } from "sonner"

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState<"google" | "microsoft" | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleOAuthLogin = (provider: "google" | "microsoft") => {
    const apiBase = process.env.NEXT_PUBLIC_API_BASE
    if (!apiBase) {
      setError("API não configurada para OAuth. Defina NEXT_PUBLIC_API_BASE.")
      toast.error("API não configurada")
      return
    }
    setIsLoading(provider)
    window.location.href = `${apiBase.replace(/\/$/, "")}/auth/oauth/${provider}`
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
                    Login via Google ou Microsoft — sem senha para gerenciar
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
              <CardHeader className="space-y-2 text-center">
                <CardTitle className="text-2xl font-bold text-card-foreground">Acesse sua conta</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Entre com Google ou Microsoft.
                  <br />
                  Sem senha, sem cadastro.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button
                  variant="outline"
                  className="w-full h-12 text-base"
                  onClick={() => handleOAuthLogin("google")}
                  disabled={isLoading !== null}
                >
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  {isLoading === "google" ? "Conectando ao Google..." : "Continuar com Google"}
                </Button>

                <Button
                  variant="outline"
                  className="w-full h-12 text-base"
                  onClick={() => handleOAuthLogin("microsoft")}
                  disabled={isLoading !== null}
                >
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path fill="#F25022" d="M11.4 11.4H0V0h11.4v11.4z" />
                    <path fill="#7FBA00" d="M24 11.4H12.6V0H24v11.4z" />
                    <path fill="#00A4EF" d="M11.4 24H0V12.6h11.4V24z" />
                    <path fill="#FFB900" d="M24 24H12.6V12.6H24V24z" />
                  </svg>
                  {isLoading === "microsoft" ? "Conectando ao Microsoft..." : "Continuar com Microsoft"}
                </Button>

                <div className="pt-2 text-center">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Suas credenciais ficam protegidas pelo seu provedor.
                    <br />
                    Não armazenamos senhas.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
