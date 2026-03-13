const fs = require("fs")
const path = require("path")
const { chromium } = require(require.resolve("playwright", { paths: [process.cwd()] }))
const { attachMonitors } = require("./monitor")
const { collectEvidence } = require("./evidence")
const { buildReport, writeReport } = require("./report")

function loadConfig(projectRoot) {
  const configPath = path.join(projectRoot, "config", "monitor.config.json")
  const raw = fs.readFileSync(configPath, "utf8")
  return JSON.parse(raw)
}

function applyCliOverrides(config) {
  const args = process.argv.slice(2)
  const result = { ...config }

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i]
    if (arg === "--baseUrl" && args[i + 1]) {
      result.baseUrl = args[i + 1]
      i += 1
      continue
    }

    if (arg === "--startPath" && args[i + 1]) {
      result.startPath = args[i + 1]
      i += 1
    }
  }

  return result
}

function normalizeStartPath(startPath) {
  if (!startPath) {
    return "/"
  }

  if (startPath.startsWith("http://") || startPath.startsWith("https://")) {
    return startPath
  }

  return startPath.startsWith("/") ? startPath : `/${startPath}`
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

async function run() {
  const rootDir = path.resolve(__dirname, "..")       // monitor/
  const projectRoot = path.resolve(rootDir, "..")    // project root
  const baseConfig = loadConfig(projectRoot)
  const config = applyCliOverrides(baseConfig)
  const state = {
    errors: [],
    consoleLogs: []
  }

  const browser = await chromium.launch({ headless: Boolean(config.headless) })
  const context = await browser.newContext()
  const page = await context.newPage()

  attachMonitors(page, state, {
    maxHttpErrorsToCapture: config.maxHttpErrorsToCapture
  })

  const startPath = normalizeStartPath(config.startPath)
  const url = `${config.baseUrl}${startPath}`

  try {
    await page.goto(url, {
      timeout: config.timeoutMs,
      waitUntil: "domcontentloaded"
    })

    if (config.waitAfterLoadMs > 0) {
      await page.waitForTimeout(config.waitAfterLoadMs)
    }

    await assertCriticalSelectors(page, config.criticalSelectors || [], state)

    if (state.errors.length === 0) {
      console.log("[monitor] Execucao concluida sem erros detectados")
      return
    }

    const evidence = await collectEvidence(page, state, rootDir)
    const reportContent = buildReport({
      url,
      errors: state.errors,
      evidence,
      rootDir
    })
    const reportPath = writeReport(rootDir, evidence.stamp, reportContent)

    console.log("[monitor] Erros detectados e evidencias coletadas")
    console.log(`[monitor] Report: ${reportPath}`)
  } catch (error) {
    console.error("[monitor] Falha durante execucao:", error)
    process.exitCode = 1
  } finally {
    await browser.close()
  }
}

run()
