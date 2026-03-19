interface RateLimitConfig {
  namespace: string
  key: string
  limit: number
  windowMs: number
}

interface RateLimitResult {
  allowed: boolean
  retryAfterSeconds: number
  remaining: number
}

interface Bucket {
  count: number
  resetAt: number
}

const buckets = new Map<string, Bucket>()

function nowMs(): number {
  return Date.now()
}

function cleanupExpired(now: number) {
  for (const [bucketKey, bucket] of buckets.entries()) {
    if (bucket.resetAt <= now) {
      buckets.delete(bucketKey)
    }
  }
}

export function applyRateLimit(config: RateLimitConfig): RateLimitResult {
  const now = nowMs()
  cleanupExpired(now)

  const bucketKey = `${config.namespace}:${config.key}`
  const existing = buckets.get(bucketKey)

  if (!existing || existing.resetAt <= now) {
    buckets.set(bucketKey, {
      count: 1,
      resetAt: now + config.windowMs,
    })

    return {
      allowed: true,
      retryAfterSeconds: 0,
      remaining: Math.max(0, config.limit - 1),
    }
  }

  if (existing.count >= config.limit) {
    const retryAfterSeconds = Math.ceil((existing.resetAt - now) / 1000)

    return {
      allowed: false,
      retryAfterSeconds,
      remaining: 0,
    }
  }

  existing.count += 1
  buckets.set(bucketKey, existing)

  return {
    allowed: true,
    retryAfterSeconds: 0,
    remaining: Math.max(0, config.limit - existing.count),
  }
}

export function __resetRateLimitForTests() {
  buckets.clear()
}
