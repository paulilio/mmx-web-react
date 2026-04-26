#!/usr/bin/env node

function parseArgs(argv) {
  const args = {
    env: process.env.MMX_APP_ENV || process.env.NODE_ENV || "development",
  }

  for (const arg of argv) {
    if (arg.startsWith("--env=")) {
      args.env = arg.split("=")[1] || args.env
    }
  }

  return args
}

function parseCsv(value) {
  if (!value) {
    return []
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
}

function assertRequired(name, value, errors) {
  if (!value || String(value).trim().length === 0) {
    errors.push(`${name} is required`)
  }
}

function validateByEnvironment(env) {
  const errors = []
  const warnings = []

  const isProdLike = env === "production"
  const isApiEnabled = process.env.NEXT_PUBLIC_USE_API === "true"

  if (isProdLike) {
    assertRequired("DATABASE_URL", process.env.DATABASE_URL, errors)
    assertRequired("MMX_APP_ENV", process.env.MMX_APP_ENV, errors)
  } else {
    if (!process.env.DATABASE_URL) {
      warnings.push("DATABASE_URL is empty; Prisma-backed API routes may fail when accessed")
    }

    if (!process.env.MMX_APP_ENV) {
      warnings.push("MMX_APP_ENV is empty; runtime will fallback using NODE_ENV/VERCEL_ENV")
    }
  }

  if (isApiEnabled) {
    assertRequired("NEXT_PUBLIC_API_BASE", process.env.NEXT_PUBLIC_API_BASE, errors)
  } else {
    warnings.push("NEXT_PUBLIC_USE_API is not 'true'; app will run in mock-first mode for non-migrated endpoints")
  }

  if (isProdLike) {
    const allowedOrigins = parseCsv(process.env.CORS_ORIGINS_PROD)
    if (allowedOrigins.length === 0) {
      errors.push("CORS_ORIGINS_PROD must include at least one allowed origin in production")
    }

    assertRequired("GOOGLE_CLIENT_ID", process.env.GOOGLE_CLIENT_ID, errors)
    assertRequired("GOOGLE_CLIENT_SECRET", process.env.GOOGLE_CLIENT_SECRET, errors)
    assertRequired("GOOGLE_REDIRECT_URI", process.env.GOOGLE_REDIRECT_URI, errors)

    assertRequired("MICROSOFT_CLIENT_ID", process.env.MICROSOFT_CLIENT_ID, errors)
    assertRequired("MICROSOFT_CLIENT_SECRET", process.env.MICROSOFT_CLIENT_SECRET, errors)
    assertRequired("MICROSOFT_REDIRECT_URI", process.env.MICROSOFT_REDIRECT_URI, errors)
  }

  if (!process.env.CORS_ORIGINS_DEV) {
    warnings.push("CORS_ORIGINS_DEV is empty; localhost defaults will be used")
  }

  validateOpenFinance(env, errors, warnings)

  return { errors, warnings }
}

function validateOpenFinance(env, errors, warnings) {
  const isProdLike = env === "production"

  if (process.env.MMX_ENCRYPTION_KEY) {
    const decoded = Buffer.from(process.env.MMX_ENCRYPTION_KEY, "base64")
    if (decoded.length !== 32) {
      errors.push("MMX_ENCRYPTION_KEY must decode to 32 bytes (base64)")
    }
  } else if (isProdLike) {
    errors.push("MMX_ENCRYPTION_KEY is required in production")
  } else {
    warnings.push("MMX_ENCRYPTION_KEY is empty; encrypted-at-rest features will fail")
  }

  const belvoEnv = process.env.BELVO_ENV
  if (belvoEnv && !["sandbox", "production"].includes(belvoEnv)) {
    errors.push(`BELVO_ENV must be 'sandbox' or 'production' (got '${belvoEnv}')`)
  }

  if (process.env.BELVO_SECRET_ID || process.env.BELVO_SECRET_PASSWORD) {
    assertRequired("BELVO_SECRET_ID", process.env.BELVO_SECRET_ID, errors)
    assertRequired("BELVO_SECRET_PASSWORD", process.env.BELVO_SECRET_PASSWORD, errors)
  } else if (isProdLike) {
    warnings.push("BELVO_SECRET_ID/BELVO_SECRET_PASSWORD empty; Open Finance features will be disabled")
  }

  if (!process.env.BELVO_WEBHOOK_SECRET && (process.env.BELVO_SECRET_ID || isProdLike)) {
    warnings.push("BELVO_WEBHOOK_SECRET empty; webhook endpoint will reject all calls")
  }
}

function main() {
  const args = parseArgs(process.argv.slice(2))
  const targetEnv = args.env

  const validEnvironments = new Set(["development", "staging", "production"])
  if (!validEnvironments.has(targetEnv)) {
    console.error(`[env-check] Invalid --env value: '${targetEnv}'. Use development|staging|production.`)
    process.exit(1)
  }

  const { errors, warnings } = validateByEnvironment(targetEnv)

  console.log(`[env-check] Target environment: ${targetEnv}`)

  if (warnings.length > 0) {
    for (const warning of warnings) {
      console.log(`[env-check] warning: ${warning}`)
    }
  }

  if (errors.length > 0) {
    for (const error of errors) {
      console.error(`[env-check] error: ${error}`)
    }

    console.error(`[env-check] failed with ${errors.length} error(s).`)
    process.exit(1)
  }

  console.log("[env-check] ok")
}

main()
