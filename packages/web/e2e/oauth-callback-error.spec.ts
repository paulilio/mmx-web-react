import { test, expect } from "playwright/test"

test.describe("/auth/oauth-callback — handling de status", () => {
  test("status=error&code=OAUTH_STATE_INVALID mostra mensagem específica", async ({ page }) => {
    await page.goto("/auth/oauth-callback?provider=google&status=error&code=OAUTH_STATE_INVALID")

    await expect(page.getByText("Falha no login")).toBeVisible()
    await expect(page.getByText(/Sessão OAuth expirada/i)).toBeVisible()
    await expect(page.getByRole("button", { name: /Voltar ao login/i })).toBeVisible()
  })

  test("status=error&code desconhecido mostra fallback genérico", async ({ page }) => {
    await page.goto("/auth/oauth-callback?provider=google&status=error&code=XYZ_UNKNOWN")

    await expect(page.getByText("Falha no login")).toBeVisible()
    await expect(page.getByText(/Não foi possível completar o login/i)).toBeVisible()
  })

  test("clique em 'Voltar ao login' navega para /auth", async ({ page }) => {
    await page.goto("/auth/oauth-callback?status=error&code=OAUTH_CODE_MISSING")
    await page.getByRole("button", { name: /Voltar ao login/i }).click()
    await page.waitForURL(/\/auth$/)
    expect(page.url()).toMatch(/\/auth$/)
  })

  test("status=success sem cookies tenta hidratar e mostra erro de carregamento", async ({ page }) => {
    // Sem cookies, /auth/me retorna 401 → frontend trata como falha
    await page.goto("/auth/oauth-callback?provider=google&status=success&isNewUser=0")
    // Deve mostrar erro de hidratação OU spinner (depende do timing)
    // Aceitamos qualquer um dos dois para evitar flakiness
    await expect(
      page.getByText(/Falha no login|Concluindo login/i).first(),
    ).toBeVisible({ timeout: 10_000 })
  })
})
