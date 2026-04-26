import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { randomBytes } from "node:crypto"
import { ForbiddenException, NotFoundException } from "@nestjs/common"
import { encrypt } from "@/core/lib/server/security/encryption"
import { RevokeConnectionUseCase } from "./revoke-connection.use-case"
import type { BankConnectionRepositoryPort } from "../ports/bank-connection-repository.port"
import type { OpenFinanceProvider } from "../ports/open-finance-provider.port"

const ORIGINAL_KEY = process.env.MMX_ENCRYPTION_KEY

function makeProvider(revokeImpl?: () => Promise<void>): OpenFinanceProvider {
  return {
    name: "belvo",
    createWidgetToken: vi.fn(),
    fetchLink: vi.fn(),
    fetchAccounts: vi.fn(),
    fetchTransactions: vi.fn(),
    fetchBills: vi.fn(),
    fetchOwners: vi.fn(),
    revokeLink: vi.fn(revokeImpl ?? (async () => undefined)),
  }
}

function makeConnections(initial?: { userId: string; status: string }) {
  const repo: BankConnectionRepositoryPort = {
    create: vi.fn(),
    findById: vi.fn(async () =>
      initial
        ? {
            id: "bc-1",
            userId: initial.userId,
            provider: "belvo",
            providerLinkId: encrypt("link"),
            institutionCode: "x",
            institutionName: "x",
            status: initial.status as "ACTIVE",
          }
        : null,
    ),
    findByIdAndUser: vi.fn(),
    findByProviderLinkId: vi.fn(),
    listByUser: vi.fn(),
    update: vi.fn(async (id, patch) => ({ id, ...patch } as never)),
  }
  return repo
}

describe("RevokeConnectionUseCase", () => {
  beforeEach(() => {
    process.env.MMX_ENCRYPTION_KEY = randomBytes(32).toString("base64")
  })

  afterEach(() => {
    if (ORIGINAL_KEY === undefined) delete process.env.MMX_ENCRYPTION_KEY
    else process.env.MMX_ENCRYPTION_KEY = ORIGINAL_KEY
  })

  it("revoga: chama provider e marca status REVOKED", async () => {
    const provider = makeProvider()
    const connections = makeConnections({ userId: "user-1", status: "ACTIVE" })
    const useCase = new RevokeConnectionUseCase(provider, connections)
    await useCase.execute({ userId: "user-1", connectionId: "bc-1" })
    expect(provider.revokeLink).toHaveBeenCalledWith("link")
    expect(connections.update).toHaveBeenCalledWith(
      "bc-1",
      expect.objectContaining({ status: "REVOKED" }),
    )
  })

  it("idempotente quando já está REVOKED", async () => {
    const provider = makeProvider()
    const connections = makeConnections({ userId: "user-1", status: "REVOKED" })
    const useCase = new RevokeConnectionUseCase(provider, connections)
    await useCase.execute({ userId: "user-1", connectionId: "bc-1" })
    expect(provider.revokeLink).not.toHaveBeenCalled()
    expect(connections.update).not.toHaveBeenCalled()
  })

  it("não bloqueia revogação local se provider falha", async () => {
    const provider = makeProvider(async () => {
      throw new Error("upstream offline")
    })
    const connections = makeConnections({ userId: "user-1", status: "ACTIVE" })
    const useCase = new RevokeConnectionUseCase(provider, connections)
    await expect(useCase.execute({ userId: "user-1", connectionId: "bc-1" })).resolves.toBeUndefined()
    expect(connections.update).toHaveBeenCalledWith(
      "bc-1",
      expect.objectContaining({ status: "REVOKED" }),
    )
  })

  it("404 quando conexão não existe", async () => {
    const provider = makeProvider()
    const connections = makeConnections()
    const useCase = new RevokeConnectionUseCase(provider, connections)
    await expect(useCase.execute({ userId: "user-1", connectionId: "bc-x" })).rejects.toBeInstanceOf(
      NotFoundException,
    )
  })

  it("403 quando conexão é de outro user", async () => {
    const provider = makeProvider()
    const connections = makeConnections({ userId: "user-2", status: "ACTIVE" })
    const useCase = new RevokeConnectionUseCase(provider, connections)
    await expect(useCase.execute({ userId: "user-1", connectionId: "bc-1" })).rejects.toBeInstanceOf(
      ForbiddenException,
    )
  })
})
