/** @vitest-environment jsdom */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import React from "react"
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react"
import { TransferFundsModal } from "./transfer-funds-modal"

const { mockUseBudgetAllocations, mockUseForm } = vi.hoisted(() => ({
  mockUseBudgetAllocations: vi.fn(),
  mockUseForm: vi.fn(),
}))

vi.mock("@/hooks/use-budget-allocations", () => ({
  useBudgetAllocations: mockUseBudgetAllocations,
}))

vi.mock("react-hook-form", () => ({
  useForm: mockUseForm,
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

vi.mock("@/components/ui/select", () => ({
  Select: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  SelectTrigger: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  SelectValue: ({ placeholder }: { placeholder?: string }) => <span>{placeholder}</span>,
  SelectContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  SelectItem: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}))

const budgetGroups = [
  {
    id: "group_a",
    name: "Grupo A",
    color: "#22c55e",
    icon: "A",
    status: "active" as const,
    createdAt: "2026-03-01T00:00:00.000Z",
    updatedAt: "2026-03-01T00:00:00.000Z",
  },
  {
    id: "group_b",
    name: "Grupo B",
    color: "#3b82f6",
    icon: "B",
    status: "active" as const,
    createdAt: "2026-03-01T00:00:00.000Z",
    updatedAt: "2026-03-01T00:00:00.000Z",
  },
]

function mockFormSubmit(data: { fromBudgetGroupId: string; toBudgetGroupId: string; amount: number; month: number; year: number }) {
  mockUseForm.mockReturnValue({
    register: vi.fn(() => ({})),
    handleSubmit:
      (callback: (formData: typeof data) => Promise<void> | void) =>
      async (event?: Event) => {
        event?.preventDefault()
        await callback(data)
      },
    reset: vi.fn(),
    setValue: vi.fn(),
    watch: vi.fn(() => "group_a"),
    formState: { errors: {} },
  } as unknown)
}

describe("TransferFundsModal", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal("alert", vi.fn())
  })

  afterEach(() => {
    cleanup()
  })

  it("transfere fundos com sucesso e fecha modal", async () => {
    const transferFunds = vi.fn().mockResolvedValue({})
    const onOpenChange = vi.fn()

    mockUseBudgetAllocations.mockReturnValue({
      budgetAllocations: [
        { id: "alloc_from", budget_group_id: "group_a", available_amount: 300 },
        { id: "alloc_to", budget_group_id: "group_b", available_amount: 50 },
      ],
      transferFunds,
    } as unknown)

    mockFormSubmit({
      fromBudgetGroupId: "group_a",
      toBudgetGroupId: "group_b",
      amount: 120,
      month: 3,
      year: 2026,
    })

    render(<TransferFundsModal open={true} onOpenChange={onOpenChange} budgetGroups={budgetGroups} month={3} year={2026} />)

    fireEvent.click(screen.getByRole("button", { name: "Transferir Fundos" }))

    await waitFor(() => {
      expect(transferFunds).toHaveBeenCalledWith("alloc_from", "alloc_to", 120)
    })

    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it("mostra erro quando saldo e insuficiente", async () => {
    const transferFunds = vi.fn().mockResolvedValue({})

    mockUseBudgetAllocations.mockReturnValue({
      budgetAllocations: [
        { id: "alloc_from", budget_group_id: "group_a", available_amount: 100 },
        { id: "alloc_to", budget_group_id: "group_b", available_amount: 50 },
      ],
      transferFunds,
    } as unknown)

    mockFormSubmit({
      fromBudgetGroupId: "group_a",
      toBudgetGroupId: "group_b",
      amount: 250,
      month: 3,
      year: 2026,
    })

    render(
      <TransferFundsModal open={true} onOpenChange={vi.fn()} budgetGroups={budgetGroups} month={3} year={2026} />,
    )

    fireEvent.click(screen.getByRole("button", { name: "Transferir Fundos" }))

    await waitFor(() => {
      expect(globalThis.alert).toHaveBeenCalledWith("Fundos insuficientes no grupo de origem")
    })

    expect(transferFunds).not.toHaveBeenCalled()
  })
})
