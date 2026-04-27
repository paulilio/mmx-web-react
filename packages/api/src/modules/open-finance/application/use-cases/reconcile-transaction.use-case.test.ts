import { describe, expect, it, vi } from "vitest"
import { ForbiddenException, NotFoundException } from "@nestjs/common"
import { ReconcileTransactionUseCase } from "./reconcile-transaction.use-case"
import type { BankConnectionRepositoryPort } from "../ports/bank-connection-repository.port"
import type { ImportedTransactionRepositoryPort } from "../ports/imported-transaction-repository.port"

function makeRepos(opts?: {
  imported?: { id: string; bankConnectionId: string } | null
  conn?: { id: string; userId: string } | null
}) {
  const imported: ImportedTransactionRepositoryPort = {
    upsertMany: vi.fn(),
    findById: vi.fn(async () =>
      opts?.imported
        ? ({
            id: opts.imported.id,
            bankConnectionId: opts.imported.bankConnectionId,
            externalId: "tx-1",
            source: "TRANSACTION" as const,
            rawPayload: {},
            amount: -10,
            currency: "BRL",
            occurredAt: new Date("2026-04-15"),
            description: "x",
            status: "PENDING" as const,
          })
        : null,
    ),
    findByExternalId: vi.fn(),
    listByConnection: vi.fn(),
    countByConnection: vi.fn(),
    update: vi.fn(),
  }
  const connections: BankConnectionRepositoryPort = {
    create: vi.fn(),
    findById: vi.fn(async () =>
      opts?.conn
        ? ({
            id: opts.conn.id,
            userId: opts.conn.userId,
            provider: "belvo",
            providerLinkId: "x",
            institutionCode: "x",
            institutionName: "x",
            status: "ACTIVE" as const,
          })
        : null,
    ),
    findByIdAndUser: vi.fn(),
    findByProviderLinkId: vi.fn(),
    findByPlainProviderLinkId: vi.fn(),
    listByUser: vi.fn(),
    update: vi.fn(),
  }
  return { imported, connections }
}

describe("ReconcileTransactionUseCase", () => {
  it("match marca status IMPORTED com matchedTransactionId", async () => {
    const { imported, connections } = makeRepos({
      imported: { id: "imp-1", bankConnectionId: "bc-1" },
      conn: { id: "bc-1", userId: "user-1" },
    })
    const useCase = new ReconcileTransactionUseCase(imported, connections)
    await useCase.execute({
      userId: "user-1",
      importedTransactionId: "imp-1",
      action: { kind: "match", matchedTransactionId: "tx-mmx-1" },
    })
    expect(imported.update).toHaveBeenCalledWith(
      "imp-1",
      expect.objectContaining({ status: "IMPORTED", matchedTransactionId: "tx-mmx-1" }),
    )
  })

  it("ignore marca status IGNORED", async () => {
    const { imported, connections } = makeRepos({
      imported: { id: "imp-1", bankConnectionId: "bc-1" },
      conn: { id: "bc-1", userId: "user-1" },
    })
    const useCase = new ReconcileTransactionUseCase(imported, connections)
    await useCase.execute({
      userId: "user-1",
      importedTransactionId: "imp-1",
      action: { kind: "ignore" },
    })
    expect(imported.update).toHaveBeenCalledWith(
      "imp-1",
      expect.objectContaining({ status: "IGNORED" }),
    )
  })

  it("404 quando imported transaction não existe", async () => {
    const { imported, connections } = makeRepos({ imported: null })
    const useCase = new ReconcileTransactionUseCase(imported, connections)
    await expect(
      useCase.execute({ userId: "user-1", importedTransactionId: "xx", action: { kind: "ignore" } }),
    ).rejects.toBeInstanceOf(NotFoundException)
  })

  it("403 quando connection é de outro user", async () => {
    const { imported, connections } = makeRepos({
      imported: { id: "imp-1", bankConnectionId: "bc-1" },
      conn: { id: "bc-1", userId: "user-2" },
    })
    const useCase = new ReconcileTransactionUseCase(imported, connections)
    await expect(
      useCase.execute({ userId: "user-1", importedTransactionId: "imp-1", action: { kind: "ignore" } }),
    ).rejects.toBeInstanceOf(ForbiddenException)
  })
})
