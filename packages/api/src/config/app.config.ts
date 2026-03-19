export const appConfig = {
  env: (process.env.NODE_ENV ?? "development") as "development" | "staging" | "production",
  port: Number(process.env.PORT ?? 4000),
  isProduction: process.env.NODE_ENV === "production",
  logLevel: process.env.LOG_LEVEL ?? (process.env.NODE_ENV === "production" ? "warn" : "log"),
}
