"use client"

import { useState } from "react"
import { use2FA } from "@/hooks/use-2fa"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { TwoFactorSetup } from "@/components/auth/two-factor-setup"
import { Shield, Lock, AlertTriangle, CheckCircle } from "lucide-react"
import { toast } from "sonner"

/**
 * 2FA settings page component
 * Allows users to enable/disable two-factor authentication
 */
export function TwoFactorSettings() {
  // TODO: Get actual 2FA status from backend
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [showSetupDialog, setShowSetupDialog] = useState(false)
  const [showDisableDialog, setShowDisableDialog] = useState(false)
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [showBackupCodes, setShowBackupCodes] = useState(false)

  const { disableTwoFactor, isLoading } = use2FA()

  const handleEnableTwoFactor = () => {
    setShowSetupDialog(true)
  }

  const handleSetupSuccess = (codes: string[]) => {
    setBackupCodes(codes)
    setShowBackupCodes(true)
    setShowSetupDialog(false)
    setTwoFactorEnabled(true)
    toast.success("2FA habilitado com sucesso!")
  }

  const handleDisableTwoFactor = async () => {
    const success = await disableTwoFactor()

    if (success) {
      setTwoFactorEnabled(false)
      setShowDisableDialog(false)
      toast.success("2FA desabilitado")
    } else {
      toast.error("Erro ao desabilitar 2FA")
    }
  }

  return (
    <div className="space-y-6">
      {/* Current Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Autenticação em Dois Fatores (2FA)
          </CardTitle>
          <CardDescription>Adicione uma camada extra de segurança à sua conta</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div className="space-y-1">
              <p className="font-medium">Status do 2FA</p>
              <p className="text-sm text-muted-foreground">
                {twoFactorEnabled ? "Habilitado" : "Desabilitado"}
              </p>
            </div>
            <div className={`flex items-center gap-2 ${twoFactorEnabled ? "text-green-600" : "text-muted-foreground"}`}>
              {twoFactorEnabled ? (
                <>
                  <CheckCircle className="h-5 w-5" />
                  <span className="text-sm font-medium">Ativo</span>
                </>
              ) : (
                <>
                  <Lock className="h-5 w-5" />
                  <span className="text-sm font-medium">Inativo</span>
                </>
              )}
            </div>
          </div>

          {twoFactorEnabled ? (
            <Alert>
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle>Sua conta está protegida</AlertTitle>
              <AlertDescription>
                Você precisa inserir um código do seu app de autenticação para fazer login.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Segurança recomendada</AlertTitle>
              <AlertDescription>
                Habilitar 2FA adiciona proteção extra contra acesso não autorizado.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* How it Works */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Como funciona</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="space-y-2">
            <h4 className="font-medium flex items-start gap-2">
              <span className="text-primary font-bold">1</span>
              <span>Escanear com App de Autenticação</span>
            </h4>
            <p className="text-muted-foreground ml-6">
              Use Google Authenticator, Authy, Microsoft Authenticator ou outro app de autenticação para escanear o QR
              code.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium flex items-start gap-2">
              <span className="text-primary font-bold">2</span>
              <span>Código de 6 Dígitos</span>
            </h4>
            <p className="text-muted-foreground ml-6">
              Seu app gerará um novo código a cada 30 segundos. Use este código para fazer login.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium flex items-start gap-2">
              <span className="text-primary font-bold">3</span>
              <span>Códigos de Backup</span>
            </h4>
            <p className="text-muted-foreground ml-6">
              Se perder seu celular, você pode usar códigos de backup para fazer login. Guarde-os em segurança.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        {!twoFactorEnabled ? (
          <Button onClick={handleEnableTwoFactor} className="gap-2">
            <Lock className="h-4 w-4" />
            Habilitar 2FA
          </Button>
        ) : (
          <Button
            variant="destructive"
            onClick={() => setShowDisableDialog(true)}
            disabled={isLoading}
            className="gap-2"
          >
            <AlertTriangle className="h-4 w-4" />
            Desabilitar 2FA
          </Button>
        )}
      </div>

      {/* Setup Dialog */}
      <Dialog open={showSetupDialog} onOpenChange={setShowSetupDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Configurar Autenticação em Dois Fatores</DialogTitle>
            <DialogDescription>
              Siga os passos abaixo para ativar 2FA na sua conta
            </DialogDescription>
          </DialogHeader>
          <TwoFactorSetup
            onSuccess={() => handleSetupSuccess([])}
            onCancel={() => setShowSetupDialog(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Backup Codes Dialog */}
      <Dialog open={showBackupCodes} onOpenChange={setShowBackupCodes}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Códigos de Backup</DialogTitle>
            <DialogDescription>
              Guarde estes códigos em um lugar seguro. Cada um pode ser usado uma única vez para fazer login se perder
              seu app de autenticação.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {backupCodes.map((code, i) => (
              <div key={i} className="font-mono text-sm bg-muted p-2 rounded">
                {code}
              </div>
            ))}
          </div>
          <Button
            onClick={() => {
              navigator.clipboard.writeText(backupCodes.join("\n"))
              toast.success("Códigos copiados!")
            }}
          >
            Copiar Todos
          </Button>
        </DialogContent>
      </Dialog>

      {/* Disable Confirmation */}
      <AlertDialog open={showDisableDialog} onOpenChange={setShowDisableDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Desabilitar 2FA?</AlertDialogTitle>
            <AlertDialogDescription>
              Desabilitar a autenticação em dois fatores deixará sua conta menos segura. Tem certeza?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDisableTwoFactor} className="bg-destructive">
              Desabilitar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
