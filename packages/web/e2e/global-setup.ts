import { execFileSync } from "node:child_process"
import { mkdirSync, writeFileSync } from "node:fs"
import path from "node:path"

const REPO_ROOT = path.resolve(__dirname, "..", "..", "..")
const SCRIPT = path.join(REPO_ROOT, "scripts", "e2e-token.mjs")
const STORAGE_PATH = path.resolve(__dirname, "..", ".playwright", "auth.json")
const COOKIE_DOMAIN = process.env.E2E_COOKIE_DOMAIN ?? ".moedamix.com.br"

interface MintResult {
  token: string
  expiresAt: string | null
  source: string
}

function mint(): MintResult {
  const stdout = execFileSync("node", [SCRIPT, "--json"], {
    cwd: REPO_ROOT,
    env: process.env,
    stdio: ["ignore", "pipe", "inherit"],
  })
  const text = stdout.toString().trim()
  if (!text) throw new Error("e2e-token.mjs retornou vazio")
  try {
    return JSON.parse(text) as MintResult
  } catch (error) {
    throw new Error(`Resposta inválida do e2e-token.mjs: ${text}`)
  }
}

export default async function globalSetup() {
  const skip = (process.env.E2E_SKIP_AUTH ?? "").toLowerCase() === "true"
  if (skip) {
    mkdirSync(path.dirname(STORAGE_PATH), { recursive: true })
    writeFileSync(STORAGE_PATH, JSON.stringify({ cookies: [], origins: [] }, null, 2))
    return
  }

  const { token, expiresAt, source } = mint()
  console.log(`[global-setup] e2e token (${source}) válido até ${expiresAt ?? "?"}`)

  const expiresUnix = expiresAt ? Math.floor(new Date(expiresAt).getTime() / 1000) : -1

  const state = {
    cookies: [
      {
        name: "mmx_access_token",
        value: token,
        domain: COOKIE_DOMAIN,
        path: "/",
        expires: expiresUnix,
        httpOnly: true,
        secure: true,
        sameSite: "None" as const,
      },
    ],
    origins: [],
  }

  mkdirSync(path.dirname(STORAGE_PATH), { recursive: true })
  writeFileSync(STORAGE_PATH, JSON.stringify(state, null, 2))
}
