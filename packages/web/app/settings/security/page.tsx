"use client"

import { Metadata } from "next"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { SessionsList } from "@/components/auth/sessions-list"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

// Note: Metadata is not available in client components, this should be in a layout or server component
// For now, using "use client" with layout structure

/**
 * Security settings page
 * Allows users to manage sessions and security settings
 */
export default function SecurityPage() {
  return (
    <ProtectedRoute>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Segurança</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie suas sessões ativas e configurações de segurança da conta.
          </p>
        </div>

        {/* Sessions Section */}
        <Card>
          <CardHeader>
            <CardTitle>Sessões Ativas</CardTitle>
            <CardDescription>
              Todos os dispositivos onde você está conectado. Revogue acesso em qualquer momento.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SessionsList />
          </CardContent>
        </Card>

        {/* Security Tips */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Dicas de Segurança</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-medium flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Use senhas fortes e únicas</span>
              </h4>
              <p className="text-muted-foreground">
                Combine letras maiúsculas, minúsculas, números e símbolos. Mude sua senha regularmente.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Revise suas sessões regularmente</span>
              </h4>
              <p className="text-muted-foreground">
                Se você não reconhecer uma sessão, revogue-a imediatamente. Isso encerra acesso naquele dispositivo.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Logout em dispositivos públicos</span>
              </h4>
              <p className="text-muted-foreground">
                Sempre faça logout em computadores compartilhados. Use "Logout em todos os outros" antes de sair.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Ative autenticação de dois fatores (em breve)</span>
              </h4>
              <p className="text-muted-foreground">
                Adicione uma camada extra de segurança exigindo um código em cada login.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Data & Privacy */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Dados e Privacidade</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p className="text-muted-foreground">
              Seus dados são criptografados e nunca são compartilhados com terceiros. Você controla total acesso aos
              seus dados.
            </p>
            <div className="flex gap-3">
              <a href="#" className="text-primary hover:underline text-sm font-medium">
                Política de Privacidade
              </a>
              <span className="text-muted-foreground">•</span>
              <a href="#" className="text-primary hover:underline text-sm font-medium">
                Termos de Serviço
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  )
}
