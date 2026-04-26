"use client"

import { MoreHorizontal, Pencil, Copy, SkipForward, Pause, Play, Trash2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import type { Transaction } from "@/lib/shared/types"

interface Props {
  transaction: Transaction
  onEdit: () => void
  onEditOnlyThis: () => void
  onDuplicate: () => void
  onSkipNext: () => void
  onTogglePause: () => void
  onDelete: () => void
}

export function TransactionActionsMenu({
  transaction,
  onEdit,
  onEditOnlyThis,
  onDuplicate,
  onSkipNext,
  onTogglePause,
  onDelete,
}: Props) {
  const isSeries = Boolean(transaction.templateId)
  const seriesPaused = transaction.template?.paused ?? false
  const canSkip =
    isSeries && transaction.status === "pending" && !transaction.skipped

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-muted-foreground hover:bg-accent hover:text-foreground"
          aria-label="Ações da transação"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={onEdit}>
          <Pencil className="mr-2 h-4 w-4" />
          Editar
        </DropdownMenuItem>
        {isSeries && (
          <DropdownMenuItem onClick={onEditOnlyThis}>
            <Pencil className="mr-2 h-4 w-4" />
            Editar somente esta
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={onDuplicate}>
          <Copy className="mr-2 h-4 w-4" />
          Duplicar transação
        </DropdownMenuItem>

        {isSeries && (
          <>
            <DropdownMenuSeparator />
            {canSkip && (
              <DropdownMenuItem onClick={onSkipNext}>
                <SkipForward className="mr-2 h-4 w-4" />
                Pular próxima ocorrência
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={onTogglePause}>
              {seriesPaused ? (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Retomar série
                </>
              ) : (
                <>
                  <Pause className="mr-2 h-4 w-4" />
                  Pausar série
                </>
              )}
            </DropdownMenuItem>
          </>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={onDelete}
          className="text-expense focus:bg-expense/10 focus:text-expense"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Excluir
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
