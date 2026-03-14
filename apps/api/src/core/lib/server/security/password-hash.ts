import { compare, hash } from "bcryptjs"

const DEFAULT_SALT_ROUNDS = 12

export async function hashPassword(plainPassword: string): Promise<string> {
  return hash(plainPassword, DEFAULT_SALT_ROUNDS)
}

export async function verifyPassword(plainPassword: string, passwordHash: string): Promise<boolean> {
  if (!passwordHash) {
    return false
  }

  return compare(plainPassword, passwordHash)
}
