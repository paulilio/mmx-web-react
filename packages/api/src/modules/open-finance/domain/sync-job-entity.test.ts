import { describe, expect, it } from "vitest"
import { SyncJobEntity } from "./sync-job-entity"

describe("SyncJobEntity", () => {
  it("create inicia em PENDING com 0 attempts", () => {
    const j = SyncJobEntity.create("bc-1")
    expect(j.value.status).toBe("PENDING")
    expect(j.value.attempts).toBe(0)
  })

  it("create rejeita bankConnectionId vazio", () => {
    expect(() => SyncJobEntity.create("")).toThrow(/BankConnection/)
  })

  it("start incrementa attempts e marca RUNNING", () => {
    const j = SyncJobEntity.create("bc-1")
    const next = j.start()
    expect(next.status).toBe("RUNNING")
    expect(next.attempts).toBe(1)
    expect(next.startedAt).toBeInstanceOf(Date)
  })

  it("complete vai pra DONE e limpa lastError", () => {
    const j = SyncJobEntity.fromRecord({
      bankConnectionId: "bc-1",
      status: "RUNNING",
      attempts: 1,
      scheduledAt: new Date(),
      lastError: "previous-error",
    })
    const next = j.complete()
    expect(next.status).toBe("DONE")
    expect(next.lastError).toBeNull()
    expect(next.finishedAt).toBeInstanceOf(Date)
  })

  it("retryOrFail volta pra PENDING com backoff exponencial enquanto attempts < 5", () => {
    const j = SyncJobEntity.fromRecord({
      bankConnectionId: "bc-1",
      status: "RUNNING",
      attempts: 2,
      scheduledAt: new Date(),
    })
    const now = new Date("2026-04-25T00:00:00Z")
    const next = j.retryOrFail("transient", now)
    expect(next.status).toBe("PENDING")
    expect(next.lastError).toBe("transient")
    // 30s * 2^2 = 120s = 120000ms
    expect(next.scheduledAt.getTime() - now.getTime()).toBe(120_000)
  })

  it("retryOrFail vai pra FAILED após 5 tentativas", () => {
    const j = SyncJobEntity.fromRecord({
      bankConnectionId: "bc-1",
      status: "RUNNING",
      attempts: 5,
      scheduledAt: new Date(),
    })
    const next = j.retryOrFail("permanent")
    expect(next.status).toBe("FAILED")
    expect(next.lastError).toBe("permanent")
    expect(next.finishedAt).toBeInstanceOf(Date)
  })

  it("não permite RUNNING -> DONE quando ainda em PENDING", () => {
    const j = SyncJobEntity.create("bc-1")
    expect(() => j.complete()).toThrow(/Transicao de status invalida/)
  })
})
