export const rateLimitConfig = {
  auth: {
    login: { limit: 5, windowMs: 60_000 },
    register: { limit: 5, windowMs: 60_000 },
    refresh: { limit: 10, windowMs: 60_000 },
    forgotPassword: { limit: 3, windowMs: 300_000 },
  },
}
