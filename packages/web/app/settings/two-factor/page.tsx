"use client"

import { TwoFactorSettings } from "@/components/auth/two-factor-settings"
import { ProtectedRoute } from "@/components/auth/protected-route"

/**
 * Two-Factor Authentication settings page
 */
export default function TwoFactorPage() {
  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Autenticação em Dois Fatores</h1>
          <p className="text-muted-foreground mt-2">
            Proteja sua conta com autenticação de dois fatores.
          </p>
        </div>

        <TwoFactorSettings />
      </div>
    </ProtectedRoute>
  )
}
