import { Injectable, Inject } from "@nestjs/common"
import { USER_REPOSITORY, type IUserRepository } from "../ports/user-repository.port"
import { type AuthUserView, toAuthUserView } from "../../domain/user.types"
import { issueAccessToken, issueRefreshToken } from "@/core/lib/server/security/jwt"
import { persistRefreshSession } from "@/core/lib/server/security/refresh-session-store"

export interface OAuthProfile {
  email: string
  givenName?: string
  familyName?: string
  fullName?: string
  picture?: string
  provider: "google" | "microsoft"
}

export interface OAuthCallbackOutput {
  user: AuthUserView
  accessToken: string
  refreshToken: string
  expiresIn: number
  isNewUser: boolean
}

function splitName(fullName: string | undefined, providerLabel: string): { firstName: string; lastName: string } {
  if (!fullName) return { firstName: "Usuário", lastName: providerLabel }
  const parts = fullName.trim().split(/\s+/)
  if (parts.length === 1) return { firstName: parts[0]!, lastName: providerLabel }
  return { firstName: parts[0]!, lastName: parts.slice(1).join(" ") || providerLabel }
}

@Injectable()
export class HandleOAuthCallbackUseCase {
  constructor(@Inject(USER_REPOSITORY) private readonly userRepo: IUserRepository) {}

  async execute(profile: OAuthProfile): Promise<OAuthCallbackOutput> {
    const existing = await this.userRepo.findByEmail(profile.email)
    const providerLabel = profile.provider === "google" ? "Google" : "Microsoft"
    const nameFallback = splitName(profile.fullName, providerLabel)

    let isNewUser: boolean
    let record

    if (existing) {
      record = await this.userRepo.update(existing.id, {
        isEmailConfirmed: true,
        lastLogin: new Date(),
        ...(profile.picture ? { profilePhoto: profile.picture } : {}),
      })
      isNewUser = false
    } else {
      record = await this.userRepo.create({
        email: profile.email,
        passwordHash: null,
        firstName: profile.givenName || nameFallback.firstName,
        lastName: profile.familyName || nameFallback.lastName,
        isEmailConfirmed: true,
        ...(profile.picture ? { profilePhoto: profile.picture } : {}),
        planType: "FREE",
        lastLogin: new Date(),
      })
      isNewUser = true
    }

    const accessResult = issueAccessToken({ id: record.id, email: record.email })
    const refreshResult = issueRefreshToken({ id: record.id, email: record.email })
    persistRefreshSession(refreshResult.token, record.id, refreshResult.expiresInSeconds)

    return {
      user: toAuthUserView(record),
      accessToken: accessResult.token,
      refreshToken: refreshResult.token,
      expiresIn: accessResult.expiresInSeconds,
      isNewUser,
    }
  }
}
