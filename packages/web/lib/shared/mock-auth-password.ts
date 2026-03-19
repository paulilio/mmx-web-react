const HASH_PREFIX = "sha256$"
const HASH_SALT = "mmx-mock-auth-v1:"

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
}

function fallbackHash(input: string): string {
  let hash = 2166136261
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }

  return (hash >>> 0).toString(16)
}

async function digestSha256(input: string): Promise<string> {
  if (typeof globalThis.crypto !== "undefined" && globalThis.crypto.subtle) {
    const encoded = new TextEncoder().encode(input)
    const digest = await globalThis.crypto.subtle.digest("SHA-256", encoded)
    return bytesToHex(new Uint8Array(digest))
  }

  return fallbackHash(input)
}

export function isHashedMockPassword(password: string | null | undefined): boolean {
  return typeof password === "string" && password.startsWith(HASH_PREFIX)
}

export async function hashMockPassword(password: string): Promise<string> {
  const digest = await digestSha256(`${HASH_SALT}${password}`)
  return `${HASH_PREFIX}${digest}`
}

export async function verifyMockPassword(storedPassword: string, plainPassword: string): Promise<boolean> {
  if (!storedPassword) {
    return false
  }

  if (isHashedMockPassword(storedPassword)) {
    const expected = await hashMockPassword(plainPassword)
    return storedPassword === expected
  }

  // Legacy fallback for existing mock users stored with plaintext password.
  return storedPassword === plainPassword
}
