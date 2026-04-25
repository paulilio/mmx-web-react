import { Injectable, Inject } from "@nestjs/common"
import {
  SESSION_REPOSITORY,
  ISessionRepository,
} from "../ports/session-repository.port"

@Injectable()
export class RevokeAllExceptUseCase {
  constructor(@Inject(SESSION_REPOSITORY) private readonly sessionRepo: ISessionRepository) {}

  async execute(userId: string, keepSessionId: string): Promise<{ revokedCount: number }> {
    const allSessions = await this.sessionRepo.findAllByUserId(userId)
    const revokedCount = allSessions.length - 1 // All except current

    await this.sessionRepo.revokeAllExcept(userId, keepSessionId)

    return { revokedCount }
  }
}
