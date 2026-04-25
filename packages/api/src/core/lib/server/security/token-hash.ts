import crypto from "crypto"

export function sha256Hex(value: string): string {
  return crypto.createHash("sha256").update(value, "utf8").digest("hex")
}

export function hashTokenWithSecret(token: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(token).digest("hex")
}

export function verifyTokenHash(token: string, hash: string, secret: string): boolean {
  const computedHash = hashTokenWithSecret(token, secret)
  try {
    return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(computedHash))
  } catch {
    return false
  }
}

export function generateOpaqueToken(byteLength = 32): string {
  return crypto.randomBytes(byteLength).toString("base64url")
}
