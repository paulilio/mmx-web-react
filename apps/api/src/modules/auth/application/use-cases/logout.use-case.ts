import { Injectable } from "@nestjs/common"
import { revokeRefreshSession } from "@/core/lib/server/security/refresh-session-store"

@Injectable()
export class LogoutUseCase {
  execute(refreshToken: string | null): void {
    if (refreshToken) {
      revokeRefreshSession(refreshToken)
    }
  }
}
