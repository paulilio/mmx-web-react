export interface CorsOriginMatrix {
  dev: string[]
  staging: string[]
  production: string[]
}

interface CorsEvaluationInput {
  method: string
  origin: string | null
  requestHeaders: string | null
  environment: string
  originMatrix: CorsOriginMatrix
}

interface CorsDecision {
  allowed: boolean
  headers: Record<string, string>
}

export function resolveRuntimeEnvironment(): string {
  return process.env.MMX_APP_ENV ?? process.env.NODE_ENV ?? "development"
}

export function resolveCorsOriginMatrix(): CorsOriginMatrix {
  const dev = (process.env.CORS_ORIGINS_DEV ?? "http://localhost:3000,http://127.0.0.1:3000")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean)

  const staging = (process.env.CORS_ORIGINS_STAGING ?? "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean)

  const production = (process.env.CORS_ORIGINS_PROD ?? "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean)

  return { dev, staging, production }
}

export function evaluateCorsRequest(input: CorsEvaluationInput): CorsDecision {
  const { method, origin, requestHeaders, environment, originMatrix } = input

  const allowedOrigins =
    environment === "production"
      ? originMatrix.production
      : environment === "staging"
        ? [...originMatrix.staging, ...originMatrix.dev]
        : originMatrix.dev

  const allowed = origin === null || allowedOrigins.includes(origin)

  if (!allowed) {
    return { allowed: false, headers: {} }
  }

  const headers: Record<string, string> = {
    "Access-Control-Allow-Origin": origin ?? "*",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS,PATCH",
    "Access-Control-Allow-Headers": requestHeaders ?? "Content-Type,Authorization",
  }

  if (method === "OPTIONS") {
    headers["Access-Control-Max-Age"] = "86400"
  }

  return { allowed: true, headers }
}
