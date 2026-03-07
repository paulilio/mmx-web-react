/** @vitest-environment jsdom */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import React from "react"
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react"
import { RolloverModal } from "./rollover-modal"

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

vi.mock("@/components/ui/checkbox", () => ({
  Checkbox: ({ checked, onCheckedChange, id, disabled }: { checked?: boolean; onCheckedChange?: (checked: boolean) => void; id?: string; disabled?: boolean }) => (
    <input
      id={id}
      type="checkbox"
      checked={!!checked}
      disabled={disabled}
      onChange={(event) => onCheckedChange?.(event.target.checked)}
    />
  ),
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

describe("RolloverModal", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, "error").mockImplementation(() => undefined)
    vi.stubGlobal("alert", vi.fn())
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it("transfere valor para proximo mes e atualiza mes atual", async () => {
    const updateBudgetAllocation = vi.fn().mockResolvedValue({})
    const createBudgetAllocation = vi.fn().mockResolvedValue({})
    const onOpenChange = vi.fn()

    const currentMonthAllocations = [
      {
        id: "alloc_current",
        budget_group_id: "group_food",
        month: "2026-03",
        planned_amount: 0,
        funded_amount: 300,
        spent_amount: 100,
        available_amount: 200,
      },
    ]

    const nextMonthAllocations = [
      {
        id: "alloc_next",
        budget_group_id: "group_food",
        month: "2026-04",
        planned_amount: 0,
        funded_amount: 50,
        spent_amount: 0,
        available_amount: 50,
      },
    ]

    mockUseBudgetAllocations.mockImplementation((month) => {
      if (month === "2026-03") {
        return {
          budgetAllocations: currentMonthAllocations,
          updateBudgetAllocation,
          createBudgetAllocation,
        } as unknown
      }

      return {
        budgetAllocations: nextMonthAllocations,
        updateBudgetAllocation,
        createBudgetAllocation,
      } as unknown
    })

    render(<RolloverModal open={true} onOpenChange={onOpenChange} budgetGroup={budgetGroup} month={3} year={2026} />)

    fireEvent.change(screen.getByLabelText("Valor para Rollover (opcional)"), { target: { value: "80" } })
    fireEvent.click(screen.getByRole("button", { name: "Executar Rollover" }))

    await waitFor(() => {
      expect(updateBudgetAllocation).toHaveBeenCalledWith("alloc_next", {
        funded_amount: 130,
        available_amount: 130,
      })
      expect(updateBudgetAllocation).toHaveBeenCalledWith("alloc_current", {
        funded_amount: 220,
        available_amount: 120,
      })
    })

    expect(onOpenChange).toHaveBeenCalledWith(false)
    expect(createBudgetAllocation).not.toHaveBeenCalled()
  })

  it("mostra alerta quando ocorre erro no rollover", async () => {
    const updateBudgetAllocation = vi.fn().mockRejectedValue(new Error("falha"))

    const currentMonthAllocations = [
      {
        id: "alloc_current",
        budget_group_id: "group_food",
        month: "2026-03",
        planned_amount: 0,
        funded_amount: 300,
        spent_amount: 100,
        available_amount: 200,
      },
    ]

    const nextMonthAllocations = [
      {
        id: "alloc_next",
        budget_group_id: "group_food",
        month: "2026-04",
        planned_amount: 0,
        funded_amount: 50,
        spent_amount: 0,
        available_amount: 50,
      },
    ]

    mockUseBudgetAllocations.mockImplementation((month) => {
      if (month === "2026-03") {
        return {
          budgetAllocations: currentMonthAllocations,
          updateBudgetAllocation,
          createBudgetAllocation: vi.fn(),
        } as unknown
      }

      return {
        budgetAllocations: nextMonthAllocations,
        updateBudgetAllocation,
        createBudgetAllocation: vi.fn(),
      } as unknown
    })

    render(<RolloverModal open={true} onOpenChange={vi.fn()} budgetGroup={budgetGroup} month={3} year={2026} />)

    fireEvent.change(screen.getByLabelText("Valor para Rollover (opcional)"), { target: { value: "80" } })
    fireEvent.click(screen.getByRole("button", { name: "Executar Rollover" }))

    await waitFor(() => {
      expect(globalThis.alert).toHaveBeenCalledWith("Erro ao configurar rollover. Tente novamente.")
    })
  })
})
