import { createHash, randomBytes } from "crypto"

export function sha256Hex(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex")
}

export function generateOpaqueToken(byteLength = 32): string {
  return randomBytes(byteLength).toString("base64url")
}
