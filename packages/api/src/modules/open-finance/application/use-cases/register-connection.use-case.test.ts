import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { randomBytes } from "node:crypto"
import { ConflictException } from "@nestjs/common"
import { decrypt } from "@/core/lib/server/security/encryption"
import { RegisterConnectionUseCase } from "./register-connection.use-case"
import type { BankConnectionRepositoryPort } from "../ports/bank-connection-repository.port"
import type { OpenFinanceProvider } from "../ports/open-finance-provider.port"
import type { SyncJobRepositoryPort } from "../ports/sync-job-repository.port"

const ORIGINAL_KEY = process.env.MMX_ENCRYPTION_KEY

function makeProvider(overrides: Partial<OpenFinanceProvider> = {}): OpenFinanceProvider {
  return {
    name: "belvo",
    createWidgetToken: vi.fn(),
    fetchLink: vi.fn(async () => ({
      externalId: "link-1",
      institutionCode: "ofmockbank_br_retail",
      status: "valid" as const,
      createdAt: new Date(),
    })),
    fetchAccounts: vi.fn(),
    fetchTransactions: vi.fn(),
    fetchBills: vi.fn(),
    fetchOwners: vi.fn(),
    revokeLink: vi.fn(),
    ...overrides,
  }
}

function makeConnections(overrides: Partial<BankConnectionRepositoryPort> = {}): BankConnectionRepositoryPort {
  return {
    create: vi.fn(async (entity) => ({ ...entity.value, id: "bc-1" })),
    findById: vi.fn(),
    findByIdAndUser: vi.fn(),
    findByProviderLinkId: vi.fn(async () => null),
    listByUser: vi.fn(),
    update: vi.fn(),
    ...overrides,
  }
}

function makeJobs(overrides: Partial<SyncJobRepositoryPort> = {}): SyncJobRepositoryPort {
  return {
    create: vi.fn(async (entity) => ({ ...entity.value, id: "job-1" })),
    findById: vi.fn(),
    claimPending: vi.fn(),
    update: vi.fn(),
    ...overrides,
  }
}

describe("RegisterConnectionUseCase", () => {
  beforeEach(() => {
    process.env.MMX_ENCRYPTION_KEY = randomBytes(32).toString("base64")
  })

  afterEach(() => {
    if (ORIGINAL_KEY === undefined) delete process.env.MMX_ENCRYPTION_KEY
    else process.env.MMX_ENCRYPTION_KEY = ORIGINAL_KEY
  })

  it("registra conexão, encripta linkId e enfileira sync inicial", async () => {
    const provider = makeProvider()
    const connections = makeConnections()
    const jobs = makeJobs()
    const useCase = new RegisterConnectionUseCase(provider, connections, jobs)

    const result = await useCase.execute({
      userId: "user-1",
      providerLinkId: "raw-link-uuid",
      institutionCode: "ofmockbank_br_retail",
      institutionName: "OF Mock Bank by Raidiam",
    })

    expect(result.id).toBe("bc-1")
    expect(result.jobId).toBe("job-1")
    expect(result.status).toBe("SYNCING")

    const createCall = (connections.create as ReturnType<typeof vi.fn>).mock.calls[0]
    const persisted = createCall[0].value
    expect(persisted.providerLinkId).not.toBe("raw-link-uuid")
    expect(decrypt(persisted.providerLinkId)).toBe("raw-link-uuid")
  })

  it("rejeita conexão duplicada com 409", async () => {
    const provider = makeProvider()
    const connections = makeConnections({
      findByProviderLinkId: vi.fn(async () => ({
        id: "bc-existing",
        userId: "user-1",
        provider: "belvo",
        providerLinkId: "encrypted",
        institutionCode: "x",
        institutionName: "x",
        status: "ACTIVE" as const,
      })),
    })
    const jobs = makeJobs()
    const useCase = new RegisterConnectionUseCase(provider, connections, jobs)

    await expect(
      useCase.execute({
        userId: "user-1",
        providerLinkId: "raw-link-uuid",
        institutionCode: "x",
        institutionName: "x",
      }),
    ).rejects.toBeInstanceOf(ConflictException)
  })
})
