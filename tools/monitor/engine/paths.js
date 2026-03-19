const path = require("path")

function getRuntimeDir(projectRoot) {
  return path.join(projectRoot, "runtime", "monitor")
}

function getRuntimePaths(projectRoot, stamp) {
  const runtimeDir = getRuntimeDir(projectRoot)

  return {
    screenshotPath: path.join(runtimeDir, "artifacts", "screenshots", `error-${stamp}.png`),
    htmlPath: path.join(runtimeDir, "artifacts", "html", `error-${stamp}.html`),
    logPath: path.join(runtimeDir, "logs", "debug", `error-${stamp}.log`),
    reportPath: path.join(runtimeDir, "reports", "incidentes", `bug-${stamp}.md`)
  }
}

module.exports = {
  getRuntimeDir,
  getRuntimePaths
}