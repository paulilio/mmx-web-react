import type { DomainAccountStatus, DomainAccountType } from "./account-entity"

export function validateAccountName(name: string) {
  if (!name || !name.trim()) {
    throw new Error("Nome da conta e obrigatorio")
  }
}

export function validateCurrency(currency: string) {
  if (!currency || !/^[A-Z]{3}$/.test(currency.trim().toUpperCase())) {
    throw new Error("Moeda deve ser um codigo ISO de 3 letras (ex.: BRL, USD)")
  }
}

export function validateOpeningBalanceDate(date: Date) {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    throw new Error("Data de saldo inicial invalida")
  }

  if (date.getTime() > Date.now() + 24 * 60 * 60 * 1000) {
    throw new Error("Data de saldo inicial nao pode estar no futuro")
  }
}

export function validateDayOfMonth(value: number, fieldLabel: string) {
  if (!Number.isInteger(value) || value < 1 || value > 31) {
    throw new Error(`${fieldLabel} deve ser um inteiro entre 1 e 31`)
  }
}

export function validateCreditLimit(value: number) {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error("Limite de credito deve ser maior que zero")
  }
}

export function normalizeAccountType(value: string): DomainAccountType {
  const normalized = value.trim().toLowerCase()

  if (normalized === "checking") return "CHECKING"
  if (normalized === "savings") return "SAVINGS"
  if (normalized === "credit-card" || normalized === "creditcard" || normalized === "credit_card") return "CREDIT_CARD"
  if (normalized === "investment") return "INVESTMENT"
  if (normalized === "business") return "BUSINESS"
  if (normalized === "cash") return "CASH"
  if (normalized === "other") return "OTHER"

  throw new Error("Tipo da conta invalido")
}

export function normalizeAccountStatus(value: string): DomainAccountStatus {
  const normalized = value.trim().toUpperCase()

  if (normalized === "ACTIVE") return "ACTIVE"
  if (normalized === "ARCHIVED") return "ARCHIVED"
  if (normalized === "PENDING_REVIEW" || normalized === "PENDING-REVIEW") return "PENDING_REVIEW"

  throw new Error("Status da conta invalido")
}

export interface AccountTypeFields {
  creditLimit?: number | null
  closingDay?: number | null
  dueDay?: number | null
}

export function enforceTypeSpecificFields(type: DomainAccountType, fields: AccountTypeFields) {
  if (type === "CREDIT_CARD") {
    if (fields.creditLimit == null) {
      throw new Error("Cartao de credito exige limite de credito")
    }
    validateCreditLimit(fields.creditLimit)

    if (fields.closingDay == null) {
      throw new Error("Cartao de credito exige dia de fechamento")
    }
    validateDayOfMonth(fields.closingDay, "Dia de fechamento")

    if (fields.dueDay == null) {
      throw new Error("Cartao de credito exige dia de vencimento")
    }
    validateDayOfMonth(fields.dueDay, "Dia de vencimento")

    return
  }

  if (fields.creditLimit != null) {
    throw new Error("Limite de credito so e permitido para contas do tipo CREDIT_CARD")
  }

  if (fields.closingDay != null) {
    throw new Error("Dia de fechamento so e permitido para contas do tipo CREDIT_CARD")
  }

  if (fields.dueDay != null) {
    throw new Error("Dia de vencimento so e permitido para contas do tipo CREDIT_CARD")
  }
}
