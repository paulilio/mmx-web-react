import {
  validateBankConnectionTransition,
  validateConnectionFields,
  type BankConnectionStatus,
} from "./bank-connection-rules"

export interface BankConnectionProps {
  id?: string
  userId: string
  provider: string
  providerLinkId: string
  institutionCode: string
  institutionName: string
  status: BankConnectionStatus
  consentExpiresAt?: Date | null
  lastSyncedAt?: Date | null
  lastError?: string | null
}

export interface CreateBankConnectionInput {
  userId: string
  provider: string
  providerLinkId: string
  institutionCode: string
  institutionName: string
  consentExpiresAt?: Date | null
}

export class BankConnectionEntity {
  constructor(private readonly props: BankConnectionProps) {}

  static create(input: CreateBankConnectionInput): BankConnectionEntity {
    validateConnectionFields({
      userId: input.userId,
      provider: input.provider,
      providerLinkId: input.providerLinkId,
      institutionCode: input.institutionCode,
    })
    if (!input.institutionName?.trim()) {
      throw new Error("Nome da instituicao e obrigatorio")
    }
    return new BankConnectionEntity({
      userId: input.userId,
      provider: input.provider,
      providerLinkId: input.providerLinkId,
      institutionCode: input.institutionCode,
      institutionName: input.institutionName,
      status: "SYNCING",
      consentExpiresAt: input.consentExpiresAt ?? null,
      lastSyncedAt: null,
      lastError: null,
    })
  }

  static fromRecord(record: BankConnectionProps): BankConnectionEntity {
    return new BankConnectionEntity(record)
  }

  get value(): BankConnectionProps {
    return this.props
  }

  transitionTo(next: BankConnectionStatus): BankConnectionProps {
    validateBankConnectionTransition(this.props.status, next)
    return { ...this.props, status: next }
  }

  markActive(now: Date = new Date()): BankConnectionProps {
    return {
      ...this.transitionTo("ACTIVE"),
      lastSyncedAt: now,
      lastError: null,
    }
  }

  markError(message: string): BankConnectionProps {
    return {
      ...this.transitionTo("ERROR"),
      lastError: message,
    }
  }

  markRevoked(): BankConnectionProps {
    return this.transitionTo("REVOKED")
  }

  isConsentExpired(now: Date = new Date()): boolean {
    if (!this.props.consentExpiresAt) return false
    return this.props.consentExpiresAt.getTime() <= now.getTime()
  }
}
