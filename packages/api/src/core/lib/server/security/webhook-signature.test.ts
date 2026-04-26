import { describe, expect, it } from "vitest"
import { signHmacSha256, verifyHmacSha256 } from "./webhook-signature"

const SECRET = "super-secret-belvo-key"

describe("webhook-signature", () => {
  it("verifies a signature produced by signHmacSha256", () => {
    const body = JSON.stringify({ event: "link.expired", link: "abc" })
    const sig = signHmacSha256(body, SECRET)
    expect(verifyHmacSha256(body, sig, SECRET)).toBe(true)
  })

  it("rejects signature when body changes", () => {
    const body = JSON.stringify({ event: "link.expired" })
    const sig = signHmacSha256(body, SECRET)
    expect(verifyHmacSha256(JSON.stringify({ event: "link.created" }), sig, SECRET)).toBe(false)
  })

  it("rejects signature when secret differs", () => {
    const body = "ping"
    const sig = signHmacSha256(body, SECRET)
    expect(verifyHmacSha256(body, sig, "outro-secret")).toBe(false)
  })

  it("rejects empty signature", () => {
    expect(verifyHmacSha256("body", "", SECRET)).toBe(false)
  })

  it("rejects when secret is empty", () => {
    expect(verifyHmacSha256("body", "deadbeef", "")).toBe(false)
  })

  it("rejects signature of wrong length", () => {
    expect(verifyHmacSha256("body", "ab", SECRET)).toBe(false)
  })

  it("rejects malformed hex signature", () => {
    expect(verifyHmacSha256("body", "not-hex-zzzz", SECRET)).toBe(false)
  })
})
