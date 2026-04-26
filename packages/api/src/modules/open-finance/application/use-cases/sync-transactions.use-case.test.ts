import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { randomBytes } from "node:crypto"
import { encrypt } from "@/core/lib/server/security/encryption"
import { SyncTransactionsUseCase } from "./sync-transactions.use-case"
import type { BankConnectionRepositoryPort } from "../ports/bank-connection-repository.port"
import type { ImportedTransactionRepositoryPort } from "../ports/imported-transaction-repository.port"
import type { OpenFinanceProvider } from "../ports/open-finance-provider.port"

const ORIGINAL_KEY = process.env.MMX_ENCRYPTION_KEY

function makeRepos() {
  const connections: BankConnectionRepositoryPort = {
    create: vi.fn(),
    findById: vi.fn(),
    findByIdAndUser: vi.fn(),
    findByProviderLinkId: vi.fn(),
    listByUser: vi.fn(),
    update: vi.fn(),
  }
  const imported: ImportedTransactionRepositoryPort = {
    upsertMany: vi.fn(async (xs) => ({ created: xs.length, skipped: 0 })),
    findById: vi.fn(),
    findByExternalId: vi.fn(),
    listByConnection: vi.fn(),
    countByConnection: vi.fn(),
    update: vi.fn(),
  }
  return { connections, imported }
}

function makeProvider(): OpenFinanceProvider {
  return {
    name: "belvo",
    createWidgetToken: vi.fn(),
    fetchLink: vi.fn(),
    fetchAccounts: vi.fn(async () => []),
    fetchTransactions: vi.fn(async () => [
      {
        externalId: "tx-1",
        accountExternalId: "acc-1",
        amount: -10,
        currency: "BRL",
        occurredAt: new Date("2026-04-15"),
        description: "Compra teste",
        type: "OUTFLOW" as const,
      },
    ]),
    fetchBills: vi.fn(async () => [
      {
        externalId: "bill-1",
        accountExternalId: "acc-1",
        amount: 1234,
        currency: "BRL",
        billingDate: new Date("2026-04-15"),
        dueDate: new Date("2026-04-25"),
        description: "Fatura teste",
      },
    ]),
    fetchOwners: vi.fn(),
    revokeLink: vi.fn(),
  }
}

describe("SyncTransactionsUseCase", () => {
  beforeEach(() => {
    process.env.MMX_ENCRYPTION_KEY = randomBytes(32).toString("base64")
  })

  afterEach(() => {
    if (ORIGINAL_KEY === undefined) delete process.env.MMX_ENCRYPTION_KEY
    else process.env.MMX_ENCRYPTION_KEY = ORIGINAL_KEY
  })

  it("busca tx + bills, persiste e marca conexão ACTIVE", async () => {
    const { connections, imported } = makeRepos()
    const provider = makeProvider()
    const encryptedLink = encrypt("link-uuid")
    ;(connections.findById as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "bc-1",
      userId: "user-1",
      provider: "belvo",
      providerLinkId: encryptedLink,
      institutionCode: "x",
      institutionName: "x",
      status: "SYNCING",
    })

    const useCase = new SyncTransactionsUseCase(provider, connections, imported)
    const out = await useCase.execute({ bankConnectionId: "bc-1" })

    expect(out.imported.transactions).toBe(1)
    expect(out.imported.bills).toBe(1)
    expect(connections.update).toHaveBeenCalledWith(
      "bc-1",
      expect.objectContaining({ status: "ACTIVE" }),
    )
  })

  it("rejeita sincronizar conexão revogada", async () => {
    const { connections, imported } = makeRepos()
    const provider = makeProvider()
    ;(connections.findById as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "bc-1",
      userId: "user-1",
      provider: "belvo",
      providerLinkId: encrypt("link"),
      institutionCode: "x",
      institutionName: "x",
      status: "REVOKED",
    })
    const useCase = new SyncTransactionsUseCase(provider, connections, imported)
    await expect(useCase.execute({ bankConnectionId: "bc-1" })).rejects.toThrow(/revogada/)
  })
})
