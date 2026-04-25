export const authConfig = {
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET ?? "mmx_dev_access_secret_change_me",
    refreshSecret: process.env.JWT_REFRESH_SECRET ?? "mmx_dev_refresh_secret_change_me",
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? "30m",
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? "7d",
  },
  oauth: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      redirectUri: process.env.GOOGLE_REDIRECT_URI ?? "http://localhost:3000/api/auth/google/callback",
    },
    microsoft: {
      clientId: process.env.MICROSOFT_CLIENT_ID ?? "",
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET ?? "",
      redirectUri: process.env.MICROSOFT_REDIRECT_URI ?? "http://localhost:3000/api/auth/microsoft/callback",
      tenantId: process.env.MICROSOFT_TENANT_ID ?? "common",
    },
  },
  cookie: {
    secure: process.env.NODE_ENV === "production",
    sameSite: (process.env.NODE_ENV === "production" ? "none" : "lax") as "none" | "lax",
    httpOnly: true,
  },
  email: {
    smtpHost: process.env.SMTP_HOST ?? "",
    smtpPort: parseInt(process.env.SMTP_PORT ?? "587", 10),
    smtpUser: process.env.SMTP_USER ?? "",
    smtpPass: process.env.SMTP_PASS ?? "",
    fromAddress: process.env.EMAIL_FROM_ADDRESS ?? "no-reply@moedamix.com",
    fromName: process.env.EMAIL_FROM_NAME ?? "MoedaMix",
  },
  frontendUrl: process.env.FRONTEND_URL ?? "http://localhost:3000",
  tokens: {
    emailVerifyTtlSeconds: 24 * 60 * 60,
    passwordResetTtlSeconds: 60 * 60,
  },
}
