export type ImportedTransactionSource = "TRANSACTION" | "BILL"
export type ImportedTransactionStatus = "PENDING" | "IMPORTED" | "DUPLICATE" | "IGNORED"

export interface ImportedTransactionProps {
  id?: string
  bankConnectionId: string
  externalId: string
  source: ImportedTransactionSource
  rawPayload: Record<string, unknown>
  amount: number
  currency: string
  occurredAt: Date
  description: string
  merchantName?: string | null
  categoryHint?: string | null
  status: ImportedTransactionStatus
  matchedTransactionId?: string | null
}

export interface CreateImportedTransactionInput {
  bankConnectionId: string
  externalId: string
  source: ImportedTransactionSource
  rawPayload: Record<string, unknown>
  amount: number
  currency?: string
  occurredAt: Date
  description: string
  merchantName?: string | null
  categoryHint?: string | null
}

const AMOUNT_TOLERANCE = 0.01
const DAY_WINDOW_MS = 24 * 60 * 60 * 1000

export class ImportedTransactionEntity {
  constructor(private readonly props: ImportedTransactionProps) {}

  static create(input: CreateImportedTransactionInput): ImportedTransactionEntity {
    if (!input.bankConnectionId?.trim()) {
      throw new Error("BankConnection da transacao importada e obrigatoria")
    }
    if (!input.externalId?.trim()) {
      throw new Error("External id da transacao importada e obrigatorio")
    }
    if (!Number.isFinite(input.amount)) {
      throw new Error("Valor da transacao importada deve ser um numero")
    }
    if (Number.isNaN(input.occurredAt.getTime())) {
      throw new Error("Data da transacao importada invalida")
    }
    if (!input.description?.trim()) {
      throw new Error("Descricao da transacao importada e obrigatoria")
    }
    return new ImportedTransactionEntity({
      bankConnectionId: input.bankConnectionId,
      externalId: input.externalId,
      source: input.source,
      rawPayload: input.rawPayload,
      amount: input.amount,
      currency: input.currency ?? "BRL",
      occurredAt: input.occurredAt,
      description: input.description,
      merchantName: input.merchantName ?? null,
      categoryHint: input.categoryHint ?? null,
      status: "PENDING",
      matchedTransactionId: null,
    })
  }

  static fromRecord(record: ImportedTransactionProps): ImportedTransactionEntity {
    return new ImportedTransactionEntity(record)
  }

  get value(): ImportedTransactionProps {
    return this.props
  }

  markDuplicate(): ImportedTransactionProps {
    return { ...this.props, status: "DUPLICATE" }
  }

  markImported(matchedTransactionId?: string | null): ImportedTransactionProps {
    return {
      ...this.props,
      status: "IMPORTED",
      matchedTransactionId: matchedTransactionId ?? null,
    }
  }

  markIgnored(): ImportedTransactionProps {
    return { ...this.props, status: "IGNORED" }
  }

  /**
   * Checks if this imported transaction matches a candidate Transaction
   * within the configured tolerance windows.
   */
  matchesCandidate(candidate: {
    amount: number
    occurredAt: Date
    description: string
  }): boolean {
    if (Math.abs(candidate.amount - this.props.amount) > AMOUNT_TOLERANCE) {
      return false
    }
    const dayDiff = Math.abs(candidate.occurredAt.getTime() - this.props.occurredAt.getTime())
    if (dayDiff > DAY_WINDOW_MS) {
      return false
    }
    return descriptionSimilarity(candidate.description, this.props.description) >= 0.7
  }
}

export function descriptionSimilarity(a: string, b: string): number {
  const x = normalize(a)
  const y = normalize(b)
  if (x === y) return 1
  if (x.length === 0 || y.length === 0) return 0
  const distance = levenshtein(x, y)
  const maxLen = Math.max(x.length, y.length)
  return 1 - distance / maxLen
}

function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0
  if (a.length === 0) return b.length
  if (b.length === 0) return a.length
  const prev = new Array<number>(b.length + 1)
  const curr = new Array<number>(b.length + 1)
  for (let j = 0; j <= b.length; j++) prev[j] = j
  for (let i = 1; i <= a.length; i++) {
    curr[0] = i
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      curr[j] = Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost)
    }
    for (let j = 0; j <= b.length; j++) prev[j] = curr[j]
  }
  return prev[b.length]
}
