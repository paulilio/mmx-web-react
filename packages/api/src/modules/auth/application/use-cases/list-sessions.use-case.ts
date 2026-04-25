import { Injectable, Inject } from "@nestjs/common"
import {
  SESSION_REPOSITORY,
  ISessionRepository,
} from "../ports/session-repository.port"

export interface SessionDto {
  id: string
  deviceFingerprint?: string | null
  userAgent?: string | null
  lastIp?: string | null
  lastActivityAt: string
  createdAt: string
  expiresAt: string
}

export interface ListSessionsOutput {
  sessions: SessionDto[]
  count: number
}

@Injectable()
export class ListSessionsUseCase {
  constructor(@Inject(SESSION_REPOSITORY) private readonly sessionRepo: ISessionRepository) {}

  async execute(userId: string): Promise<ListSessionsOutput> {
    const sessions = await this.sessionRepo.findAllByUserId(userId)

    return {
      sessions: sessions.map((s) => ({
        id: s.id,
        deviceFingerprint: s.deviceFingerprint,
        userAgent: s.userAgent,
        lastIp: s.lastIp,
        lastActivityAt: s.lastActivityAt.toISOString(),
        createdAt: s.createdAt.toISOString(),
        expiresAt: s.expiresAt.toISOString(),
      })),
      count: sessions.length,
    }
  }
}
