/** @vitest-environment jsdom */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import React from "react"
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react"
import { AddFundsModal } from "./add-funds-modal"

const { mockUseBudgetAllocations } = vi.hoisted(() => ({
  mockUseBudgetAllocations: vi.fn(),
}))

vi.mock("@/hooks/use-budget-allocations", () => ({
  useBudgetAllocations: mockUseBudgetAllocations,
}))

vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({ open, children }: { open: boolean; children: ReactNode }) => (open ? <div>{children}</div> : null),
  DialogContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DialogHeader: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: ReactNode }) => <h2>{children}</h2>,
}))

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) => <button {...props}>{children}</button>,
}))

vi.mock("@/components/ui/input", () => ({
  Input: (props: InputHTMLAttributes<HTMLInputElement>) => <input {...props} />,
}))

vi.mock("@/components/ui/label", () => ({
  Label: ({ children, htmlFor }: { children: ReactNode; htmlFor?: string }) => <label htmlFor={htmlFor}>{children}</label>,
}))

const budgetGroup = {
  id: "group_food",
  name: "Alimentacao",
  color: "#22c55e",
  icon: "Utensils",
  status: "active" as const,
  createdAt: "2026-03-01T00:00:00.000Z",
  updatedAt: "2026-03-01T00:00:00.000Z",
}

describe("AddFundsModal", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    cleanup()
  })

  it("atualiza alocacao existente e fecha modal", async () => {
    const onOpenChange = vi.fn()
    const updateBudgetAllocation = vi.fn().mockResolvedValue({})

    mockUseBudgetAllocations.mockReturnValue({
      budgetAllocations: [
        {
          id: "alloc_1",
          budget_group_id: "group_food",
          month: "2026-03",
          planned_amount: 0,
          funded_amount: 100,
          spent_amount: 20,
          available_amount: 80,
        },
      ],
      createBudgetAllocation: vi.fn(),
      updateBudgetAllocation,
    } as unknown)

    render(<AddFundsModal open={true} onOpenChange={onOpenChange} budgetGroup={budgetGroup} month={3} year={2026} />)

    fireEvent.change(screen.getByLabelText("Valor a Adicionar *"), { target: { value: "50" } })
    fireEvent.click(screen.getByRole("button", { name: "Adicionar Fundos" }))

    await waitFor(() => {
      expect(updateBudgetAllocation).toHaveBeenCalledWith("alloc_1", {
        funded_amount: 150,
        available_amount: 130,
      })
    })

    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it("cria nova alocacao quando nao existe registro no mes", async () => {
    const onOpenChange = vi.fn()
    const createBudgetAllocation = vi.fn().mockResolvedValue({})

    mockUseBudgetAllocations.mockReturnValue({
      budgetAllocations: [],
      createBudgetAllocation,
      updateBudgetAllocation: vi.fn(),
    } as unknown)

    render(<AddFundsModal open={true} onOpenChange={onOpenChange} budgetGroup={budgetGroup} month={3} year={2026} />)

    fireEvent.change(screen.getByLabelText("Valor a Adicionar *"), { target: { value: "75" } })
    fireEvent.click(screen.getByRole("button", { name: "Adicionar Fundos" }))

    await waitFor(() => {
      expect(createBudgetAllocation).toHaveBeenCalledWith({
        budget_group_id: "group_food",
        month: "2026-03",
        planned_amount: 0,
        funded_amount: 75,
      })
    })

    expect(onOpenChange).toHaveBeenCalledWith(false)
  })
})
