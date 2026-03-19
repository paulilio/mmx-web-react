export type RuntimeEnvironment = "development" | "staging" | "production"

export interface CorsOriginMatrix {
  development: string[]
  staging: string[]
  production: string[]
}

interface ResolveRuntimeEnvironmentInput {
  appEnv?: string
  nodeEnv?: string
  vercelEnv?: string
}

interface ResolveCorsOriginMatrixInput {
  development?: string
  staging?: string
  production?: string
}

interface CorsDecisionInput {
  method: string
  origin?: string | null
  requestHeaders?: string | null
  environment: RuntimeEnvironment
  originMatrix: CorsOriginMatrix
}

export interface CorsDecision {
  allowed: boolean
  status: number
  headers: Record<string, string>
}

const DEFAULT_DEV_ORIGINS = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3001",
]

function normalizeOrigin(value: string): string | null {
  try {
    return new URL(value).origin
  } catch {
    return null
  }
}

function parseOrigins(raw: string | undefined): string[] {
  if (!raw) {
    return []
  }

  const normalized = raw
    .split(",")
    .map((value) => value.trim())
    .filter((value) => value.length > 0)
    .map((value) => normalizeOrigin(value))
    .filter((value): value is string => Boolean(value))

  return Array.from(new Set(normalized))
}

export function resolveRuntimeEnvironment(input: ResolveRuntimeEnvironmentInput = {}): RuntimeEnvironment {
  const appEnv = input.appEnv ?? process.env.MMX_APP_ENV
  const nodeEnv = input.nodeEnv ?? process.env.NODE_ENV
  const vercelEnv = input.vercelEnv ?? process.env.VERCEL_ENV

  if (appEnv === "development" || appEnv === "staging" || appEnv === "production") {
    return appEnv
  }

  if (vercelEnv === "production") {
    return "production"
  }

  if (vercelEnv === "preview") {
    return "staging"
  }

  if (nodeEnv === "production") {
    return "production"
  }

  return "development"
}

export function resolveCorsOriginMatrix(input: ResolveCorsOriginMatrixInput = {}): CorsOriginMatrix {
  const development = parseOrigins(input.development ?? process.env.CORS_ORIGINS_DEV)
  const staging = parseOrigins(input.staging ?? process.env.CORS_ORIGINS_STAGING)
  const production = parseOrigins(input.production ?? process.env.CORS_ORIGINS_PROD)

  return {
    development: development.length > 0 ? development : DEFAULT_DEV_ORIGINS,
    staging,
    production,
  }
}

function buildSuccessHeaders(origin: string, requestHeaders: string | null | undefined): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": requestHeaders || "Content-Type, Authorization",
    "Access-Control-Max-Age": "600",
    Vary: "Origin, Access-Control-Request-Headers",
  }
}

export function evaluateCorsRequest(input: CorsDecisionInput): CorsDecision {
  const origin = input.origin ? normalizeOrigin(input.origin) : null
  const isPreflight = input.method.toUpperCase() === "OPTIONS"

  if (!origin) {
    return {
      allowed: true,
      status: isPreflight ? 204 : 200,
      headers: {
        Vary: "Origin",
      },
    }
  }

  const allowedOrigins = input.originMatrix[input.environment]
  const allowed = allowedOrigins.includes(origin)

  if (!allowed) {
    return {
      allowed: false,
      status: 403,
      headers: {
        Vary: "Origin",
      },
    }
  }

  return {
    allowed: true,
    status: isPreflight ? 204 : 200,
    headers: buildSuccessHeaders(origin, input.requestHeaders),
  }
}
