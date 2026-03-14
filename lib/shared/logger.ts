/**
 * Centralized logging utility
 * Provides consistent logging with environment-aware behavior
 */

type LogLevel = "debug" | "info" | "warn" | "error"

interface LogOptions {
  context?: string
  data?: Record<string, unknown>
}

type RuntimeLogPayload = {
  level: LogLevel
  message: string
  context?: string
  data?: Record<string, unknown>
}

const isDevelopment = process.env.NODE_ENV === "development"
const isDebugEnabled = process.env.NEXT_PUBLIC_DEBUG === "true"
const consoleSink = globalThis.console
const REDACT_KEYS = ["password", "token", "authorization", "cookie", "set-cookie", "secret"]

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

function toRuntimePayload(level: LogLevel, message: string, options?: LogOptions): RuntimeLogPayload {
  return {
    level,
    message,
    context: options?.context,
    data: (redact(options?.data) || undefined) as Record<string, unknown> | undefined,
  }
}

function emitRuntimeLog(payload: RuntimeLogPayload): void {
  if (typeof window === "undefined") {
    return
  }

  void fetch("/api/logs", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    keepalive: true,
  }).catch(() => {
    // Intencional: falha de envio de log nao pode quebrar UX
  })
}

function formatMessage(level: LogLevel, message: string, options?: LogOptions): string {
  const timestamp = new Date().toISOString()
  const context = options?.context ? `[${options.context}]` : ""
  return `${timestamp} ${level.toUpperCase()} ${context} ${message}`
}

function shouldLog(level: LogLevel): boolean {
  if (level === "error") return true
  if (level === "warn") return true
  if (level === "info") return isDevelopment || isDebugEnabled
  if (level === "debug") return isDebugEnabled
  return false
}

export const logger = {
  debug(message: string, options?: LogOptions): void {
    if (!shouldLog("debug")) return
    consoleSink?.debug?.(formatMessage("debug", message, options), options?.data || "")
    emitRuntimeLog(toRuntimePayload("debug", message, options))
  },

  info(message: string, options?: LogOptions): void {
    if (!shouldLog("info")) return
    consoleSink?.info?.(formatMessage("info", message, options), options?.data || "")
    emitRuntimeLog(toRuntimePayload("info", message, options))
  },

  warn(message: string, options?: LogOptions): void {
    if (!shouldLog("warn")) return
    consoleSink?.warn?.(formatMessage("warn", message, options), options?.data || "")
    emitRuntimeLog(toRuntimePayload("warn", message, options))
  },

  error(message: string, error?: Error | unknown, options?: LogOptions): void {
    if (!shouldLog("error")) return
    const errorData = error instanceof Error
      ? { message: error.message, stack: error.stack }
      : { error }
    const payloadData = { ...options?.data, ...errorData }
    consoleSink?.error?.(formatMessage("error", message, options), payloadData)
    emitRuntimeLog(toRuntimePayload("error", message, { ...options, data: payloadData }))
  },

  /**
   * Create a scoped logger with a fixed context
   */
  scope(context: string) {
    return {
      debug: (message: string, data?: Record<string, unknown>) =>
        logger.debug(message, { context, data }),
      info: (message: string, data?: Record<string, unknown>) =>
        logger.info(message, { context, data }),
      warn: (message: string, data?: Record<string, unknown>) =>
        logger.warn(message, { context, data }),
      error: (message: string, error?: Error | unknown, data?: Record<string, unknown>) =>
        logger.error(message, error, { context, data }),
    }
  },
}

// Pre-configured loggers for common contexts
export const authLogger = logger.scope("Auth")
export const storageLogger = logger.scope("Storage")
export const apiLogger = logger.scope("API")
