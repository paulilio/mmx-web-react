import { test, expect } from "playwright/test"

test.describe("/auth — OAuth-only landing", () => {
  test("renderiza heading e os 2 botões OAuth", async ({ page }) => {
    await page.goto("/auth")

    await expect(page.getByText("Acesse sua conta")).toBeVisible()
    await expect(page.getByRole("button", { name: /Continuar com Google/i })).toBeVisible()
    await expect(page.getByRole("button", { name: /Continuar com Microsoft/i })).toBeVisible()
  })

  test("NÃO renderiza form de senha (sanity OAuth-only)", async ({ page }) => {
    await page.goto("/auth")

    await expect(page.locator('input[type="password"]')).toHaveCount(0)
    await expect(page.getByText(/Esqueceu sua senha/i)).toHaveCount(0)
    await expect(page.getByText(/Criar Conta/i)).toHaveCount(0)
  })

  test("mensagem reforça privacidade dos providers", async ({ page }) => {
    await page.goto("/auth")
    await expect(page.getByText(/Não armazenamos senhas/i)).toBeVisible()
  })
})
