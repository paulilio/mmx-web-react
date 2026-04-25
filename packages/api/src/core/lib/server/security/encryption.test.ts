import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { randomBytes } from "node:crypto"
import { decrypt, encrypt } from "./encryption"

const ORIGINAL_KEY = process.env.MMX_ENCRYPTION_KEY

function setKey(): void {
  process.env.MMX_ENCRYPTION_KEY = randomBytes(32).toString("base64")
}

describe("encryption", () => {
  beforeEach(() => {
    setKey()
  })

  afterEach(() => {
    if (ORIGINAL_KEY === undefined) delete process.env.MMX_ENCRYPTION_KEY
    else process.env.MMX_ENCRYPTION_KEY = ORIGINAL_KEY
  })

  it("round-trip recupera o plaintext original", () => {
    const original = "link-id-secreto-12345"
    const ciphertext = encrypt(original)
    expect(ciphertext).not.toBe(original)
    expect(decrypt(ciphertext)).toBe(original)
  })

  it("gera ciphertext diferente em cada chamada por causa do IV aleatório", () => {
    const a = encrypt("mesmo-input")
    const b = encrypt("mesmo-input")
    expect(a).not.toBe(b)
    expect(decrypt(a)).toBe(decrypt(b))
  })

  it("falha quando o ciphertext é adulterado", () => {
    const ciphertext = encrypt("dados-importantes")
    const parts = ciphertext.split(":")
    const dataBuf = Buffer.from(parts[2], "hex")
    dataBuf[dataBuf.length - 1] = dataBuf[dataBuf.length - 1] ^ 0xff
    const tampered = `${parts[0]}:${parts[1]}:${dataBuf.toString("hex")}`
    expect(() => decrypt(tampered)).toThrow()
  })

  it("falha quando MMX_ENCRYPTION_KEY está ausente", () => {
    delete process.env.MMX_ENCRYPTION_KEY
    expect(() => encrypt("x")).toThrow(/MMX_ENCRYPTION_KEY missing/)
  })

  it("falha quando MMX_ENCRYPTION_KEY tem tamanho errado", () => {
    process.env.MMX_ENCRYPTION_KEY = Buffer.alloc(16).toString("base64")
    expect(() => encrypt("x")).toThrow(/32 bytes/)
  })

  it("falha quando payload está malformado", () => {
    expect(() => decrypt("only-one-part")).toThrow(/malformed/)
    expect(() => decrypt("aa:bb")).toThrow(/malformed/)
  })

  it("falha quando IV ou tag têm tamanho inválido", () => {
    expect(() => decrypt("ff:00:00")).toThrow(/iv invalid/)
    const validIv = "00".repeat(12)
    expect(() => decrypt(`${validIv}:00:00`)).toThrow(/tag invalid/)
  })
})
