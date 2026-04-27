/** @vitest-environment jsdom */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { cleanup, render, screen, fireEvent } from "@testing-library/react"
import type { ButtonHTMLAttributes, ReactNode } from "react"
import { TransactionActionsMenu } from "./transaction-actions-menu"
import type { Transaction } from "@/lib/shared/types"

// Mock simples do dropdown menu — abre tudo de uma vez (children sempre visíveis)
vi.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DropdownMenuContent: ({ children }: { children: ReactNode }) => <div role="menu">{children}</div>,
  DropdownMenuItem: ({
    children,
    onClick,
    className,
  }: {
    children: ReactNode
    onClick?: () => void
    className?: string
  }) => (
    <button role="menuitem" onClick={onClick} className={className}>
      {children}
    </button>
  ),
  DropdownMenuSeparator: () => <hr />,
}))

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button {...props}>{children}</button>
  ),
}))

function makeTx(overrides: Partial<Transaction> = {}): Transaction {
  return {
    id: "tx_1",
    description: "Aluguel",
    amount: 100,
    type: "expense",
    categoryId: "cat_1",
    accountId: "acc_1",
    date: "2026-08-01",
    status: "pending",
    createdAt: "2026-08-01T00:00:00.000Z",
    updatedAt: "2026-08-01T00:00:00.000Z",
    ...overrides,
  }
}

function makeHandlers() {
  return {
    onEdit: vi.fn(),
    onEditOnlyThis: vi.fn(),
    onDuplicate: vi.fn(),
    onSkipNext: vi.fn(),
    onTogglePause: vi.fn(),
    onDelete: vi.fn(),
  }
}

describe("TransactionActionsMenu", () => {
  beforeEach(() => vi.clearAllMocks())
  afterEach(() => cleanup())

  it("transação avulsa: mostra apenas Editar / Duplicar / Excluir", () => {
    const tx = makeTx({ templateId: null })
    render(<TransactionActionsMenu transaction={tx} {...makeHandlers()} />)

    expect(screen.getByRole("menuitem", { name: /^Editar$/i })).toBeTruthy()
    expect(screen.queryByRole("menuitem", { name: /Editar somente esta/i })).toBeNull()
    expect(screen.getByRole("menuitem", { name: /Duplicar transação/i })).toBeTruthy()
    expect(screen.queryByRole("menuitem", { name: /Pular próxima/i })).toBeNull()
    expect(screen.queryByRole("menuitem", { name: /Pausar série|Retomar série/i })).toBeNull()
    expect(screen.getByRole("menuitem", { name: /Excluir/i })).toBeTruthy()
  })

  it("série pendente !skipped: mostra todas as ações de série incluindo Pular próxima", () => {
    const tx = makeTx({
      templateId: "tpl_1",
      template: {
        id: "tpl_1",
        frequency: "monthly",
        interval: 1,
        daysOfWeek: [],
        dayOfMonth: null,
        weekOfMonth: null,
        monthOfYear: null,
        monthlyMode: null,
        count: 12,
        startDate: "2026-05-01",
        endDate: null,
        paused: false,
        pausedAt: null,
        templateAmount: 100,
        templateDescription: "X",
        templateNotes: null,
        templateType: "expense",
        templateCategoryId: "cat_1",
        templateContactId: null,
        templateAreaId: null,
        templateCategoryGroupId: null,
        createdAt: "2026-04-01",
        updatedAt: "2026-04-01",
      },
      status: "pending",
      skipped: false,
    })
    render(<TransactionActionsMenu transaction={tx} {...makeHandlers()} />)

    expect(screen.getByRole("menuitem", { name: /Editar somente esta/i })).toBeTruthy()
    expect(screen.getByRole("menuitem", { name: /Pular próxima ocorrência/i })).toBeTruthy()
    expect(screen.getByRole("menuitem", { name: /Pausar série/i })).toBeTruthy()
  })

  it("série já pausada: mostra Retomar série em vez de Pausar", () => {
    const tx = makeTx({
      templateId: "tpl_1",
      template: {
        id: "tpl_1",
        frequency: "monthly",
        interval: 1,
        daysOfWeek: [],
        dayOfMonth: null,
        weekOfMonth: null,
        monthOfYear: null,
        monthlyMode: null,
        count: 12,
        startDate: "2026-05-01",
        endDate: null,
        paused: true,
        pausedAt: "2026-08-15T10:00:00.000Z",
        templateAmount: 100,
        templateDescription: "X",
        templateNotes: null,
        templateType: "expense",
        templateCategoryId: "cat_1",
        templateContactId: null,
        templateAreaId: null,
        templateCategoryGroupId: null,
        createdAt: "2026-04-01",
        updatedAt: "2026-08-15",
      },
    })
    render(<TransactionActionsMenu transaction={tx} {...makeHandlers()} />)

    expect(screen.getByRole("menuitem", { name: /Retomar série/i })).toBeTruthy()
    expect(screen.queryByRole("menuitem", { name: /^Pausar série$/i })).toBeNull()
  })

  it("transação skipped: esconde 'Pular próxima' (já pulada)", () => {
    const tx = makeTx({
      templateId: "tpl_1",
      status: "pending",
      skipped: true,
    })
    render(<TransactionActionsMenu transaction={tx} {...makeHandlers()} />)

    expect(screen.queryByRole("menuitem", { name: /Pular próxima/i })).toBeNull()
  })

  it("transação completed: esconde 'Pular próxima' (já consolidada)", () => {
    const tx = makeTx({
      templateId: "tpl_1",
      status: "completed",
      skipped: false,
    })
    render(<TransactionActionsMenu transaction={tx} {...makeHandlers()} />)

    expect(screen.queryByRole("menuitem", { name: /Pular próxima/i })).toBeNull()
  })

  it("dispara onEdit ao clicar em 'Editar'", () => {
    const handlers = makeHandlers()
    render(<TransactionActionsMenu transaction={makeTx()} {...handlers} />)

    fireEvent.click(screen.getByRole("menuitem", { name: /^Editar$/i }))
    expect(handlers.onEdit).toHaveBeenCalledTimes(1)
  })

  it("dispara onDelete ao clicar em 'Excluir'", () => {
    const handlers = makeHandlers()
    render(<TransactionActionsMenu transaction={makeTx()} {...handlers} />)

    fireEvent.click(screen.getByRole("menuitem", { name: /Excluir/i }))
    expect(handlers.onDelete).toHaveBeenCalledTimes(1)
  })

  it("dispara onTogglePause ao clicar em 'Pausar série'", () => {
    const handlers = makeHandlers()
    const tx = makeTx({ templateId: "tpl_1" })
    render(<TransactionActionsMenu transaction={tx} {...handlers} />)

    fireEvent.click(screen.getByRole("menuitem", { name: /Pausar série/i }))
    expect(handlers.onTogglePause).toHaveBeenCalledTimes(1)
  })

  it("dispara onSkipNext ao clicar em 'Pular próxima'", () => {
    const handlers = makeHandlers()
    const tx = makeTx({ templateId: "tpl_1", status: "pending", skipped: false })
    render(<TransactionActionsMenu transaction={tx} {...handlers} />)

    fireEvent.click(screen.getByRole("menuitem", { name: /Pular próxima/i }))
    expect(handlers.onSkipNext).toHaveBeenCalledTimes(1)
  })

  it("dispara onDuplicate ao clicar em 'Duplicar transação'", () => {
    const handlers = makeHandlers()
    render(<TransactionActionsMenu transaction={makeTx()} {...handlers} />)

    fireEvent.click(screen.getByRole("menuitem", { name: /Duplicar transação/i }))
    expect(handlers.onDuplicate).toHaveBeenCalledTimes(1)
  })
})
