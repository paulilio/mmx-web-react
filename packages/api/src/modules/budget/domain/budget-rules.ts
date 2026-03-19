export function validateMonth(month: number) {
  if (!Number.isInteger(month) || month < 1 || month > 12) {
    throw new Error("Mes do orçamento invalido")
  }
}

export function validateYear(year: number) {
  if (!Number.isInteger(year) || year < 1970) {
    throw new Error("Ano do orçamento invalido")
  }
}

export function validateNonNegativeAmount(value: number, fieldName = "valor") {
  if (typeof value !== "number" || Number.isNaN(value) || value < 0) {
    throw new Error(`${fieldName} deve ser um numero nao-negativo`)
  }
}

export function normalizeRolloverEnabled(value?: boolean | null) {
  if (value == null) return false
  return Boolean(value)
}
