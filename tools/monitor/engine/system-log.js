const fs = require("fs")
const path = require("path")

function nowDateStamp() {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const dd = String(d.getDate()).padStart(2, "0")
  return `${yyyy}-${mm}-${dd}`
}

function writeSystemLog(projectRoot, level, message, metadata = {}) {
  try {
    const env = process.env.MMX_APP_ENV || process.env.NODE_ENV || "development"
    const dirPath = path.join(projectRoot, "runtime", "monitor", "logs", "system", env)
    fs.mkdirSync(dirPath, { recursive: true })

    const filePath = path.join(dirPath, `monitor-${nowDateStamp()}.log`)
    const event = {
      timestamp: new Date().toISOString(),
      level,
      service: "monitor",
      env,
      category: "system",
      message,
      metadata
    }

    fs.appendFileSync(filePath, `${JSON.stringify(event)}\n`, "utf8")
  } catch {
    // Intencional: logging nunca deve interromper o monitor
  }
}

module.exports = {
  writeSystemLog
}
