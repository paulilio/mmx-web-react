import { Injectable } from "@nestjs/common"
import {
  verifyRefreshToken,
  issueAccessToken,
  issueRefreshToken,
} from "@/core/lib/server/security/jwt"
import {
  isRefreshSessionValid,
  rotateRefreshSession,
} from "@/core/lib/server/security/refresh-session-store"

export interface RefreshSessionOutput {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

@Injectable()
export class RefreshSessionUseCase {
  execute(currentRefreshToken: string): RefreshSessionOutput {
    let payload
    try {
      payload = verifyRefreshToken(currentRefreshToken)
    } catch {
      throw Object.assign(new Error("Refresh token inválido"), { status: 401, code: "INVALID_REFRESH_TOKEN" })
    }

    if (!isRefreshSessionValid(currentRefreshToken, payload.sub)) {
      throw Object.assign(new Error("Refresh token inválido"), { status: 401, code: "INVALID_REFRESH_TOKEN" })
    }

    const accessResult = issueAccessToken({ id: payload.sub, email: payload.email })
    const nextRefreshResult = issueRefreshToken({ id: payload.sub, email: payload.email })
    rotateRefreshSession(currentRefreshToken, nextRefreshResult.token, payload.sub, nextRefreshResult.expiresInSeconds)

    return {
      accessToken: accessResult.token,
      refreshToken: nextRefreshResult.token,
      expiresIn: accessResult.expiresInSeconds,
    }
  }
}
