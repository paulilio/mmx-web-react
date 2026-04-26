import { describe, expect, it, vi, beforeEach } from "vitest"
import { MarkAsExceptionUseCase } from "./mark-as-exception.use-case"
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
    transaction: { update: vi.fn() },
  } as unknown as PrismaService & {
    transaction: { update: ReturnType<typeof vi.fn> }
  }
}

function makeTx(overrides: Partial<TransactionRecord> = {}): TransactionRecord {
  return {
    id: "tx_5",
    userId: "user_1",
    description: "Original",
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

describe("MarkAsExceptionUseCase", () => {
  let prisma: ReturnType<typeof makePrisma>
  let txRepo: ITransactionRepository
  let useCase: MarkAsExceptionUseCase

  beforeEach(() => {
    prisma = makePrisma()
    txRepo = makeTxRepo()
    useCase = new MarkAsExceptionUseCase(prisma, txRepo)
  })

  it("aplica patch e seta isException=true mantendo templateId", async () => {
    vi.mocked(txRepo.findById).mockResolvedValue(makeTx())
    prisma.transaction.update.mockResolvedValue(
      makeTx({ amount: 999, description: "Diferente", isException: true }),
    )

    const result = await useCase.execute({
      userId: "user_1",
      transactionId: "tx_5",
      patch: { amount: 999, description: "Diferente" },
    })

    expect(prisma.transaction.update).toHaveBeenCalledWith({
      where: { id: "tx_5" },
      data: expect.objectContaining({
        isException: true,
        description: "Diferente",
      }),
    })
    expect(result.isException).toBe(true)
    expect(result.amount).toBe(999)
  })

  it("rejeita 404 quando transação não existe", async () => {
    vi.mocked(txRepo.findById).mockResolvedValue(null)

    await expect(
      useCase.execute({
        userId: "user_1",
        transactionId: "tx_inexistente",
        patch: { amount: 999 },
      }),
    ).rejects.toThrow("Transação não encontrada")
    expect(prisma.transaction.update).not.toHaveBeenCalled()
  })

  it("rejeita 400 quando transação não pertence a uma série", async () => {
    vi.mocked(txRepo.findById).mockResolvedValue(makeTx({ templateId: null }))

    await expect(
      useCase.execute({
        userId: "user_1",
        transactionId: "tx_avulsa",
        patch: { amount: 999 },
      }),
    ).rejects.toThrow("não pertence a série")
    expect(prisma.transaction.update).not.toHaveBeenCalled()
  })

  it("ignora campos não fornecidos no patch (só passa o que veio)", async () => {
    vi.mocked(txRepo.findById).mockResolvedValue(makeTx())
    prisma.transaction.update.mockResolvedValue(makeTx({ amount: 999, isException: true }))

    await useCase.execute({
      userId: "user_1",
      transactionId: "tx_5",
      patch: { amount: 999 }, // só amount
    })

    const data = prisma.transaction.update.mock.calls[0]?.[0].data
    expect(data.isException).toBe(true)
    expect(data.amount).toBeDefined()
    expect(data.description).toBeUndefined()
    expect(data.notes).toBeUndefined()
  })

  it("respeita user isolation", async () => {
    vi.mocked(txRepo.findById).mockResolvedValue(makeTx())
    prisma.transaction.update.mockResolvedValue(makeTx({ isException: true }))

    await useCase.execute({
      userId: "user_1",
      transactionId: "tx_5",
      patch: { amount: 999 },
    })

    expect(txRepo.findById).toHaveBeenCalledWith("tx_5", "user_1")
  })
})
