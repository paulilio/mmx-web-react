import { createHmac, timingSafeEqual } from "node:crypto"

/**
 * Verifies an HMAC SHA-256 signature provided as hex.
 * Returns true if the signature matches.
 */
export function verifyHmacSha256(rawBody: string, signatureHex: string, secret: string): boolean {
  if (!secret) return false
  if (!signatureHex || typeof signatureHex !== "string") return false
  const expected = createHmac("sha256", secret).update(rawBody, "utf8").digest()
  let provided: Uint8Array
  try {
    provided = new Uint8Array(Buffer.from(signatureHex, "hex"))
  } catch {
    return false
  }
  if (provided.length !== expected.length) return false
  return timingSafeEqual(new Uint8Array(expected.buffer, expected.byteOffset, expected.byteLength), provided)
}

export function signHmacSha256(rawBody: string, secret: string): string {
  return createHmac("sha256", secret).update(rawBody, "utf8").digest("hex")
}
