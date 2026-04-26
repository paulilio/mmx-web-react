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

const VALID_STATUS_TRANSITIONS: Record<
  DomainTransactionStatus,
  DomainTransactionStatus[]
> = {
  PENDING: ["COMPLETED", "CANCELLED"],
  COMPLETED: ["CANCELLED"],
  CANCELLED: [],
}

function validationError(message: string, code = "VALIDATION_ERROR"): Error {
  return Object.assign(new Error(message), { status: 400, code })
}

function conflictError(message: string, code: string): Error {
  return Object.assign(new Error(message), { status: 409, code })
}

export function validateAmount(amount: number): void {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw validationError("Valor da transacao deve ser maior que zero", "INVALID_AMOUNT")
  }

  if (amount > MAX_AMOUNT) {
    throw validationError("Valor da transacao excede o limite permitido", "INVALID_AMOUNT")
  }
}

export function validateTransactionDate(date: Date): void {
  if (Number.isNaN(date.getTime())) {
    throw validationError("Data da transacao invalida", "INVALID_DATE")
  }
}

export function validateRequiredFields(input: RequiredTransactionFields): void {
  if (!input.userId?.trim()) {
    throw validationError("Usuario da transacao e obrigatorio", "MISSING_USER")
  }

  if (!input.categoryId?.trim()) {
    throw validationError("Categoria da transacao e obrigatoria", "MISSING_CATEGORY")
  }

  if (!input.description?.trim()) {
    throw validationError("Descricao da transacao e obrigatoria", "MISSING_DESCRIPTION")
  }
}

export function ensureExpenseWithinBalance(
  type: DomainTransactionType,
  amount: number,
  currentBalance?: number,
): void {
  if (type !== "EXPENSE") {
    return
  }

  if (typeof currentBalance !== "number") {
    return
  }

  if (amount > currentBalance) {
    throw conflictError("Saldo insuficiente para registrar esta despesa", "INSUFFICIENT_BALANCE")
  }
}

export function validateStatusTransition(
  from: DomainTransactionStatus,
  to: DomainTransactionStatus,
): void {
  if (from === to) {
    return
  }

  const allowedTransitions = VALID_STATUS_TRANSITIONS[from] ?? []

  if (!allowedTransitions.includes(to)) {
    throw validationError(
      "Mudanca de status da transacao nao permitida",
      "INVALID_STATUS_TRANSITION",
    )
  }
}
