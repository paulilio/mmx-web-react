import { Injectable, Inject } from "@nestjs/common"
import {
  SESSION_REPOSITORY,
  ISessionRepository,
} from "../ports/session-repository.port"

@Injectable()
export class RevokeSessionUseCase {
  constructor(@Inject(SESSION_REPOSITORY) private readonly sessionRepo: ISessionRepository) {}

  async execute(userId: string, sessionId: string): Promise<{ revokedAt: string }> {
    const session = await this.sessionRepo.findOneById(sessionId)

    if (!session) {
      throw Object.assign(new Error("Session not found"), {
        status: 404,
        code: "SESSION_NOT_FOUND",
      })
    }

    if (session.userId !== userId) {
      throw Object.assign(new Error("Unauthorized"), {
        status: 403,
        code: "FORBIDDEN",
      })
    }

    await this.sessionRepo.revokeById(sessionId)

    return { revokedAt: new Date().toISOString() }
  }
}
