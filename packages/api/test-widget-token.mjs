#!/usr/bin/env node
import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, resolve } from "node:path"

const __dirname = dirname(fileURLToPath(import.meta.url))
const envPath = resolve(__dirname, "../../.env")
const raw = readFileSync(envPath, "utf8")
for (const line of raw.split(/\r?\n/)) {
  const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/)
  if (m) process.env[m[1]] = m[2]
}

const SECRET_ID = process.env.BELVO_SECRET_ID
const SECRET_PASSWORD = process.env.BELVO_SECRET_PASSWORD
const ENV = process.env.BELVO_ENV ?? "sandbox"
const HOST = ENV === "production" ? "https://api.belvo.com" : "https://sandbox.belvo.com"

if (!SECRET_ID || !SECRET_PASSWORD) {
  console.error("BELVO_SECRET_ID / BELVO_SECRET_PASSWORD ausentes no .env")
  process.exit(1)
}

const CPF = "66648718153"
const FULL_NAME = "Paulílio Castello Branco"

const auth = "Basic " + Buffer.from(`${SECRET_ID}:${SECRET_PASSWORD}`).toString("base64")

const body = {
  id: SECRET_ID,
  password: SECRET_PASSWORD,
  scopes: "read_institutions,write_links,read_links",
  widget: {
    consent: {
      identification_info: [
        { type: "CPF", number: CPF, name: FULL_NAME },
      ],
    },
  },
}

console.log(`POST ${HOST}/api/token/`)
console.log("body:", JSON.stringify(body, null, 2).replace(SECRET_PASSWORD, "<REDACTED>").replace(SECRET_ID, "<REDACTED>"))

const res = await fetch(`${HOST}/api/token/`, {
  method: "POST",
  headers: { "Content-Type": "application/json", Authorization: auth },
  body: JSON.stringify(body),
})

const requestId = res.headers.get("x-request-id")
const text = await res.text()
let parsed
try { parsed = JSON.parse(text) } catch { parsed = text }

console.log(`\nstatus: ${res.status}  request_id: ${requestId ?? "(none)"}`)
console.log("response:", typeof parsed === "string" ? parsed : JSON.stringify(parsed, null, 2))

if (res.ok && parsed?.access) {
  const widgetUrl = `https://widget.belvo.io/?access_token=${parsed.access}`
  console.log("\n=========== WIDGET URL (cole no browser) ===========")
  console.log(widgetUrl)
  console.log("====================================================")
}
