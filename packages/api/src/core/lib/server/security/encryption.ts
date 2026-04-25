import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto"

const KEY_BYTES = 32
const IV_BYTES = 12
const TAG_BYTES = 16

function getKey(): Uint8Array {
  const raw = process.env.MMX_ENCRYPTION_KEY
  if (!raw) throw new Error("MMX_ENCRYPTION_KEY missing")
  const buf = Buffer.from(raw, "base64")
  if (buf.length !== KEY_BYTES) {
    throw new Error(`MMX_ENCRYPTION_KEY must decode to ${KEY_BYTES} bytes (got ${buf.length})`)
  }
  return new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength)
}

function toUint8Array(buf: Buffer, start: number, end?: number): Uint8Array {
  return new Uint8Array(buf.buffer, buf.byteOffset + start, (end ?? buf.length) - start)
}

export function encrypt(plaintext: string): string {
  const ivRaw = randomBytes(IV_BYTES)
  const iv = new Uint8Array(ivRaw.buffer, ivRaw.byteOffset, ivRaw.byteLength)
  const cipher = createCipheriv("aes-256-gcm", getKey(), iv)
  const head = cipher.update(plaintext, "utf8")
  const tail = cipher.final()
  const tag = cipher.getAuthTag()
  const ivHex = Buffer.from(iv).toString("hex")
  const tagHex = tag.toString("hex")
  const dataHex = Buffer.concat([new Uint8Array(head), new Uint8Array(tail)]).toString("hex")
  return `${ivHex}:${tagHex}:${dataHex}`
}

export function decrypt(payload: string): string {
  const parts = payload.split(":")
  if (parts.length !== 3) throw new Error("encrypted payload malformed")
  const [ivHex, tagHex, dataHex] = parts
  const ivBuf = Buffer.from(ivHex, "hex")
  const tagBuf = Buffer.from(tagHex, "hex")
  const ctBuf = Buffer.from(dataHex, "hex")
  if (ivBuf.length !== IV_BYTES) throw new Error("encrypted payload iv invalid")
  if (tagBuf.length !== TAG_BYTES) throw new Error("encrypted payload tag invalid")
  const iv = toUint8Array(ivBuf, 0)
  const tag = toUint8Array(tagBuf, 0)
  const ciphertext = toUint8Array(ctBuf, 0)
  const decipher = createDecipheriv("aes-256-gcm", getKey(), iv)
  decipher.setAuthTag(tag)
  const head = decipher.update(ciphertext)
  const tail = decipher.final()
  return head.toString("utf8") + tail.toString("utf8")
}
