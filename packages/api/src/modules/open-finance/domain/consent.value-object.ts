export interface ConsentProps {
  grantedAt: Date
  expiresAt?: Date | null
}

export class Consent {
  constructor(private readonly props: ConsentProps) {
    if (Number.isNaN(props.grantedAt.getTime())) {
      throw new Error("Data de concessao do consentimento invalida")
    }
    if (props.expiresAt && props.expiresAt.getTime() <= props.grantedAt.getTime()) {
      throw new Error("Data de expiracao do consentimento deve ser posterior a concessao")
    }
  }

  get grantedAt(): Date {
    return this.props.grantedAt
  }

  get expiresAt(): Date | null {
    return this.props.expiresAt ?? null
  }

  isExpiredAt(now: Date = new Date()): boolean {
    if (!this.props.expiresAt) return false
    return this.props.expiresAt.getTime() <= now.getTime()
  }

  get value(): ConsentProps {
    return this.props
  }
}
