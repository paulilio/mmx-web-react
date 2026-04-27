import { describe, expect, it, vi } from "vitest"
import { HandleWebhookEventUseCase } from "./handle-webhook-event.use-case"
import type { BankConnectionRepositoryPort } from "../ports/bank-connection-repository.port"
import type { OpenFinanceProvider } from "../ports/open-finance-provider.port"
import type { SyncJobRepositoryPort } from "../ports/sync-job-repository.port"
import type { BankConnectionProps } from "../../domain/bank-connection-entity"

function makeConnection(overrides: Partial<BankConnectionProps> = {}): BankConnectionProps {
  return {
    id: "bc-1",
    userId: "user-1",
    provider: "belvo",
    providerLinkId: "encrypted",
    institutionCode: "br_belvo_bb",
    institutionName: "Banco do Brasil",
    status: "ACTIVE",
    consentExpiresAt: null,
    lastSyncedAt: null,
    lastError: null,
    ...overrides,
  }
}

function makeRepo(connection: BankConnectionProps | null): BankConnectionRepositoryPort {
  return {
    create: vi.fn(),
    findById: vi.fn(),
    findByIdAndUser: vi.fn(),
    findByProviderLinkId: vi.fn(),
    findByPlainProviderLinkId: vi.fn(async () => connection),
    listByUser: vi.fn(),
    update: vi.fn(async (id, patch) => ({ ...(connection as BankConnectionProps), ...patch, id })),
  }
}

function makeJobs(): SyncJobRepositoryPort {
  return {
    create: vi.fn(async (entity) => ({ ...entity.value, id: "job-new" })),
    findById: vi.fn(),
    claimPending: vi.fn(),
    update: vi.fn(),
  }
}

const provider: OpenFinanceProvider = {
  name: "belvo",
  createWidgetToken: vi.fn(),
  fetchLink: vi.fn(),
  fetchAccounts: vi.fn(),
  fetchTransactions: vi.fn(),
  fetchBills: vi.fn(),
  fetchOwners: vi.fn(),
  revokeLink: vi.fn(),
}

describe("HandleWebhookEventUseCase", () => {
  it("noop quando eventType ou linkId ausente", async () => {
    const repo = makeRepo(null)
    const jobs = makeJobs()
    const useCase = new HandleWebhookEventUseCase(provider, repo, jobs)

    expect(await useCase.execute({ eventType: null, linkId: "x" })).toEqual({ action: "noop" })
    expect(await useCase.execute({ eventType: "x", linkId: null })).toEqual({ action: "noop" })
    expect(repo.findByPlainProviderLinkId).not.toHaveBeenCalled()
  })

  it("noop quando linkId desconhecido", async () => {
    const repo = makeRepo(null)
    const jobs = makeJobs()
    const useCase = new HandleWebhookEventUseCase(provider, repo, jobs)
    const result = await useCase.execute({ eventType: "consent_expired", linkId: "unknown-link" })
    expect(result.action).toBe("noop")
    expect(repo.update).not.toHaveBeenCalled()
  })

  it("consent_expired marca status=EXPIRED", async () => {
    const repo = makeRepo(makeConnection())
    const jobs = makeJobs()
    const useCase = new HandleWebhookEventUseCase(provider, repo, jobs)
    const result = await useCase.execute({ eventType: "consent_expired", linkId: "link-1" })
    expect(result.action).toBe("expired")
    expect(repo.update).toHaveBeenCalledWith("bc-1", { status: "EXPIRED", lastError: "consent_expired" })
  })

  it("link.expired também marca status=EXPIRED", async () => {
    const repo = makeRepo(makeConnection())
    const jobs = makeJobs()
    const useCase = new HandleWebhookEventUseCase(provider, repo, jobs)
    const result = await useCase.execute({ eventType: "link.expired", linkId: "link-1" })
    expect(result.action).toBe("expired")
    expect(repo.update).toHaveBeenCalledWith("bc-1", { status: "EXPIRED", lastError: "consent_expired" })
  })

  it("link.invalid marca status=ERROR", async () => {
    const repo = makeRepo(makeConnection())
    const jobs = makeJobs()
    const useCase = new HandleWebhookEventUseCase(provider, repo, jobs)
    const result = await useCase.execute({ eventType: "link.invalid", linkId: "link-1" })
    expect(result.action).toBe("invalid")
    expect(repo.update).toHaveBeenCalledWith("bc-1", { status: "ERROR", lastError: "link_invalid" })
  })

  it("token_required marca status=EXPIRED com lastError específico", async () => {
    const repo = makeRepo(makeConnection())
    const jobs = makeJobs()
    const useCase = new HandleWebhookEventUseCase(provider, repo, jobs)
    const result = await useCase.execute({ eventType: "token_required", linkId: "link-1" })
    expect(result.action).toBe("token_required")
    expect(repo.update).toHaveBeenCalledWith("bc-1", { status: "EXPIRED", lastError: "token_required" })
  })

  it("transactions.new enfileira SyncJob PENDING", async () => {
    const repo = makeRepo(makeConnection())
    const jobs = makeJobs()
    const useCase = new HandleWebhookEventUseCase(provider, repo, jobs)
    const result = await useCase.execute({ eventType: "transactions.new", linkId: "link-1" })
    expect(result.action).toBe("sync_enqueued")
    expect(jobs.create).toHaveBeenCalled()
    expect(repo.update).not.toHaveBeenCalled()
  })

  it("transactions.historical_update também enfileira SyncJob", async () => {
    const repo = makeRepo(makeConnection())
    const jobs = makeJobs()
    const useCase = new HandleWebhookEventUseCase(provider, repo, jobs)
    const result = await useCase.execute({ eventType: "transactions.historical_update", linkId: "link-1" })
    expect(result.action).toBe("sync_enqueued")
    expect(jobs.create).toHaveBeenCalled()
  })

  it("eventType desconhecido cai em noop", async () => {
    const repo = makeRepo(makeConnection())
    const jobs = makeJobs()
    const useCase = new HandleWebhookEventUseCase(provider, repo, jobs)
    const result = await useCase.execute({ eventType: "some.future.event", linkId: "link-1" })
    expect(result.action).toBe("noop")
    expect(repo.update).not.toHaveBeenCalled()
    expect(jobs.create).not.toHaveBeenCalled()
  })
})
