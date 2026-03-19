import { LoggerService } from "@nestjs/common"
import * as fs from "node:fs"
import * as path from "node:path"

type LogLevel = "debug" | "info" | "warn" | "error"

const REDACT_KEYS = ["password", "token", "authorization", "cookie", "set-cookie", "secret"]

function dailyStamp(date = new Date()) {
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, "0")
  const dd = String(date.getDate()).padStart(2, "0")
  return `${yyyy}-${mm}-${dd}`
}

function resolveProjectRoot() {
  const cwd = process.cwd()
  const candidates = [cwd, path.resolve(cwd, ".."), path.resolve(cwd, "..", "..")]

  for (const candidate of candidates) {
    if (fs.existsSync(path.join(candidate, "AGENTS.md"))) {
      return candidate
    }
  }

  return cwd
}

function redact(value: unknown): unknown {
  if (!value || typeof value !== "object") {
    return value
  }

  if (Array.isArray(value)) {
    return value.map((item) => redact(item))
  }

  const redacted: Record<string, unknown> = {}
  for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
    if (REDACT_KEYS.some((blocked) => key.toLowerCase().includes(blocked))) {
      redacted[key] = "[REDACTED]"
      continue
    }

    redacted[key] = redact(item)
  }

  return redacted
}

function normalizeMessage(message: unknown) {
  if (typeof message === "string") {
    return message
  }

  try {
    return JSON.stringify(message)
  } catch {
    return String(message)
  }
}

export class RuntimeFileLoggerService implements LoggerService {
  private readonly projectRoot = resolveProjectRoot()
  private readonly env = process.env.MMX_APP_ENV || process.env.NODE_ENV || "development"

  private write(level: LogLevel, message: unknown, context?: string, extra?: Record<string, unknown>) {
    const category = level === "error" ? "error" : level === "debug" ? "debug" : "app"
    const dirPath = path.join(this.projectRoot, "runtime", "api", category, this.env)
    const filePath = path.join(dirPath, `api-${dailyStamp()}.log`)

    const event = {
      timestamp: new Date().toISOString(),
      service: "api",
      env: this.env,
      category,
      level,
      context,
      message: normalizeMessage(message),
      metadata: redact(extra || {}),
    }

    try {
      fs.mkdirSync(dirPath, { recursive: true })
      fs.appendFileSync(filePath, `${JSON.stringify(event)}\n`, "utf8")
    } catch {
      // Intencional: log em arquivo nao pode quebrar a API
    }

    const line = context ? `[${context}] ${event.message}` : event.message
    if (level === "error") {
      console.error(line)
      return
    }

    if (level === "warn") {
      console.warn(line)
      return
    }

    if (level === "debug") {
      console.debug(line)
      return
    }

    console.log(line)
  }

  log(message: unknown, context?: string) {
    this.write("info", message, context)
  }

  error(message: unknown, trace?: string, context?: string) {
    this.write("error", message, context, trace ? { trace } : undefined)
  }

  warn(message: unknown, context?: string) {
    this.write("warn", message, context)
  }

  debug(message: unknown, context?: string) {
    this.write("debug", message, context)
  }

  verbose(message: unknown, context?: string) {
    this.write("debug", message, context)
  }
}
