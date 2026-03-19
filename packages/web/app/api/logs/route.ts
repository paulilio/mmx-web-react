import { NextResponse } from "next/server"
import { appendFile, mkdir } from "node:fs/promises"
import path from "node:path"

export const runtime = "nodejs"

type LogLevel = "debug" | "info" | "warn" | "error"

const REDACT_KEYS = ["password", "token", "authorization", "cookie", "set-cookie", "secret"]

function dailyStamp(date = new Date()) {
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, "0")
  const dd = String(date.getDate()).padStart(2, "0")
  return `${yyyy}-${mm}-${dd}`
}

function sanitizeLevel(value: unknown): LogLevel {
  if (value === "debug" || value === "info" || value === "warn" || value === "error") {
    return value
  }

  return "info"
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

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      level?: unknown
      message?: unknown
      context?: unknown
      data?: unknown
    }

    const level = sanitizeLevel(body.level)
    const message = typeof body.message === "string" ? body.message : "log"
    const context = typeof body.context === "string" ? body.context : undefined
    const data = redact(body.data)

    const env = process.env.MMX_APP_ENV || process.env.NODE_ENV || "development"
    const category = level === "error" ? "error" : level === "debug" ? "debug" : "app"
    const dirPath = path.join(process.cwd(), "runtime", "front", category, env)
    const filePath = path.join(dirPath, `front-${dailyStamp()}.log`)

    await mkdir(dirPath, { recursive: true })
    await appendFile(
      filePath,
      `${JSON.stringify({
        timestamp: new Date().toISOString(),
        service: "front",
        env,
        category,
        level,
        message,
        context,
        data,
      })}\n`,
      "utf8",
    )

    return new NextResponse(null, { status: 204 })
  } catch {
    return NextResponse.json({ data: null, error: "Nao foi possivel registrar log" }, { status: 400 })
  }
}
