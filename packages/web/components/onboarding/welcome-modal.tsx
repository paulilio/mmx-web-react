"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Sparkles, Database, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useOnboarding } from "@/hooks/use-onboarding"

export function WelcomeModal() {
  const { showWelcome, markWelcomeSeen, loadSampleData } = useOnboarding()
  const [busy, setBusy] = useState<"sample" | "skip" | null>(null)

  const handleLoadSample = async () => {
    setBusy("sample")
    try {
      await loadSampleData()
      toast.success("Dados de exemplo carregados! Explore os menus.")
    } catch (error) {
      toast.error(
        error instanceof Error
          ? `Não foi possível carregar os dados: ${error.message}`
          : "Não foi possível carregar os dados.",
      )
    } finally {
      setBusy(null)
    }
  }

  const handleSkip = async () => {
    setBusy("skip")
    try {
      await markWelcomeSeen()
    } catch {
      toast.error("Não foi possível registrar sua escolha. Tente novamente.")
    } finally {
      setBusy(null)
    }
  }

  return (
    <Dialog open={showWelcome}>
      <DialogContent className="max-w-lg" showCloseButton={false}>
        <DialogHeader>
          <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-primary/10">
            <Sparkles className="size-6 text-primary" />
          </div>
          <DialogTitle className="text-center text-2xl">
            Bem-vindo ao MoedaMix!
          </DialogTitle>
          <DialogDescription className="text-center">
            Sua conta está vazia. Você quer começar com 3 meses de dados de exemplo (transações,
            contatos e categorias) ou prefere começar do zero?
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2 py-2">
          <p className="text-xs text-muted-foreground">
            Os dados de exemplo são úteis para explorar os menus e gráficos antes de registrar suas
            próprias finanças. Você pode limpar a qualquer momento em Configurações.
          </p>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col sm:gap-2">
          <Button
            onClick={handleLoadSample}
            disabled={busy != null}
            className="w-full"
            size="lg"
          >
            {busy === "sample" ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Carregando dados de exemplo...
              </>
            ) : (
              <>
                <Database className="mr-2 size-4" />
                Carregar dados de exemplo
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={handleSkip}
            disabled={busy != null}
            className="w-full"
            size="lg"
          >
            {busy === "skip" ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Aguarde...
              </>
            ) : (
              "Começar do zero"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
