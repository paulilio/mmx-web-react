"use client"

import { useEffect, useState } from "react"
import { use2FA } from "@/hooks/use-2fa"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle, Copy, Loader2, QrCode } from "lucide-react"
import { toast } from "sonner"

interface TwoFactorSetupProps {
  onSuccess?: () => void
  onCancel?: () => void
}

/**
 * Component to set up 2FA
 * Shows QR code for authenticator app and requires verification with 6-digit code
 */
export function TwoFactorSetup({ onSuccess, onCancel }: TwoFactorSetupProps) {
  const { setupData, isLoading, error, fetchSetupData, enableTwoFactor, clearError } = use2FA()
  const [verificationCode, setVerificationCode] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [backupCodes, setBackupCodes] = useState<string[]>([])

  useEffect(() => {
    fetchSetupData()
  }, [fetchSetupData])

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!verificationCode.trim() || verificationCode.length !== 6) {
      toast.error("Código deve ter 6 dígitos")
      return
    }

    if (!setupData) {
      toast.error("Dados de setup não carregados")
      return
    }

    setIsVerifying(true)

    try {
      const success = await enableTwoFactor(setupData.secret, verificationCode)

      if (success) {
        toast.success("2FA habilitado com sucesso!")
        onSuccess?.()
      } else {
        toast.error(error || "Erro ao habilitar 2FA")
      }
    } finally {
      setIsVerifying(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Copiado!")
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!setupData) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Erro</AlertTitle>
        <AlertDescription>{error || "Falha ao carregar dados de setup"}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Step 1: QR Code */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Passo 1: Escanear QR Code
          </CardTitle>
          <CardDescription>
            Use um app de autenticação como Google Authenticator, Authy ou Microsoft Authenticator
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {setupData.qrCode && (
            <div className="flex justify-center">
              <img
                src={setupData.qrCode}
                alt="QR Code para 2FA"
                className="h-64 w-64 border rounded-lg p-2 bg-white"
              />
            </div>
          )}

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Não consegue escanear?</AlertTitle>
            <AlertDescription className="space-y-2">
              <p>Insira esta chave manualmente no seu app de autenticação:</p>
              <div className="flex items-center gap-2 mt-2">
                <code className="flex-1 bg-muted p-2 rounded text-sm break-all font-mono">
                  {setupData.secret}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(setupData.secret)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Step 2: Verification */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Passo 2: Verificar Código
          </CardTitle>
          <CardDescription>Digite o código de 6 dígitos do seu app de autenticação</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="verification-code">Código de Autenticação</Label>
              <Input
                id="verification-code"
                type="text"
                inputMode="numeric"
                placeholder="000000"
                maxLength={6}
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
                disabled={isVerifying}
                className="text-center text-2xl tracking-widest"
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={isVerifying || verificationCode.length !== 6}
                className="flex-1"
              >
                {isVerifying ? (
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
        </CardContent>
      </Card>

      {/* Security Note */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Importante</AlertTitle>
        <AlertDescription>
          Guarde os códigos de backup em um local seguro. Você precisará deles se perder acesso ao seu
          app de autenticação.
        </AlertDescription>
      </Alert>
    </div>
  )
}
