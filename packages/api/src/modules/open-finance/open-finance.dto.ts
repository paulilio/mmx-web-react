import { BadRequestException } from "@nestjs/common"
import type { ImportedTransactionStatus } from "./domain/imported-transaction-entity"
import type { ReconcileAction } from "./application/use-cases/reconcile-transaction.use-case"

export interface RegisterConnectionBody {
  providerLinkId: string
  institutionCode: string
  institutionName: string
}

export function parseRegisterConnectionBody(raw: unknown): RegisterConnectionBody {
  if (!isObject(raw)) throw badRequest("Body inválido")
  const providerLinkId = requireString(raw.providerLinkId, "providerLinkId")
  const institutionCode = requireString(raw.institutionCode, "institutionCode")
  const institutionName = requireString(raw.institutionName, "institutionName")
  return { providerLinkId, institutionCode, institutionName }
}

export interface ReconcileBody {
  action: ReconcileAction
}

export function parseReconcileBody(raw: unknown): ReconcileBody {
  if (!isObject(raw)) throw badRequest("Body inválido")
  const kind = raw.action && isObject(raw.action) ? (raw.action as Record<string, unknown>).kind : null
  if (kind === "match") {
    const matchedTransactionId = requireString(
      (raw.action as Record<string, unknown>).matchedTransactionId,
      "action.matchedTransactionId",
    )
    return { action: { kind: "match", matchedTransactionId } }
  }
  if (kind === "ignore") return { action: { kind: "ignore" } }
  if (kind === "duplicate") return { action: { kind: "duplicate" } }
  throw badRequest("action.kind deve ser 'match', 'ignore' ou 'duplicate'")
}

export function parseImportedStatus(raw: string | undefined): ImportedTransactionStatus | undefined {
  if (raw === undefined || raw === "") return undefined
  const upper = raw.toUpperCase()
  if (upper === "PENDING" || upper === "IMPORTED" || upper === "DUPLICATE" || upper === "IGNORED") {
    return upper
  }
  throw badRequest("status deve ser pending|imported|duplicate|ignored")
}

export function parsePagination(page?: string, pageSize?: string): { page: number; pageSize: number } {
  const p = page ? Number.parseInt(page, 10) : 1
  const ps = pageSize ? Number.parseInt(pageSize, 10) : 50
  if (Number.isNaN(p) || p < 1) throw badRequest("page inválido")
  if (Number.isNaN(ps) || ps < 1 || ps > 200) throw badRequest("pageSize fora de [1,200]")
  return { page: p, pageSize: ps }
}

function requireString(value: unknown, field: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw badRequest(`${field} é obrigatório`)
  }
  return value
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function badRequest(message: string): BadRequestException {
  return new BadRequestException({
    data: null,
    error: { code: "BAD_REQUEST", message },
  })
}
