#!/usr/bin/env node
/**
 * Gera JWT de acesso (HS256) para o usuário de teste E2E.
 *
 * Uso:
 *   node scripts/e2e-token.mjs           # imprime token no stdout
 *   node scripts/e2e-token.mjs --json    # imprime { token, expiresAt }
 *
 * Variáveis de ambiente obrigatórias:
 *   JWT_ACCESS_SECRET          mesmo secret do backend (config/auth.config.ts)
 *   MMX_E2E_TEST_USER_ID       cuid do user criado para testes
 *   MMX_E2E_TEST_USER_EMAIL    email do user (deve bater com o cadastro)
 *
 * Variáveis opcionais:
 *   MMX_E2E_TOKEN_TTL          duração em segundos. Default: 3600 (1h)
 *
 * Override:
 *   MMX_E2E_TOKEN              se setada e não vazia, é retornada sem mintar
 *
 * Sem dependências externas — usa apenas Node crypto + Buffer.
 */

import crypto from "node:crypto"

function fail(message) {
  console.error(`[e2e-token] ${message}`)
  process.exit(1)
}

function base64url(input) {
  return Buffer.from(input).toString("base64").replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_")
}

function decodeJwt(token) {
  const parts = token.split(".")
  if (parts.length !== 3) return null
  try {
    const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/")
    const decoded = JSON.parse(Buffer.from(payload, "base64").toString("utf8"))
    return typeof decoded === "object" && decoded !== null ? decoded : null
  } catch {
    return null
  }
}

function signHS256({ payload, secret }) {
  const header = base64url(JSON.stringify({ alg: "HS256", typ: "JWT" }))
  const body = base64url(JSON.stringify(payload))
  const signingInput = `${header}.${body}`
  const signature = crypto
    .createHmac("sha256", secret)
    .update(signingInput)
    .digest("base64")
    .replace(/=+$/, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
  return `${signingInput}.${signature}`
}

const overrideToken = (process.env.MMX_E2E_TOKEN ?? "").trim()
if (overrideToken.length > 0) {
  if (process.argv.includes("--json")) {
    const decoded = decodeJwt(overrideToken)
    const expiresAt =
      decoded && typeof decoded.exp === "number" ? new Date(decoded.exp * 1000).toISOString() : null
    process.stdout.write(JSON.stringify({ token: overrideToken, expiresAt, source: "MMX_E2E_TOKEN" }))
  } else {
    process.stdout.write(overrideToken)
  }
  process.exit(0)
}

const secret = (process.env.JWT_ACCESS_SECRET ?? "").trim()
const userId = (process.env.MMX_E2E_TEST_USER_ID ?? "").trim()
const email = (process.env.MMX_E2E_TEST_USER_EMAIL ?? "").trim()
const ttlRaw = (process.env.MMX_E2E_TOKEN_TTL ?? "3600").trim()
const ttlSeconds = Number.parseInt(ttlRaw, 10)

if (!secret) fail("JWT_ACCESS_SECRET ausente. Configure no shell ou em GitHub Actions secrets.")
if (!userId) fail("MMX_E2E_TEST_USER_ID ausente. Crie um user de teste via OAuth e exporte o cuid dele.")
if (!email) fail("MMX_E2E_TEST_USER_EMAIL ausente.")
if (!Number.isFinite(ttlSeconds) || ttlSeconds <= 0) fail("MMX_E2E_TOKEN_TTL inválido (esperado segundos > 0).")

const now = Math.floor(Date.now() / 1000)
const exp = now + ttlSeconds
const token = signHS256({
  payload: { sub: userId, email, iat: now, exp },
  secret,
})

if (process.argv.includes("--json")) {
  process.stdout.write(JSON.stringify({ token, expiresAt: new Date(exp * 1000).toISOString(), source: "minted" }))
} else {
  process.stdout.write(token)
}
