import type { GoogleOAuthProfile } from "./google-oauth-service"
import type { MicrosoftOAuthProfile } from "./microsoft-oauth-service"
import type { UserRecord, UserRepository } from "../repositories/user-repository"

type OAuthUserResult = {
  user: UserRecord
  isNewUser: boolean
}

function splitName(fullName: string | undefined, providerName: string): { firstName: string; lastName: string } {
  if (!fullName) {
    return {
      firstName: "Usuario",
      lastName: providerName,
    }
  }

  const parts = fullName.trim().split(/\s+/)
  if (parts.length === 1) {
    return {
      firstName: parts[0] || "Usuario",
      lastName: providerName,
    }
  }

  return {
    firstName: parts[0] || "Usuario",
    lastName: parts.slice(1).join(" ") || providerName,
  }
}

export class OAuthAuthService {
  constructor(private readonly userRepository: UserRepository) {}

  async loginWithGoogleProfile(profile: GoogleOAuthProfile): Promise<OAuthUserResult> {
    const existingUser = await this.userRepository.findByEmail(profile.email)

    if (existingUser) {
      const user = await this.userRepository.update(existingUser.id, {
        isEmailConfirmed: true,
        lastLogin: new Date(),
        profilePhoto: profile.picture || existingUser.profilePhoto,
      })

      return {
        user,
        isNewUser: false,
      }
    }

    const nameFromProfile = splitName(profile.fullName, "Google")
    const user = await this.userRepository.create({
      email: profile.email,
      passwordHash: null,
      firstName: profile.givenName || nameFromProfile.firstName,
      lastName: profile.familyName || nameFromProfile.lastName,
      isEmailConfirmed: true,
      profilePhoto: profile.picture,
      planType: "FREE",
      lastLogin: new Date(),
    })

    return {
      user,
      isNewUser: true,
    }
  }

  async loginWithMicrosoftProfile(profile: MicrosoftOAuthProfile): Promise<OAuthUserResult> {
    const existingUser = await this.userRepository.findByEmail(profile.email)

    if (existingUser) {
      const user = await this.userRepository.update(existingUser.id, {
        isEmailConfirmed: true,
        lastLogin: new Date(),
      })

      return {
        user,
        isNewUser: false,
      }
    }

    const nameFromProfile = splitName(profile.fullName, "Microsoft")
    const user = await this.userRepository.create({
      email: profile.email,
      passwordHash: null,
      firstName: profile.givenName || nameFromProfile.firstName,
      lastName: profile.familyName || nameFromProfile.lastName,
      isEmailConfirmed: true,
      planType: "FREE",
      lastLogin: new Date(),
    })

    return {
      user,
      isNewUser: true,
    }
  }
}