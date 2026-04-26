import { defineConfig, devices } from "playwright/test"
import path from "node:path"

const baseURL = process.env.E2E_BASE_URL ?? "https://app.moedamix.com.br"
const STORAGE_PATH = path.resolve(__dirname, ".playwright", "auth.json")

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "github" : "list",
  timeout: 30_000,
  expect: { timeout: 5_000 },

  globalSetup: require.resolve("./e2e/global-setup.ts"),

  use: {
    baseURL,
    trace: "retain-on-failure",
    video: "retain-on-failure",
    screenshot: "only-on-failure",
  },

  projects: [
    {
      // Specs anônimos (auth-guard, oauth) — sem storageState pra simular usuário não logado.
      name: "anonymous",
      testMatch: /(auth-guard|auth-page|oauth-redirect|oauth-callback-error)\.spec\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },
    {
      // Specs autenticados — reusam storageState gerado pelo global-setup.
      name: "authenticated",
      testIgnore: /(auth-guard|auth-page|oauth-redirect|oauth-callback-error)\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        storageState: STORAGE_PATH,
      },
    },
  ],
})
