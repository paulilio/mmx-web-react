import { test, expect } from "playwright/test"

test.describe("AuthGuard — protege rotas autenticadas", () => {
  test("/dashboard sem cookie redireciona para /auth", async ({ page }) => {
    await page.goto("/dashboard")
    await page.waitForURL(/\/auth$/, { timeout: 10_000 })
    expect(page.url()).toMatch(/\/auth$/)
  })

  test("/transactions sem cookie redireciona para /auth", async ({ page }) => {
    await page.goto("/transactions")
    await page.waitForURL(/\/auth$/, { timeout: 10_000 })
    expect(page.url()).toMatch(/\/auth$/)
  })

  test("/settings sem cookie redireciona para /auth", async ({ page }) => {
    await page.goto("/settings")
    await page.waitForURL(/\/auth$/, { timeout: 10_000 })
    expect(page.url()).toMatch(/\/auth$/)
  })

  test("/auth/oauth-callback é público (não redireciona, mostra UI)", async ({ page }) => {
    await page.goto("/auth/oauth-callback?status=error&code=GOOGLE_OAUTH_NOT_CONFIGURED")
    // A página é pública — exibe a mensagem de erro
    await expect(page.getByText("Falha no login")).toBeVisible()
  })
})
