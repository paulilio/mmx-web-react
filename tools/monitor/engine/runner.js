const fs = require("fs")
const path = require("path")
const { chromium } = require(require.resolve("playwright", { paths: [process.cwd()] }))
const { attachMonitors } = require("./monitor")
const { collectEvidence } = require("./evidence")
const { buildReport, writeReport } = require("./report")
const { writeSystemLog } = require("./system-log")

function loadConfig(projectRoot) {
  const configPath = path.join(projectRoot, "config", "monitor.config.json")
  const raw = fs.readFileSync(configPath, "utf8")
  return JSON.parse(raw)
}

function applyCliOverrides(config) {
  const args = process.argv.slice(2)
  const result = { ...config }

  function getOptionValue(optionName, currentArg, nextArg) {
    if (currentArg === optionName && nextArg) {
      return nextArg
    }

    const prefix = `${optionName}=`
    if (currentArg.startsWith(prefix)) {
      return currentArg.slice(prefix.length)
    }

    return null
  }

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i]

    const baseUrlValue = getOptionValue("--baseUrl", arg, args[i + 1])
    if (baseUrlValue) {
      result.baseUrl = baseUrlValue
      if (arg === "--baseUrl") {
        i += 1
      }
      continue
    }

    const startPathValue = getOptionValue("--startPath", arg, args[i + 1])
    if (startPathValue) {
      result.startPath = startPathValue
      if (arg === "--startPath") {
        i += 1
      }
      continue
    }

  }

  return result
}

function parseBoolean(value, fallback) {
  if (typeof value !== "string") {
    return fallback
  }

  const normalized = value.trim().toLowerCase()
  if (["1", "true", "yes", "on"].includes(normalized)) return true
  if (["0", "false", "no", "off"].includes(normalized)) return false
  return fallback
}

function applyEnvOverrides(config) {
  const result = {
    ...config,
    phase1: {
      enabled: true,
      enforce: false,
      ...(config.phase1 || {})
    }
  }

  if (process.env.MONITOR_BASE_URL) {
    result.baseUrl = process.env.MONITOR_BASE_URL
  }

  if (process.env.MONITOR_START_PATH) {
    result.startPath = process.env.MONITOR_START_PATH
  }

  result.phase1.enabled = parseBoolean(process.env.MONITOR_PHASE1_ENABLED, Boolean(result.phase1.enabled))
  result.phase1.enforce = parseBoolean(process.env.MONITOR_PHASE1_ENFORCE, Boolean(result.phase1.enforce))

  return result
}

function normalizeStartPath(startPath) {
  if (!startPath) {
    return "/"
  }

  // Git Bash may rewrite absolute-like args into local installation paths.
  const normalized = startPath.replace(/^[A-Za-z]:\/Program Files\/Git\//, "/")

  if (normalized.startsWith("http://") || normalized.startsWith("https://")) {
    return normalized
  }

  return normalized.startsWith("/") ? normalized : `/${normalized}`
}

async function assertCriticalSelectors(page, selectors, state) {
  for (const selector of selectors) {
    const found = await page.$(selector)
    if (!found) {
      state.errors.push({
        kind: "missing-critical-element",
        message: `Elemento critico ausente: ${selector}`,
        at: new Date().toISOString()
      })
    }
  }
}

async function gotoWithRetry(page, url, options, maxAttempts = 3) {
  let lastError = null

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      await page.goto(url, options)
      return
    } catch (error) {
      lastError = error
      if (attempt < maxAttempts) {
        await page.waitForTimeout(1000 * attempt)
      }
    }
  }

  throw lastError
}

async function detectSentry(page) {
  try {
    return await page.evaluate(() => {
      const win = globalThis
      return Boolean(win && win.Sentry)
    })
  } catch {
    return false
  }
}

function asCheck(status, detail) {
  return { status, detail }
}

function evaluatePhase1(state, sentryDetected) {
  const hasFrontendError = state.errors.some((item) => item.kind === "console-error" || item.kind === "page-error")
  const hasPageError = state.errors.some((item) => item.kind === "page-error")
  const hasHttpError = state.errors.some((item) => item.kind === "http-error")
  const hasStackTrace = state.errors.some((item) => item.kind === "page-error" && item.stack)
  const hasHttpContext = state.httpContexts.length > 0
  const hasCorrelationId = state.httpContexts.some((item) => Boolean(item.requestId))

  const checks = {
    frontendTracking: sentryDetected
      ? asCheck("pass", "Sentry detectado no runtime do browser")
      : hasFrontendError
        ? asCheck("pass", "Erros de frontend foram capturados pelo monitor")
        : asCheck("warn", "Nao foi possivel confirmar Sentry nem capturar erro frontend nesta execucao"),
    stackTraces: hasPageError && !hasStackTrace
      ? asCheck("fail", "pageerror observado sem stack trace")
      : hasStackTrace
      ? asCheck("pass", "Stack trace de pageerror capturada")
      : asCheck("pass", "Nenhum pageerror observado nesta execucao"),
    requestContext: hasHttpError && !hasHttpContext
      ? asCheck("fail", "Erro HTTP observado sem contexto basico de request")
      : hasHttpContext
      ? asCheck("pass", "Contexto de request coletado (method/url/status)")
      : asCheck("pass", "Nenhum erro HTTP observado nesta execucao"),
    correlationId: hasHttpError && !hasCorrelationId
      ? asCheck("fail", "Erro HTTP observado sem x-request-id")
      : hasCorrelationId
      ? asCheck("pass", "x-request-id observado em respostas monitoradas")
      : asCheck("pass", "Nenhum erro HTTP observado para validar x-request-id")
  }

  const statuses = Object.values(checks).map((item) => item.status)
  const overall = statuses.includes("fail")
    ? "fail"
    : statuses.includes("warn")
      ? "warn"
      : "pass"

  return {
    enabled: true,
    overall,
    checks
  }
}

async function run() {
  const monitorRoot = path.resolve(__dirname, "..")   // monitor/
  const projectRoot = path.resolve(monitorRoot, "..") // project root
  const baseConfig = loadConfig(projectRoot)
  const withEnv = applyEnvOverrides(baseConfig)
  const config = applyCliOverrides(withEnv)
  const state = {
    errors: [],
    consoleLogs: [],
    httpContexts: []
  }

  const browser = await chromium.launch({
    headless: Boolean(config.headless),
    args: [
      "--disable-features=HttpsUpgrades,HttpsFirstBalancedModeAutoEnable",
      "--no-sandbox",
      "--disable-setuid-sandbox"
    ]
  })
  const context = await browser.newContext({ ignoreHTTPSErrors: true })
  const page = await context.newPage()

  attachMonitors(page, state, {
    maxHttpErrorsToCapture: config.maxHttpErrorsToCapture,
    ignoreConsoleErrorPatterns: config.ignoreConsoleErrorPatterns || []
  })

  const startPath = normalizeStartPath(config.startPath)
  const url = `${config.baseUrl}${startPath}`

  function logInfo(message, metadata = {}) {
    console.log(message)
    writeSystemLog(projectRoot, "info", message, metadata)
  }

  function logError(message, error) {
    console.error(message, error)
    writeSystemLog(projectRoot, "error", message, {
      error: error instanceof Error
        ? { message: error.message, stack: error.stack }
        : { value: String(error) }
    })
  }

  try {
    writeSystemLog(projectRoot, "info", "Iniciando execucao do monitor", {
      baseUrl: config.baseUrl,
      startPath,
      phase1Enabled: Boolean(config.phase1?.enabled),
      phase1Enforce: Boolean(config.phase1?.enforce)
    })

    await gotoWithRetry(page, url, {
      timeout: config.timeoutMs,
      waitUntil: "domcontentloaded"
    })

    if (config.waitAfterLoadMs > 0) {
      await page.waitForTimeout(config.waitAfterLoadMs)
    }

    await assertCriticalSelectors(page, config.criticalSelectors || [], state)

    const phase1 = config.phase1?.enabled
      ? evaluatePhase1(state, await detectSentry(page))
      : null

    const shouldCollectByPhase1 = Boolean(config.phase1?.enabled && config.phase1?.enforce && phase1?.overall === "fail")

    if (state.errors.length === 0 && !shouldCollectByPhase1) {
      logInfo("[monitor] Execucao concluida sem erros detectados")
      if (phase1) {
        logInfo(`[monitor] Phase 1 checks: ${phase1.overall}`, { phase1 })
      }
      return
    }

    const evidence = await collectEvidence(page, state, projectRoot)
    const reportContent = buildReport({
      url,
      errors: state.errors,
      phase1,
      requestContexts: state.httpContexts,
      evidence,
      rootDir: projectRoot
    })
    const reportPath = writeReport(projectRoot, evidence.stamp, reportContent)

    logInfo("[monitor] Erros detectados e evidencias coletadas", {
      reportPath,
      errorCount: state.errors.length,
      requestContextCount: state.httpContexts.length
    })
    logInfo(`[monitor] Report: ${reportPath}`)
  } catch (error) {
    logError("[monitor] Falha durante execucao:", error)
    process.exitCode = 1
  } finally {
    await browser.close()
  }
}

run()
