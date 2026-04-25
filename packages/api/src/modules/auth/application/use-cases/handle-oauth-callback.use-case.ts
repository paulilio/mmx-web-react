import { Injectable, Inject } from "@nestjs/common"
import { USER_REPOSITORY, type IUserRepository } from "../ports/user-repository.port"
import {
  REFRESH_SESSION_REPOSITORY,
  type IRefreshSessionRepository,
} from "../ports/refresh-session-repository.port"
import {
  OAUTH_ACCOUNT_REPOSITORY,
  type IOAuthAccountRepository,
  type OAuthProviderValue,
} from "../ports/oauth-account-repository.port"
import { type AuthUserView, toAuthUserView } from "../../domain/user.types"
import { issueAccessToken, issueRefreshToken } from "@/core/lib/server/security/jwt"
import { sha256Hex } from "@/core/lib/server/security/token-hash"

export interface OAuthProfile {
  email: string
  givenName?: string
  familyName?: string
  fullName?: string
  picture?: string
  provider: "google" | "microsoft"
  providerAccountId: string
}

export interface OAuthCallbackOutput {
  user: AuthUserView
  accessToken: string
  refreshToken: string
  expiresIn: number
  isNewUser: boolean
}

export interface OAuthCallbackContext {
  userAgent?: string | null
  ipAddress?: string | null
}

function splitName(fullName: string | undefined, providerLabel: string): { firstName: string; lastName: string } {
  if (!fullName) return { firstName: "Usuário", lastName: providerLabel }
  const parts = fullName.trim().split(/\s+/)
  if (parts.length === 1) return { firstName: parts[0]!, lastName: providerLabel }
  return { firstName: parts[0]!, lastName: parts.slice(1).join(" ") || providerLabel }
}

@Injectable()
export class HandleOAuthCallbackUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepo: IUserRepository,
    @Inject(REFRESH_SESSION_REPOSITORY) private readonly sessionRepo: IRefreshSessionRepository,
    @Inject(OAUTH_ACCOUNT_REPOSITORY) private readonly oauthAccountRepo: IOAuthAccountRepository,
  ) {}

  async execute(profile: OAuthProfile, context: OAuthCallbackContext = {}): Promise<OAuthCallbackOutput> {
    const providerEnum: OAuthProviderValue = profile.provider === "google" ? "GOOGLE" : "MICROSOFT"
    const providerLabel = profile.provider === "google" ? "Google" : "Microsoft"
    const nameFallback = splitName(profile.fullName, providerLabel)

    const linkedAccount = await this.oauthAccountRepo.findByProviderAccount(providerEnum, profile.providerAccountId)
    let record
    let isNewUser = false

    if (linkedAccount) {
      record = await this.userRepo.findById(linkedAccount.userId)
      if (!record) {
        throw Object.assign(new Error("Conta OAuth referencia usuário inexistente"), {
          status: 500,
          code: "OAUTH_ACCOUNT_ORPHAN",
        })
      }
      record = await this.userRepo.update(record.id, {
        isEmailConfirmed: true,
        lastLogin: new Date(),
        ...(profile.picture ? { profilePhoto: profile.picture } : {}),
      })
    } else {
      const existingByEmail = await this.userRepo.findByEmail(profile.email)
      if (existingByEmail) {
        // Email já existe sem este provider linkado — agora vincula
        record = await this.userRepo.update(existingByEmail.id, {
          isEmailConfirmed: true,
          lastLogin: new Date(),
          ...(profile.picture ? { profilePhoto: profile.picture } : {}),
        })
        await this.oauthAccountRepo.create({
          userId: record.id,
          provider: providerEnum,
          providerAccountId: profile.providerAccountId,
        })
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
        await this.oauthAccountRepo.create({
          userId: record.id,
          provider: providerEnum,
          providerAccountId: profile.providerAccountId,
        })
        isNewUser = true
      }
    }

    const accessResult = issueAccessToken({ id: record.id, email: record.email })
    const refreshResult = issueRefreshToken({ id: record.id, email: record.email })

    await this.sessionRepo.create({
      userId: record.id,
      tokenHash: sha256Hex(refreshResult.token),
      expiresAt: new Date(Date.now() + refreshResult.expiresInSeconds * 1000),
      userAgent: context.userAgent ?? null,
      ipAddress: context.ipAddress ?? null,
    })

    return {
      user: toAuthUserView(record),
      accessToken: accessResult.token,
      refreshToken: refreshResult.token,
      expiresIn: accessResult.expiresInSeconds,
      isNewUser,
    }
  }
}
