const fs = require("fs")
const path = require("path")

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true })
}

function nowStamp() {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const dd = String(d.getDate()).padStart(2, "0")
  const hh = String(d.getHours()).padStart(2, "0")
  const mi = String(d.getMinutes()).padStart(2, "0")
  const ss = String(d.getSeconds()).padStart(2, "0")
  return `${yyyy}${mm}${dd}-${hh}${mi}${ss}`
}

async function collectEvidence(page, state, rootDir) {
  const stamp = nowStamp()
  const screenshotPath = path.join(rootDir, "artifacts", "screenshots", `error-${stamp}.png`)
  const htmlPath = path.join(rootDir, "artifacts", "html", `error-${stamp}.html`)
  const logPath = path.join(rootDir, "logs", "debug", `error-${stamp}.log`)

  ensureDir(path.dirname(screenshotPath))
  ensureDir(path.dirname(htmlPath))
  ensureDir(path.dirname(logPath))

  await page.screenshot({ path: screenshotPath, fullPage: true })
  const html = await page.content()
  fs.writeFileSync(htmlPath, html, "utf8")
  fs.writeFileSync(logPath, state.consoleLogs.join("\n"), "utf8")

  return {
    stamp,
    screenshotPath,
    htmlPath,
    logPath
  }
}

module.exports = {
  collectEvidence,
  nowStamp
}
