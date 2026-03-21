interface RateLimitEntry {
  count: number
  resetAt: number
}

interface RateLimitOptions {
  namespace: string
  key: string
  limit: number
  windowMs: number
}

interface RateLimitResult {
  allowed: boolean
  retryAfterSeconds: number
}

const store = new Map<string, RateLimitEntry>()

export function applyRateLimit(options: RateLimitOptions): RateLimitResult {
  const storeKey = `${options.namespace}:${options.key}`
  const now = Date.now()

  const entry = store.get(storeKey)

  if (!entry || now > entry.resetAt) {
    store.set(storeKey, { count: 1, resetAt: now + options.windowMs })
    return { allowed: true, retryAfterSeconds: 0 }
  }

  if (entry.count >= options.limit) {
    const retryAfterSeconds = Math.ceil((entry.resetAt - now) / 1000)
    return { allowed: false, retryAfterSeconds }
  }

  entry.count++
  return { allowed: true, retryAfterSeconds: 0 }
}
