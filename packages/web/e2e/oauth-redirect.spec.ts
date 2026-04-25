import { test, expect } from "playwright/test"

const apiBase = process.env.E2E_API_BASE ?? "https://api.moedamix.com.br"

test.describe("OAuth start — backend redirects para providers", () => {
  test("Click no botão Google dispara request para /auth/oauth/google", async ({ page, context }) => {
    await page.goto("/auth")

    // Intercepta a request de navegação para o backend e aborta antes de chegar no Google.
    // Coletamos a URL para asserção.
    let interceptedUrl = ""
    await context.route("**/auth/oauth/google", (route) => {
      interceptedUrl = route.request().url()
      route.abort()
    })

    await page.getByRole("button", { name: /Continuar com Google/i }).click()
    // Aguarda o intercept resolver
    await page.waitForTimeout(2000)

    expect(interceptedUrl).toMatch(/\/auth\/oauth\/google/)
  })

  test("Backend /auth/oauth/google retorna 302 com Location pra accounts.google.com", async ({ request }) => {
    const res = await request.get(`${apiBase}/auth/oauth/google`, { maxRedirects: 0 })
    expect(res.status()).toBe(302)
    expect(res.headers()["location"]).toMatch(/accounts\.google\.com\/o\/oauth2\/v2\/auth/)
  })

  test("Backend /auth/oauth/microsoft retorna 302 com Location pra login.microsoftonline.com", async ({ request }) => {
    const res = await request.get(`${apiBase}/auth/oauth/microsoft`, { maxRedirects: 0 })
    expect(res.status()).toBe(302)
    expect(res.headers()["location"]).toMatch(/login\.microsoftonline\.com/)
  })
})
