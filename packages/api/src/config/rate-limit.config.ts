export const rateLimitConfig = {
  auth: {
    login: { limit: 5, windowMs: 60_000 },
    register: { limit: 5, windowMs: 60_000 },
    refresh: { limit: 10, windowMs: 60_000 },
    forgotPassword: { limit: 3, windowMs: 300_000 },
    resetPassword: { limit: 5, windowMs: 300_000 },
    verifyEmail: { limit: 10, windowMs: 60_000 },
    requestVerification: { limit: 3, windowMs: 300_000 },
    oauthStart: { limit: 10, windowMs: 60_000 },
    oauthCallback: { limit: 20, windowMs: 60_000 },
  },
}
