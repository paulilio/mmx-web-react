export type SyncJobStatus = "PENDING" | "RUNNING" | "DONE" | "FAILED"

const VALID_TRANSITIONS: Record<SyncJobStatus, SyncJobStatus[]> = {
  PENDING: ["RUNNING"],
  RUNNING: ["DONE", "PENDING", "FAILED"],
  DONE: [],
  FAILED: ["PENDING"],
}

const MAX_ATTEMPTS = 5
const BASE_BACKOFF_SECONDS = 30

export interface SyncJobProps {
  id?: string
  bankConnectionId: string
  status: SyncJobStatus
  attempts: number
  scheduledAt: Date
  startedAt?: Date | null
  finishedAt?: Date | null
  lastError?: string | null
  payload?: Record<string, unknown> | null
}

export class SyncJobEntity {
  constructor(private readonly props: SyncJobProps) {}

  static create(bankConnectionId: string, payload?: Record<string, unknown>): SyncJobEntity {
    if (!bankConnectionId?.trim()) {
      throw new Error("BankConnection do job de sync e obrigatoria")
    }
    return new SyncJobEntity({
      bankConnectionId,
      status: "PENDING",
      attempts: 0,
      scheduledAt: new Date(),
      startedAt: null,
      finishedAt: null,
      lastError: null,
      payload: payload ?? null,
    })
  }

  static fromRecord(record: SyncJobProps): SyncJobEntity {
    return new SyncJobEntity(record)
  }

  get value(): SyncJobProps {
    return this.props
  }

  start(now: Date = new Date()): SyncJobProps {
    validateTransition(this.props.status, "RUNNING")
    return {
      ...this.props,
      status: "RUNNING",
      startedAt: now,
      attempts: this.props.attempts + 1,
    }
  }

  complete(now: Date = new Date()): SyncJobProps {
    validateTransition(this.props.status, "DONE")
    return {
      ...this.props,
      status: "DONE",
      finishedAt: now,
      lastError: null,
    }
  }

  retryOrFail(error: string, now: Date = new Date()): SyncJobProps {
    if (this.props.attempts >= MAX_ATTEMPTS) {
      validateTransition(this.props.status, "FAILED")
      return {
        ...this.props,
        status: "FAILED",
        finishedAt: now,
        lastError: error,
      }
    }
    validateTransition(this.props.status, "PENDING")
    const backoffMs = BASE_BACKOFF_SECONDS * Math.pow(2, this.props.attempts) * 1000
    return {
      ...this.props,
      status: "PENDING",
      scheduledAt: new Date(now.getTime() + backoffMs),
      lastError: error,
    }
  }
}

function validateTransition(from: SyncJobStatus, to: SyncJobStatus): void {
  if (from === to) return
  const allowed = VALID_TRANSITIONS[from] ?? []
  if (!allowed.includes(to)) {
    throw new Error(`Transicao de status invalida: ${from} -> ${to}`)
  }
}
