#!/usr/bin/env node
/**
 * Smoke autenticado dos endpoints de recorrência em produção.
 *
 * Cobre o ciclo completo (create → read → pause → skip → update → exception
 * → duplicate → delete) em sequência, criando dados num user de teste
 * conhecido e SEMPRE rodando cleanup no finally — mesmo se algum teste falhar.
 *
 * Pré-requisitos (env vars):
 *   API_URL                  default https://api.moedamix.com.br
 *   JWT_ACCESS_SECRET        secret pra mintar JWT (mesmo do backend)
 *   MMX_E2E_TEST_USER_ID     cuid do user de teste
 *   MMX_E2E_TEST_USER_EMAIL  email pra payload do JWT
 *
 * Uso:
 *   node scripts/smoke/recurring.mjs
 *   API_URL=http://localhost:4000 node scripts/smoke/recurring.mjs
 *
 * Exit: 0 se TODOS os checks passam; 1 se qualquer um falhar (cleanup roda do mesmo jeito).
 */

import { execFileSync } from "node:child_process"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, "..", "..")
const TOKEN_SCRIPT = path.join(REPO_ROOT, "scripts", "e2e-token.mjs")

const API_URL = (process.env.API_URL ?? "https://api.moedamix.com.br").replace(/\/$/, "")

let passed = 0
let failed = 0
const failures = []

const GREEN = "\x1b[0;32m"
const RED = "\x1b[0;31m"
const YELLOW = "\x1b[1;33m"
const RESET = "\x1b[0m"

function fmt(name, status, detail = "") {
  const tag = status === "ok" ? `${GREEN}PASS${RESET}` : status === "fail" ? `${RED}FAIL${RESET}` : `${YELLOW}WARN${RESET}`
  const namePadded = name.padEnd(60)
  process.stdout.write(`  ${namePadded} ${tag}${detail ? ` ${detail}` : ""}\n`)
}

function ok(name, detail = "") {
  passed++
  fmt(name, "ok", detail)
}

function fail(name, detail = "") {
  failed++
  failures.push(`${name}${detail ? ` — ${detail}` : ""}`)
  fmt(name, "fail", detail)
}

function mintToken() {
  const stdout = execFileSync("node", [TOKEN_SCRIPT], {
    cwd: REPO_ROOT,
    env: process.env,
    stdio: ["ignore", "pipe", "inherit"],
  })
  return stdout.toString().trim()
}

async function api(method, path, { token, body } = {}) {
  const headers = {
    "Content-Type": "application/json",
    Cookie: `mmx_access_token=${token}`,
  }
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })
  let raw = null
  const text = await res.text()
  if (text) {
    try {
      raw = JSON.parse(text)
    } catch {
      raw = text
    }
  }
  // Backend usa envelope { data, error } — desempacota se presente
  let data = raw
  if (raw && typeof raw === "object" && "data" in raw && "error" in raw) {
    data = raw.data
  }
  return { status: res.status, data }
}

// Lista paginada vem como { data: T[], total, page, pageSize }
function unwrapList(data) {
  if (Array.isArray(data)) return data
  if (data && Array.isArray(data.data)) return data.data
  return []
}

async function main() {
  process.stdout.write(`\n  Smoke recorrência — API: ${API_URL}\n\n`)

  let token
  try {
    token = mintToken()
    if (!token) throw new Error("token vazio")
    ok("Mint JWT via e2e-token.mjs")
  } catch (err) {
    fail("Mint JWT via e2e-token.mjs", err.message)
    summarize()
    process.exit(1)
  }

  // Pega 1 categoria existente do user pra usar como categoryId
  const cats = await api("GET", "/categories", { token })
  const catList = unwrapList(cats.data)
  if (cats.status !== 200 || catList.length === 0) {
    fail("GET /categories retorna lista usável", `status=${cats.status} len=${catList.length}`)
    summarize()
    process.exit(1)
  }
  const expenseCat = catList.find((c) => c.type === "expense")
  if (!expenseCat) {
    fail("Encontra categoria do tipo expense", "user de teste sem categoria de despesa")
    summarize()
    process.exit(1)
  }
  ok(`GET /categories (usando ${expenseCat.name})`)

  let templateId = null
  let executionIds = []
  let duplicateId = null

  try {
    // === 1. Criar série mensal × 3 ===
    const startDate = new Date()
    startDate.setDate(15)
    startDate.setMonth(startDate.getMonth() + 6) // 6 meses no futuro pra não conflitar com dashboard
    const startIso = startDate.toISOString().split("T")[0]

    const create = await api("POST", "/transactions/recurring", {
      token,
      body: {
        template: {
          frequency: "MONTHLY",
          interval: 1,
          count: 3,
          startDate: startIso,
        },
        base: {
          description: `[smoke-test] Recorrência ${Date.now()}`,
          amount: 99.99,
          type: "expense",
          categoryId: expenseCat.id,
          status: "pending",
        },
      },
    })
    if (create.status === 201 && create.data?.template?.id && create.data?.executions?.length === 3) {
      templateId = create.data.template.id
      executionIds = create.data.executions.map((e) => e.id)
      ok("POST /transactions/recurring (série de 3)", `tpl=${templateId.slice(0, 12)}…`)
    } else {
      fail("POST /transactions/recurring", `status=${create.status} body=${JSON.stringify(create.data).slice(0, 200)}`)
      return
    }

    // === 2. GET série ===
    const get = await api("GET", `/transactions/recurring/${templateId}`, { token })
    if (
      get.status === 200 &&
      get.data?.template?.id === templateId &&
      get.data?.executions?.length === 3 &&
      get.data?.counts?.total === 3
    ) {
      ok("GET /transactions/recurring/:id (3 execuções, paused=false)")
    } else {
      fail("GET série", `status=${get.status} count=${get.data?.counts?.total}`)
    }

    // === 3. Pausar série ===
    const pause = await api("PATCH", `/transactions/recurring/${templateId}/pause`, {
      token,
      body: { paused: true },
    })
    if (pause.status === 200 && pause.data?.template?.paused === true) {
      ok("PATCH /:id/pause (paused=true)")
    } else {
      fail("Pausar série", `status=${pause.status}`)
    }

    // === 4. Retomar ===
    const resume = await api("PATCH", `/transactions/recurring/${templateId}/pause`, {
      token,
      body: { paused: false },
    })
    if (resume.status === 200 && resume.data?.template?.paused === false) {
      ok("PATCH /:id/pause (retomar, paused=false)")
    } else {
      fail("Retomar série", `status=${resume.status}`)
    }

    // === 5. Pular próxima (1ª execução) ===
    const skip = await api("POST", `/transactions/${executionIds[0]}/skip`, { token })
    if (skip.status === 200 && skip.data?.skipped === true) {
      ok("POST /:id/skip (skipped=true)")
    } else {
      fail("Pular próxima", `status=${skip.status}`)
    }

    // === 6. Confirma counts.skipped via GET série ===
    const getAfterSkip = await api("GET", `/transactions/recurring/${templateId}`, { token })
    if (getAfterSkip.data?.counts?.skipped === 1) {
      ok("counts.skipped reflete pular (1)")
    } else {
      fail("counts.skipped", `esperado 1 obtido ${getAfterSkip.data?.counts?.skipped}`)
    }

    // === 7. Update applyMode=all (atualiza description nas 3 execuções) ===
    const newDesc = `[smoke-test] atualizada ${Date.now()}`
    const update = await api("PATCH", `/transactions/recurring/${templateId}`, {
      token,
      body: { applyMode: "all", patch: { description: newDesc } },
    })
    if (update.status === 200 && update.data?.updated >= 1) {
      ok(`PATCH applyMode=all (updated=${update.data.updated})`)
    } else {
      fail("Update applyMode=all", `status=${update.status}`)
    }

    // === 8. Mark as exception (3ª execução com amount diferente) ===
    const exception = await api("PATCH", `/transactions/${executionIds[2]}/exception`, {
      token,
      body: { amount: 777.77 },
    })
    if (exception.status === 200 && exception.data?.isException === true && Number(exception.data?.amount) === 777.77) {
      ok("PATCH /:id/exception (isException=true, amount custom)")
    } else {
      fail("Mark as exception", `status=${exception.status}`)
    }

    // === 9. Duplicar (cria tx avulsa sem templateId) ===
    const duplicate = await api("POST", `/transactions/${executionIds[1]}/duplicate`, {
      token,
      body: {},
    })
    if (duplicate.status === 201 && duplicate.data?.id && !duplicate.data?.templateId) {
      duplicateId = duplicate.data.id
      ok("POST /:id/duplicate (sem templateId, date=hoje)")
    } else {
      fail("Duplicar transação", `status=${duplicate.status}`)
    }

    // === 10. Delete applyMode=future (apaga 2 últimas) ===
    const delFuture = await api(
      "DELETE",
      `/transactions/recurring/${templateId}?applyMode=future&fromTransactionId=${executionIds[1]}`,
      { token },
    )
    if (delFuture.status === 200 && delFuture.data?.deleted >= 1) {
      ok(`DELETE applyMode=future (deleted=${delFuture.data.deleted})`)
    } else {
      fail("Delete applyMode=future", `status=${delFuture.status}`)
    }
  } finally {
    // === Cleanup robusto ===
    process.stdout.write("\n  Cleanup\n")

    if (templateId) {
      const cleanup = await api(
        "DELETE",
        `/transactions/recurring/${templateId}?applyMode=all`,
        { token },
      )
      if (cleanup.status === 200 || cleanup.status === 404) {
        ok("Cleanup: DELETE applyMode=all")
      } else {
        fail("Cleanup template", `status=${cleanup.status}`)
      }
    }
    if (duplicateId) {
      const cleanupDup = await api("DELETE", `/transactions/${duplicateId}`, { token })
      if (cleanupDup.status === 200 || cleanupDup.status === 404) {
        ok("Cleanup: tx duplicada deletada")
      } else {
        fail("Cleanup duplicate", `status=${cleanupDup.status}`)
      }
    }
  }

  summarize()
  if (failed > 0) process.exit(1)
}

function summarize() {
  process.stdout.write(`\n  Total: ${passed} passed, ${failed} failed\n`)
  if (failures.length > 0) {
    process.stdout.write(`\n  Failures:\n`)
    for (const f of failures) process.stdout.write(`    - ${f}\n`)
  }
  process.stdout.write("\n")
}

main().catch((err) => {
  console.error("[smoke-recurring] erro fatal:", err)
  process.exit(1)
})
