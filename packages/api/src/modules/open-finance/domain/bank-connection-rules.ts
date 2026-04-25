export type BankConnectionStatus = "SYNCING" | "ACTIVE" | "EXPIRED" | "REVOKED" | "ERROR"

const VALID_TRANSITIONS: Record<BankConnectionStatus, BankConnectionStatus[]> = {
  SYNCING: ["ACTIVE", "ERROR", "EXPIRED"],
  ACTIVE: ["SYNCING", "EXPIRED", "REVOKED", "ERROR"],
  EXPIRED: ["SYNCING", "REVOKED"],
  ERROR: ["SYNCING", "REVOKED"],
  REVOKED: [],
}

export function validateBankConnectionTransition(
  from: BankConnectionStatus,
  to: BankConnectionStatus,
): void {
  if (from === to) return
  const allowed = VALID_TRANSITIONS[from] ?? []
  if (!allowed.includes(to)) {
    throw new Error(`Transicao de status invalida: ${from} -> ${to}`)
  }
}

export function validateConnectionFields(input: {
  userId: string
  provider: string
  providerLinkId: string
  institutionCode: string
}): void {
  if (!input.userId?.trim()) throw new Error("Usuario da conexao e obrigatorio")
  if (!input.provider?.trim()) throw new Error("Provider e obrigatorio")
  if (!input.providerLinkId?.trim()) throw new Error("Link id e obrigatorio")
  if (!input.institutionCode?.trim()) throw new Error("Codigo da instituicao e obrigatorio")
}
