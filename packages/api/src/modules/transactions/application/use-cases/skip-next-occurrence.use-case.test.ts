import { describe, expect, it, vi, beforeEach } from "vitest"
import { SkipNextOccurrenceUseCase } from "./skip-next-occurrence.use-case"
import type { PrismaService } from "@/infrastructure/database/prisma/prisma.service"
import type { ITransactionRepository } from "../ports/transaction-repository.port"
import type { TransactionRecord } from "../../domain/transaction.types"

function makeTxRepo(): ITransactionRepository {
  return {
    findById: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    summarizeByTypeAndStatus: vi.fn(),
    summarizeAgingExpenses: vi.fn(),
    summarizeCashflowByDate: vi.fn(),
  }
}

function makePrisma() {
  return {
    transaction: {
      update: vi.fn(),
    },
  } as unknown as PrismaService & {
    transaction: { update: ReturnType<typeof vi.fn> }
  }
}

function makeTx(overrides: Partial<TransactionRecord> = {}): TransactionRecord {
  return {
    id: "tx_5",
    userId: "user_1",
    description: "X",
    amount: 100,
    type: "EXPENSE",
    categoryId: "cat_1",
    date: new Date("2026-08-01"),
    status: "PENDING",
    templateId: "tpl_1",
    seriesIndex: 5,
    skipped: false,
    isException: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

describe("SkipNextOccurrenceUseCase", () => {
  let prisma: ReturnType<typeof makePrisma>
  let txRepo: ITransactionRepository
  let useCase: SkipNextOccurrenceUseCase

  beforeEach(() => {
    prisma = makePrisma()
    txRepo = makeTxRepo()
    useCase = new SkipNextOccurrenceUseCase(prisma, txRepo)
  })

  it("seta skipped=true via prisma.transaction.update", async () => {
    vi.mocked(txRepo.findById).mockResolvedValue(makeTx())
    prisma.transaction.update.mockResolvedValue(makeTx({ skipped: true }))

    const result = await useCase.execute("user_1", "tx_5")

    expect(prisma.transaction.update).toHaveBeenCalledWith({
      where: { id: "tx_5" },
      data: { skipped: true },
    })
    expect(result.skipped).toBe(true)
  })

  it("rejeita 404 quando transação não existe", async () => {
    vi.mocked(txRepo.findById).mockResolvedValue(null)

    await expect(useCase.execute("user_1", "tx_inexistente")).rejects.toThrow(
      "Transação não encontrada",
    )
    expect(prisma.transaction.update).not.toHaveBeenCalled()
  })

  it("rejeita 400 quando transação não pertence a uma série", async () => {
    vi.mocked(txRepo.findById).mockResolvedValue(makeTx({ templateId: null }))

    await expect(useCase.execute("user_1", "tx_avulsa")).rejects.toThrow(
      "não pertence a uma série",
    )
    expect(prisma.transaction.update).not.toHaveBeenCalled()
  })

  it("é idempotente: chamada 2x não falha", async () => {
    vi.mocked(txRepo.findById).mockResolvedValue(makeTx({ skipped: true }))
    prisma.transaction.update.mockResolvedValue(makeTx({ skipped: true }))

    await useCase.execute("user_1", "tx_5")
    await useCase.execute("user_1", "tx_5")

    expect(prisma.transaction.update).toHaveBeenCalledTimes(2)
    // Mesma operação, sem efeito colateral
  })

  it("respeita user isolation (usa findById com userId)", async () => {
    vi.mocked(txRepo.findById).mockResolvedValue(makeTx())
    prisma.transaction.update.mockResolvedValue(makeTx({ skipped: true }))

    await useCase.execute("user_1", "tx_5")

    expect(txRepo.findById).toHaveBeenCalledWith("tx_5", "user_1")
  })
})
