import { randomUUID } from "crypto"
import { NextRequest } from "next/server"
import { fail, ok } from "../../../../../../lib/server/http/api-response"
import { userRepository } from "../../../../../../lib/server/repositories"
import { setAuthCookies } from "../../../../../../lib/server/security/auth-cookies"
import { exchangeGoogleCodeForProfile, resolveGoogleOAuthConfig } from "../../../../../../lib/server/services/google-oauth-service"

export const runtime = "nodejs"

function splitName(fullName?: string): { firstName: string; lastName: string } {
  if (!fullName) {
    return {
      firstName: "Usuario",
      lastName: "Google",
    }
  }

  const parts = fullName.trim().split(/\s+/)
  if (parts.length === 1) {
    return {
      firstName: parts[0] || "Usuario",
      lastName: "Google",
    }
  }

  return {
    firstName: parts[0] || "Usuario",
    lastName: parts.slice(1).join(" ") || "Google",
  }
}

export async function GET(request: NextRequest) {
  const config = resolveGoogleOAuthConfig(request)

  if (!config) {
    return fail(503, "GOOGLE_OAUTH_NOT_CONFIGURED", "Google OAuth nao configurado")
  }

  const code = request.nextUrl.searchParams.get("code")
  const state = request.nextUrl.searchParams.get("state")
  const expectedState = request.cookies.get("mmx_oauth_state")?.value

  if (!code) {
    return fail(400, "OAUTH_CODE_MISSING", "Codigo de autorizacao ausente")
  }

  if (!state || !expectedState || state !== expectedState) {
    return fail(401, "OAUTH_STATE_INVALID", "Estado OAuth invalido")
  }

  try {
    const profile = await exchangeGoogleCodeForProfile({ code, config })

    if (!profile.emailVerified) {
      return fail(403, "GOOGLE_EMAIL_NOT_VERIFIED", "Email do Google nao verificado")
    }

    const existingUser = await userRepository.findByEmail(profile.email)
    const accessToken = `at_${randomUUID()}`
    const refreshToken = `rt_${randomUUID()}`

    if (existingUser) {
      const updatedUser = await userRepository.update(existingUser.id, {
        isEmailConfirmed: true,
        lastLogin: new Date(),
        profilePhoto: profile.picture || existingUser.profilePhoto,
      })

      const response = ok({
        accessToken,
        refreshToken,
        expiresIn: 1800,
        isNewUser: false,
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          planType: updatedUser.planType,
        },
      })

      response.cookies.delete("mmx_oauth_state")
      return setAuthCookies(response, accessToken, refreshToken)
    }

    const nameFromProfile = splitName(profile.fullName)
    const createdUser = await userRepository.create({
      email: profile.email,
      passwordHash: null,
      firstName: profile.givenName || nameFromProfile.firstName,
      lastName: profile.familyName || nameFromProfile.lastName,
      isEmailConfirmed: true,
      profilePhoto: profile.picture,
      planType: "FREE",
      lastLogin: new Date(),
    })

    const response = ok({
      accessToken,
      refreshToken,
      expiresIn: 1800,
      isNewUser: true,
      user: {
        id: createdUser.id,
        email: createdUser.email,
        firstName: createdUser.firstName,
        lastName: createdUser.lastName,
        planType: createdUser.planType,
      },
    })

    response.cookies.delete("mmx_oauth_state")
    return setAuthCookies(response, accessToken, refreshToken)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro no callback OAuth Google"
    return fail(400, "GOOGLE_OAUTH_CALLBACK_ERROR", message)
  }
}
