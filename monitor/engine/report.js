const fs = require("fs")
const path = require("path")

function toProjectRelative(filePath, rootDir) {
  return path.relative(rootDir, filePath).split("\\").join("/")
}

function formatMainError(errors) {
  if (!errors.length) {
    return "Nenhum erro capturado"
  }

  const first = errors[0]
  if (first.kind === "http-error") {
    return `${first.method} ${first.url} -> ${first.status}`
  }

  return first.message || "Erro sem mensagem"
}

function formatPhase1Section(phase1) {
  if (!phase1) {
    return ["## Phase 1 Checklist", "", "Nao habilitado nesta execucao", ""]
  }

  const rows = [
    `Status geral: ${phase1.overall}`,
    "",
    "Checks:",
    `- frontend tracking: ${phase1.checks.frontendTracking.status} - ${phase1.checks.frontendTracking.detail}`,
    `- stack traces: ${phase1.checks.stackTraces.status} - ${phase1.checks.stackTraces.detail}`,
    `- request context: ${phase1.checks.requestContext.status} - ${phase1.checks.requestContext.detail}`,
    `- correlation id: ${phase1.checks.correlationId.status} - ${phase1.checks.correlationId.detail}`,
    ""
  ]

  return ["## Phase 1 Checklist", "", ...rows]
}

function formatRequestContextSection(requestContexts) {
  const lines = requestContexts.map((item, index) => {
    return `${index + 1}. [${item.at}] ${item.method} ${item.url} -> ${item.status} requestId=${item.requestId || "n/a"}`
  })

  return [
    "## Request Context",
    "",
    ...(lines.length ? lines : ["Nenhum contexto HTTP capturado"]),
    ""
  ]
}

function buildReport({ url, errors, phase1, requestContexts = [], evidence, rootDir }) {
  const reportDate = new Date().toISOString()
  const screenshotRel = toProjectRelative(evidence.screenshotPath, rootDir)
  const htmlRel = toProjectRelative(evidence.htmlPath, rootDir)
  const logRel = toProjectRelative(evidence.logPath, rootDir)

  const errorLines = errors.map((err, index) => {
    if (err.kind === "http-error") {
      return `${index + 1}. [http-error] ${err.method} ${err.url} -> ${err.status}`
    }

    return `${index + 1}. [${err.kind}] ${err.message}`
  })

  return [
    "# Bug Report",
    "",
    `Date: ${reportDate}`,
    `URL: ${url}`,
    "",
    "## Error",
    "",
    formatMainError(errors),
    "",
    "## Errors Capturados",
    "",
    ...(errorLines.length ? errorLines : ["Nenhum erro capturado"]),
    "",
    ...formatPhase1Section(phase1),
    ...formatRequestContextSection(requestContexts),
    "## Screenshot",
    "",
    screenshotRel,
    "",
    "## HTML",
    "",
    htmlRel,
    "",
    "## Console Logs",
    "",
    logRel,
    ""
  ].join("\n")
}

function writeReport(rootDir, stamp, content) {
  const reportPath = path.join(rootDir, "reports", "incidentes", `bug-${stamp}.md`)
  fs.mkdirSync(path.dirname(reportPath), { recursive: true })
  fs.writeFileSync(reportPath, content, "utf8")
  return reportPath
}

module.exports = {
  buildReport,
  writeReport
}
