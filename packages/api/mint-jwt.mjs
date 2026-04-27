#!/usr/bin/env node
import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, resolve } from "node:path"
import jwt from "jsonwebtoken"

const __dirname = dirname(fileURLToPath(import.meta.url))
const envPath = resolve(__dirname, "../../.env")
const raw = readFileSync(envPath, "utf8")
for (const line of raw.split(/\r?\n/)) {
  const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/)
  if (m) process.env[m[1]] = m[2]
}

const userId = process.argv[2]
const email = process.argv[3]
if (!userId || !email) {
  console.error("Usage: node mint-jwt.mjs <userId> <email>")
  process.exit(1)
}

const secret = process.env.JWT_ACCESS_SECRET
if (!secret) {
  console.error("JWT_ACCESS_SECRET missing")
  process.exit(1)
}

const token = jwt.sign({ sub: userId, email }, secret, { expiresIn: "30m" })
console.log(token)
