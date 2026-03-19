export const corsConfig = {
  development: (process.env.CORS_ORIGINS_DEV ?? "http://localhost:3000").split(",").map((o) => o.trim()),
  staging: (process.env.CORS_ORIGINS_STAGING ?? "").split(",").map((o) => o.trim()).filter(Boolean),
  production: (process.env.CORS_ORIGINS_PROD ?? "").split(",").map((o) => o.trim()).filter(Boolean),
}
