import type {
  DomainTransactionStatus,
  DomainTransactionType,
} from "./transaction-entity"

interface RequiredTransactionFields {
  userId: string
  categoryId: string
  description: string
}

const MAX_AMOUNT = 999999999999.99

const VALID_STATUS_TRANSITIONS: Record<DomainTransactionStatus, DomainTransactionStatus[]> = {
  PENDING: ["COMPLETED", "CANCELLED"],
  COMPLETED: ["CANCELLED"],
  CANCELLED: [],
}

export function validateAmount(amount: number): void {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Valor da transacao deve ser maior que zero")
  }

  if (amount > MAX_AMOUNT) {
    throw new Error("Valor da transacao excede o limite permitido")
  }
}

export function validateTransactionDate(date: Date): void {
  if (Number.isNaN(date.getTime())) {
    throw new Error("Data da transacao invalida")
  }
}

export function validateRequiredFields(input: RequiredTransactionFields): void {
  if (!input.userId?.trim()) {
    throw new Error("Usuario da transacao e obrigatorio")
  }

  if (!input.categoryId?.trim()) {
    throw new Error("Categoria da transacao e obrigatoria")
  }

  if (!input.description?.trim()) {
    throw new Error("Descricao da transacao e obrigatoria")
  }
}

export function ensureExpenseWithinBalance(type: DomainTransactionType, amount: number, currentBalance?: number): void {
  if (type !== "EXPENSE") {
    return
  }

  if (typeof currentBalance !== "number") {
    return
  }

  if (amount > currentBalance) {
    throw new Error("Saldo insuficiente para registrar esta despesa")
  }
}

export function validateStatusTransition(from: DomainTransactionStatus, to: DomainTransactionStatus): void {
  if (from === to) {
    return
  }

  const allowedTransitions = VALID_STATUS_TRANSITIONS[from] ?? []

  if (!allowedTransitions.includes(to)) {
    throw new Error("Mudanca de status da transacao nao permitida")
  }
}

export function applyTransactionToBalance(currentBalance: number, type: DomainTransactionType, amount: number): number {
  return type === "EXPENSE" ? currentBalance - amount : currentBalance + amount
}
