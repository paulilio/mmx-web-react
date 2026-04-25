import { Injectable, Inject } from "@nestjs/common"
import {
  REFRESH_SESSION_REPOSITORY,
  type IRefreshSessionRepository,
} from "../ports/refresh-session-repository.port"

@Injectable()
export class LogoutAllUseCase {
  constructor(
    @Inject(REFRESH_SESSION_REPOSITORY) private readonly sessionRepo: IRefreshSessionRepository,
  ) {}

  async execute(userId: string): Promise<{ revokedCount: number }> {
    const revokedCount = await this.sessionRepo.revokeAllForUser(userId)
    return { revokedCount }
  }
}
