import { Injectable, Inject } from "@nestjs/common"
import { USER_REPOSITORY, type IUserRepository } from "../ports/user-repository.port"

const ALLOWED_PREFERENCE_KEYS = new Set([
  "hasSeenWelcome",
  "theme",
  "language",
  "notifications",
  "layout",
])

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function pickAllowed(input: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(input)) {
    if (ALLOWED_PREFERENCE_KEYS.has(key)) {
      result[key] = value
    }
  }
  return result
}

@Injectable()
export class UpdatePreferencesUseCase {
  constructor(@Inject(USER_REPOSITORY) private readonly userRepo: IUserRepository) {}

  async execute(
    userId: string,
    patch: unknown,
  ): Promise<{ preferences: Record<string, unknown> }> {
    if (!isRecord(patch)) {
      throw Object.assign(new Error("Preferências inválidas"), { status: 400, code: "INVALID_PREFERENCES" })
    }

    const allowed = pickAllowed(patch)
    if (Object.keys(allowed).length === 0) {
      throw Object.assign(new Error("Nenhuma preferência válida informada"), {
        status: 400,
        code: "INVALID_PREFERENCES",
      })
    }

    const user = await this.userRepo.findById(userId)
    if (!user) {
      throw Object.assign(new Error("Usuário não encontrado"), { status: 404, code: "USER_NOT_FOUND" })
    }

    const current = isRecord(user.preferences) ? user.preferences : {}
    const merged = { ...current, ...allowed }

    const updated = await this.userRepo.update(userId, { preferences: merged })

    const next = isRecord(updated.preferences) ? updated.preferences : {}
    return { preferences: next }
  }
}
