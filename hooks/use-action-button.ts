"use client"

import { useState } from "react"
import { toast } from "sonner"

interface UseActionButtonOptions {
  actionName: string // Nome da ação para as mensagens (ex: "Transação salva", "Registro excluído")
  onAction: () => Promise<void> | void
  successMessage?: string // Mensagem customizada de sucesso
  errorMessage?: string // Mensagem customizada de erro
}

export function useActionButton({ actionName, onAction, successMessage, errorMessage }: UseActionButtonOptions) {
  const [isProcessing, setIsProcessing] = useState(false)

  const execute = async () => {
    setIsProcessing(true)
    try {
      await onAction()

      const message = successMessage || `${actionName} com sucesso! Os dados foram atualizados.`
      toast.success(message)
    } catch (error) {
      console.error(`[v0] Error in ${actionName}:`, error)

      const message = errorMessage || "Erro ao processar a ação. Tente novamente."
      toast.error(message)
    } finally {
      setIsProcessing(false)
    }
  }

  return {
    isProcessing,
    execute,
    buttonProps: {
      disabled: isProcessing,
      onClick: execute,
    },
    getButtonText: (normalText: string) => (isProcessing ? "Processando..." : normalText),
  }
}
