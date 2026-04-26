import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { SyncJobRunner } from "./sync-job.runner"
import type { SyncJobRepositoryPort } from "../ports/sync-job-repository.port"
import type { SyncJobProps } from "../../domain/sync-job-entity"
import { SyncTransactionsUseCase } from "../use-cases/sync-transactions.use-case"

function makeJob(overrides: Partial<SyncJobProps> = {}): SyncJobProps {
  return {
    id: "job-1",
    bankConnectionId: "bc-1",
    status: "RUNNING",
    attempts: 1,
    scheduledAt: new Date(),
    startedAt: new Date(),
    finishedAt: null,
    lastError: null,
    payload: null,
    ...overrides,
  }
}

function makeJobs(initial: SyncJobProps[] = []): {
  repo: SyncJobRepositoryPort
  store: Map<string, SyncJobProps>
} {
  const store = new Map<string, SyncJobProps>(initial.map((j) => [j.id as string, j]))
  const repo: SyncJobRepositoryPort = {
    create: vi.fn(),
    findById: vi.fn(async (id) => store.get(id) ?? null),
    claimPending: vi.fn(async () => Array.from(store.values()).filter((j) => j.status === "RUNNING")),
    update: vi.fn(async (id, patch) => {
      const current = store.get(id)
      if (!current) throw new Error("not found")
      const next = { ...current, ...patch }
      store.set(id, next)
      return next
    }),
  }
  return { repo, store }
}

function makeUseCase(impl?: () => Promise<unknown>): SyncTransactionsUseCase {
  return {
    execute: vi.fn(impl ?? (async () => ({}) as unknown)),
  } as unknown as SyncTransactionsUseCase
}

const ORIGINAL = process.env.MMX_OPEN_FINANCE_RUNNER_ENABLED

describe("SyncJobRunner.tick", () => {
  beforeEach(() => {
    process.env.MMX_OPEN_FINANCE_RUNNER_ENABLED = "false"
  })
  afterEach(() => {
    if (ORIGINAL === undefined) delete process.env.MMX_OPEN_FINANCE_RUNNER_ENABLED
    else process.env.MMX_OPEN_FINANCE_RUNNER_ENABLED = ORIGINAL
  })

  it("processa jobs RUNNING e marca DONE em sucesso", async () => {
    const { repo, store } = makeJobs([makeJob()])
    const useCase = makeUseCase(async () => ({ ok: true }))
    const runner = new SyncJobRunner(repo, useCase)

    const result = await runner.tick()
    expect(result.processed).toBe(1)
    expect(useCase.execute).toHaveBeenCalledWith({ bankConnectionId: "bc-1" })
    expect(store.get("job-1")?.status).toBe("DONE")
  })

  it("retry+failed em falha (ainda menos que MAX_ATTEMPTS)", async () => {
    const { repo, store } = makeJobs([makeJob({ attempts: 2 })])
    const useCase = makeUseCase(async () => {
      throw new Error("transient")
    })
    const runner = new SyncJobRunner(repo, useCase)

    await runner.tick()
    const job = store.get("job-1")
    expect(job?.status).toBe("PENDING")
    expect(job?.lastError).toBe("transient")
  })

  it("marca FAILED após 5 attempts", async () => {
    const { repo, store } = makeJobs([makeJob({ attempts: 5 })])
    const useCase = makeUseCase(async () => {
      throw new Error("permanent")
    })
    const runner = new SyncJobRunner(repo, useCase)

    await runner.tick()
    const job = store.get("job-1")
    expect(job?.status).toBe("FAILED")
    expect(job?.lastError).toBe("permanent")
  })

  it("retorna processed=0 quando não há jobs pendentes", async () => {
    const { repo } = makeJobs([])
    const useCase = makeUseCase()
    const runner = new SyncJobRunner(repo, useCase)
    const result = await runner.tick()
    expect(result.processed).toBe(0)
    expect(useCase.execute).not.toHaveBeenCalled()
  })

  it("ignora reentrada concorrente (running flag)", async () => {
    const { repo } = makeJobs([makeJob()])
    let resolveUseCase: (() => void) | null = null
    const useCase = makeUseCase(
      () => new Promise<unknown>((resolve) => { resolveUseCase = () => resolve({}) }),
    )
    const runner = new SyncJobRunner(repo, useCase)
    const first = runner.tick()
    const second = await runner.tick()
    expect(second.processed).toBe(0)
    resolveUseCase?.()
    await first
  })
})
