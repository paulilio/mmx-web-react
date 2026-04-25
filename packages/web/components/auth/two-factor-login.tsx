"use client"

import { useState } from "react"
import { use2FA } from "@/hooks/use-2fa"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, Lock, Loader2, Key } from "lucide-react"
import { toast } from "sonner"

interface TwoFactorLoginProps {
  userId: string
  onSuccess?: () => void
  onCancel?: () => void
}

/**
 * Component for verifying 2FA code during login
 * Supports both TOTP (6-digit code) and backup codes
 */
export function TwoFactorLogin({ userId, onSuccess, onCancel }: TwoFactorLoginProps) {
  const { verifyLoginCode, isLoading, error, clearError } = use2FA()
  const [totpCode, setTotpCode] = useState("")
  const [backupCode, setBackupCode] = useState("")
  const [useBackup, setUseBackup] = useState(false)

  const handleVerifyTotp = async (e: React.FormEvent) => {
    e.preventDefault()

    if (totpCode.length !== 6) {
      toast.error("Código deve ter 6 dígitos")
      return
    }

    clearError()
    const success = await verifyLoginCode(userId, totpCode)

    if (success) {
      toast.success("2FA verificado com sucesso!")
      onSuccess?.()
    }
  }

  const handleVerifyBackup = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!backupCode.trim()) {
      toast.error("Código de backup vazio")
      return
    }

    clearError()
    const success = await verifyLoginCode(userId, undefined, backupCode)

    if (success) {
      toast.success("Backup code verificado!")
      onSuccess?.()
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5" />
          Autenticação em Dois Fatores
        </CardTitle>
        <CardDescription>Insira seu código de autenticação para continuar</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={useBackup ? "backup" : "totp"} onValueChange={(v) => setUseBackup(v === "backup")}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="totp">Código de App</TabsTrigger>
            <TabsTrigger value="backup">Código de Backup</TabsTrigger>
          </TabsList>

          {/* TOTP Tab */}
          <TabsContent value="totp">
            <form onSubmit={handleVerifyTotp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="totp-code">Código do Authenticator</Label>
                <Input
                  id="totp-code"
                  type="text"
                  inputMode="numeric"
                  placeholder="000000"
                  maxLength={6}
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ""))}
                  disabled={isLoading}
                  className="text-center text-2xl tracking-widest"
                  autoComplete="one-time-code"
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex gap-2">
                <Button type="submit" disabled={isLoading || totpCode.length !== 6} className="flex-1">
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Verificando...
                    </>
                  ) : (
                    "Verificar"
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancelar
                </Button>
              </div>
            </form>
          </TabsContent>

          {/* Backup Code Tab */}
          <TabsContent value="backup">
            <form onSubmit={handleVerifyBackup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="backup-code" className="flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  Código de Backup
                </Label>
                <Input
                  id="backup-code"
                  type="text"
                  placeholder="XXXX-XXXX-XXXX"
                  value={backupCode}
                  onChange={(e) => setBackupCode(e.target.value.toUpperCase())}
                  disabled={isLoading}
                />
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Código de Backup</AlertTitle>
                <AlertDescription>
                  Use um código de backup se não tiver acesso ao seu app de autenticação. Cada código só pode ser
                  usado uma vez.
                </AlertDescription>
              </Alert>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex gap-2">
                <Button type="submit" disabled={isLoading || !backupCode.trim()} className="flex-1">
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Verificando...
                    </>
                  ) : (
                    "Verificar"
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancelar
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
