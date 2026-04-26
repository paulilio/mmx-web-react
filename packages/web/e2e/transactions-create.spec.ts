import { test, expect, type APIRequestContext } from "playwright/test"

/**
 * Cobre o fluxo end-to-end de criar uma transação via UI.
 *
 * Pré-requisitos:
 *  - User de teste existente em produção (criado uma vez via OAuth manual)
 *  - Seed carregado pra esse user (assim a área "Despesas Variáveis", grupo "Alimentação"
 *    e categoria "Restaurante" existem na hierarquia esperada)
 *  - JWT_ACCESS_SECRET, MMX_E2E_TEST_USER_ID e MMX_E2E_TEST_USER_EMAIL configurados
 *    (ver scripts/e2e-token.mjs)
 *
 * Cleanup: o teste sempre tenta deletar a transação criada via API no afterEach,
 * mesmo se o teste falhar antes de chegar lá. Isso evita lixo acumular em produção.
 */

const TEST_DESCRIPTION = `e2e-test ${new Date().toISOString()}`
const TEST_AMOUNT_CENTS = "10000" // R$ 100,00

const apiBase = process.env.E2E_API_BASE ?? "https://api.moedamix.com.br"
const accessToken = (process.env.MMX_E2E_TOKEN ?? "").trim()

let createdTransactionId: string | null = null

async function deleteTransaction(request: APIRequestContext, id: string): Promise<void> {
  if (!accessToken) return // sem token não dá pra cleanup; teste vai falhar antes de criar
  await request.delete(`${apiBase}/transactions/${id}`, {
    headers: {
      cookie: `mmx_access_token=${accessToken}`,
    },
  })
}

test.describe("/transactions — criação via modal", () => {
  test.afterEach(async ({ request }) => {
    if (createdTransactionId) {
      await deleteTransaction(request, createdTransactionId)
      createdTransactionId = null
    }
  })

  test("cria transação preenchendo o modal completo e ela aparece na tabela", async ({ page }) => {
    await page.goto("/transactions")
    await expect(page.getByRole("heading", { name: "Transações", level: 1 })).toBeVisible()

    // Garante a tab que vamos checar (Despesas variáveis), pra ver a transação criada na lista.
    await page.getByRole("tab", { name: "Despesas variáveis" }).click()

    // Abre o modal Nova Transação.
    await page.getByRole("button", { name: "Adicionar registro" }).click()
    const modal = page.getByRole("dialog", { name: "Nova Transação" })
    await expect(modal).toBeVisible()

    // Tipo Despesa já é o default — só verifica.
    await expect(modal.getByRole("combobox", { name: /tipo/i }).or(modal.locator('[role="combobox"]').first())).toBeVisible()

    // Valor (input com máscara — digite os centavos).
    const valorInput = modal.getByPlaceholder("R$ 0,00")
    await valorInput.click()
    await valorInput.fill(TEST_AMOUNT_CENTS)

    // Cascata: Área → Grupo Categoria → Categoria
    await modal.getByRole("combobox", { name: /^área$/i }).or(modal.getByText("Selecione uma área", { exact: true })).first().click()
    await page.getByRole("option", { name: "Despesas Variáveis" }).click()

    await modal.getByText("Selecione um grupo categoria", { exact: true }).click()
    await page.getByRole("option", { name: "Alimentação" }).click()

    await modal.getByText("Selecione uma categoria", { exact: true }).click()
    await page.getByRole("option", { name: "Restaurante" }).click()

    // Status: deixa Pendente (default).

    // Descrição (campo obrigatório — sem ele o submit fica bloqueado pelo validate do react-hook-form).
    await modal.getByPlaceholder(/almoço no restaurante/i).fill(TEST_DESCRIPTION)

    // Captura a request de POST pra extrair o ID criado e usar no cleanup.
    const responsePromise = page.waitForResponse(
      (response) =>
        response.url().includes("/transactions") &&
        response.request().method() === "POST" &&
        response.status() < 500,
    )

    await modal.getByRole("button", { name: "Criar" }).click()

    const response = await responsePromise
    expect(response.status()).toBeLessThan(400)

    const body = await response.json()
    const transactionId =
      body?.data?.id ?? body?.id ?? body?.data?.transaction?.id ?? null
    if (typeof transactionId === "string" && transactionId.length > 0) {
      createdTransactionId = transactionId
    }

    // Modal fecha.
    await expect(modal).toBeHidden({ timeout: 10_000 })

    // Transação aparece na lista — busca pela descrição única usada nesse run.
    await expect(page.getByText(TEST_DESCRIPTION).first()).toBeVisible({ timeout: 10_000 })
  })

  test("submit fica bloqueado quando descrição está vazia (validação react-hook-form)", async ({ page }) => {
    await page.goto("/transactions")
    await page.getByRole("button", { name: "Adicionar registro" }).click()
    const modal = page.getByRole("dialog", { name: "Nova Transação" })
    await expect(modal).toBeVisible()

    // Preenche todos os outros campos obrigatórios menos descrição.
    await modal.getByPlaceholder("R$ 0,00").click()
    await modal.getByPlaceholder("R$ 0,00").fill("100")

    await modal.getByText("Selecione uma área", { exact: true }).click()
    await page.getByRole("option", { name: "Despesas Variáveis" }).click()

    await modal.getByText("Selecione um grupo categoria", { exact: true }).click()
    await page.getByRole("option", { name: "Alimentação" }).click()

    await modal.getByText("Selecione uma categoria", { exact: true }).click()
    await page.getByRole("option", { name: "Restaurante" }).click()

    // Tenta submeter sem descrição.
    await modal.getByRole("button", { name: "Criar" }).click()

    // Mensagem de erro inline aparece.
    await expect(modal.getByText("Descrição é obrigatória")).toBeVisible()

    // Modal continua aberto (submit foi bloqueado).
    await expect(modal).toBeVisible()

    // Cancela pra fechar.
    await modal.getByRole("button", { name: "Cancelar" }).click()
    await expect(modal).toBeHidden()
  })
})
