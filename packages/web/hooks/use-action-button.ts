"use client"

import { useState } from "react"
import { toast } from "sonner"

interface UseActionButtonOptions {
  actionName: string // Nome da ação para as mensagens (ex: "Transação salva", "Registro excluído")
  onAction: (...args: any[]) => Promise<void> | void
  successMessage?: string // Mensagem customizada de sucesso
  errorMessage?: string // Mensagem customizada de erro
}

export function useActionButton<TArgs extends any[]>({
  actionName,
  onAction,
  successMessage,
  errorMessage,
}: Omit<UseActionButtonOptions, "onAction"> & {
  onAction: (...args: TArgs) => Promise<void> | void
}) {
  const [isProcessing, setIsProcessing] = useState(false)

  const execute = async (...args: TArgs) => {
    setIsProcessing(true)
    try {
      await onAction(...args)

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
