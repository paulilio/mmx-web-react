import { describe, expect, it, vi } from "vitest"
import { CreateWidgetTokenUseCase } from "./create-widget-token.use-case"
import type { OpenFinanceProvider } from "../ports/open-finance-provider.port"

function makeProvider(): OpenFinanceProvider {
  return {
    name: "belvo",
    createWidgetToken: vi.fn(async () => ({
      accessToken: "eyJ.access",
      refreshToken: "eyJ.refresh",
      expiresIn: 1200,
    })),
    fetchLink: vi.fn(),
    fetchAccounts: vi.fn(),
    fetchTransactions: vi.fn(),
    fetchBills: vi.fn(),
    fetchOwners: vi.fn(),
    revokeLink: vi.fn(),
  }
}

describe("CreateWidgetTokenUseCase", () => {
  it("retorna accessToken e expiresIn do provider", async () => {
    const provider = makeProvider()
    const useCase = new CreateWidgetTokenUseCase(provider)
    const out = await useCase.execute({ userId: "user-1" })
    expect(out.accessToken).toBe("eyJ.access")
    expect(out.expiresIn).toBe(1200)
    expect(provider.createWidgetToken).toHaveBeenCalledWith({
      externalUserId: "user-1",
      cpf: undefined,
    })
  })

  it("rejeita userId vazio", async () => {
    const provider = makeProvider()
    const useCase = new CreateWidgetTokenUseCase(provider)
    await expect(useCase.execute({ userId: "" })).rejects.toThrow(/userId/)
  })

  it("repassa cpf opcional", async () => {
    const provider = makeProvider()
    const useCase = new CreateWidgetTokenUseCase(provider)
    await useCase.execute({ userId: "user-1", cpf: "76109277673" })
    expect(provider.createWidgetToken).toHaveBeenCalledWith({
      externalUserId: "user-1",
      cpf: "76109277673",
    })
  })
})
