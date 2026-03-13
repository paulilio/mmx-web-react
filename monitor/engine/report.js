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

function buildReport({ url, errors, evidence, rootDir }) {
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
