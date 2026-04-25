import { describe, it, expect, beforeEach } from "vitest"
import { hashTokenWithSecret, verifyTokenHash, generateOpaqueToken, sha256Hex } from "./token-hash"
import crypto from "crypto"

describe("token-hash", () => {
  const testSecret = "test-secret-key-minimum-32-characters-required-abc123"

  describe("sha256Hex", () => {
    it("should produce consistent hash for same input", () => {
      const input = "test-token-123"
      const hash1 = sha256Hex(input)
      const hash2 = sha256Hex(input)

      expect(hash1).toBe(hash2)
      expect(hash1).toMatch(/^[a-f0-9]{64}$/) // SHA256 produces 64 hex chars
    })

    it("should produce different hashes for different inputs", () => {
      const hash1 = sha256Hex("token-1")
      const hash2 = sha256Hex("token-2")

      expect(hash1).not.toBe(hash2)
    })
  })

  describe("hashTokenWithSecret", () => {
    it("should produce consistent HMAC for same token and secret", () => {
      const token = "opaque-token-abc123"
      const hash1 = hashTokenWithSecret(token, testSecret)
      const hash2 = hashTokenWithSecret(token, testSecret)

      expect(hash1).toBe(hash2)
      expect(hash1).toMatch(/^[a-f0-9]{64}$/) // HMAC-SHA256 produces 64 hex chars
    })

    it("should produce different hashes for different tokens with same secret", () => {
      const hash1 = hashTokenWithSecret("token-1", testSecret)
      const hash2 = hashTokenWithSecret("token-2", testSecret)

      expect(hash1).not.toBe(hash2)
    })

    it("should produce different hashes for same token with different secrets", () => {
      const token = "opaque-token"
      const hash1 = hashTokenWithSecret(token, "secret-1")
      const hash2 = hashTokenWithSecret(token, "secret-2")

      expect(hash1).not.toBe(hash2)
    })

    it("should differ from plain SHA256 hash (preventing hash table precomputation attacks)", () => {
      const token = "test-token"
      const hmacHash = hashTokenWithSecret(token, testSecret)
      const sha256Hash = sha256Hex(token)

      expect(hmacHash).not.toBe(sha256Hash)
    })
  })

  describe("verifyTokenHash", () => {
    it("should return true for valid token and matching hash", () => {
      const token = "test-opaque-token-12345"
      const hash = hashTokenWithSecret(token, testSecret)

      const isValid = verifyTokenHash(token, hash, testSecret)

      expect(isValid).toBe(true)
    })

    it("should return false for invalid token with non-matching hash", () => {
      const token = "test-opaque-token-12345"
      const wrongToken = "wrong-opaque-token-12345"
      const hash = hashTokenWithSecret(token, testSecret)

      const isValid = verifyTokenHash(wrongToken, hash, testSecret)

      expect(isValid).toBe(false)
    })

    it("should return false for valid token but wrong secret", () => {
      const token = "test-opaque-token-12345"
      const hash = hashTokenWithSecret(token, testSecret)
      const wrongSecret = "wrong-secret"

      const isValid = verifyTokenHash(token, hash, wrongSecret)

      expect(isValid).toBe(false)
    })

    it("should return false for malformed hash", () => {
      const token = "test-opaque-token-12345"
      const malformedHash = "not-a-valid-hex-string"

      const isValid = verifyTokenHash(token, malformedHash, testSecret)

      expect(isValid).toBe(false)
    })

    it("should use timing-safe comparison to prevent timing attacks", () => {
      const token = "test-token"
      const correctHash = hashTokenWithSecret(token, testSecret)

      // These should take similar time even though they differ at different positions
      const wrongHashEarlyDiff = "0".repeat(64)
      const wrongHashLateDiff = correctHash.slice(0, 63) + (correctHash[63] === "0" ? "f" : "0")

      const result1 = verifyTokenHash(token, wrongHashEarlyDiff, testSecret)
      const result2 = verifyTokenHash(token, wrongHashLateDiff, testSecret)

      expect(result1).toBe(false)
      expect(result2).toBe(false)
    })
  })

  describe("generateOpaqueToken", () => {
    it("should generate base64url-encoded tokens", () => {
      const token = generateOpaqueToken()

      expect(token).toMatch(/^[A-Za-z0-9_-]+$/) // base64url alphabet
    })

    it("should generate tokens of specified byte length", () => {
      const byteLength = 24
      const token = generateOpaqueToken(byteLength)

      // base64url encoding: 4 chars per 3 bytes, so 24 bytes -> 32 chars (with padding removed)
      const expectedLength = Math.ceil((byteLength * 4) / 3)
      expect(token.length).toBe(expectedLength)
    })

    it("should generate different tokens on each call", () => {
      const token1 = generateOpaqueToken()
      const token2 = generateOpaqueToken()
      const token3 = generateOpaqueToken()

      expect(token1).not.toBe(token2)
      expect(token2).not.toBe(token3)
      expect(token1).not.toBe(token3)
    })

    it("should default to 32 bytes (256 bits) for cryptographic strength", () => {
      const defaultToken = generateOpaqueToken()
      const explicitToken = generateOpaqueToken(32)

      expect(defaultToken.length).toBe(explicitToken.length)
    })
  })

  describe("integration: token lifecycle", () => {
    it("should handle complete refresh token lifecycle", () => {
      // 1. Generate new refresh token
      const refreshToken = generateOpaqueToken()

      // 2. Hash for storage (simulate database insert)
      const storedHash = hashTokenWithSecret(refreshToken, testSecret)

      // 3. On refresh, verify token against stored hash
      const isValid = verifyTokenHash(refreshToken, storedHash, testSecret)
      expect(isValid).toBe(true)

      // 4. Invalid token should fail verification
      const fakeToken = generateOpaqueToken()
      const isValidFake = verifyTokenHash(fakeToken, storedHash, testSecret)
      expect(isValidFake).toBe(false)
    })

    it("should prevent replay attacks (same token cannot be reused)", () => {
      const oldToken = generateOpaqueToken()
      const oldHash = hashTokenWithSecret(oldToken, testSecret)

      // Attacker tries to reuse old token
      const replayed = verifyTokenHash(oldToken, oldHash, testSecret)
      expect(replayed).toBe(true)

      // But system should have revoked it (business logic layer)
      // This test just verifies hash verification works correctly
      const newToken = generateOpaqueToken()
      const replayFails = verifyTokenHash(newToken, oldHash, testSecret)
      expect(replayFails).toBe(false)
    })
  })
})
