const path = require("path")

function getRuntimeDir(rootDir) {
  return path.join(rootDir, "runtime")
}

function getRuntimePaths(rootDir, stamp) {
  const runtimeDir = getRuntimeDir(rootDir)

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