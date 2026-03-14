const {
  classifyConsoleMessage,
  classifyPageError,
  classifyHttpResponse
} = require("./detector")

function attachMonitors(page, state, options = {}) {
  const maxHttpErrorsToCapture = options.maxHttpErrorsToCapture ?? 5
  const maxContexts = options.maxHttpErrorContexts ?? 20
  const ignoreConsoleErrorPatterns = options.ignoreConsoleErrorPatterns ?? []

  function shouldIgnoreConsoleError(message) {
    if (!ignoreConsoleErrorPatterns.length) {
      return false
    }

    return ignoreConsoleErrorPatterns.some((pattern) => {
      try {
        return new RegExp(pattern, "i").test(message)
      } catch {
        return false
      }
    })
  }

  page.on("console", (message) => {
    const event = classifyConsoleMessage(message)
    if (event) {
      if (shouldIgnoreConsoleError(event.message)) {
        state.consoleLogs.push(`[${event.at}] [console:ignored] ${event.message}`)
        return
      }

      state.errors.push(event)
      state.consoleLogs.push(`[${event.at}] [console:${message.type()}] ${event.message}`)
    } else {
      state.consoleLogs.push(`[${new Date().toISOString()}] [console:${message.type()}] ${message.text()}`)
    }
  })

  page.on("pageerror", (error) => {
    const event = classifyPageError(error)
    state.errors.push(event)
    state.consoleLogs.push(`[${event.at}] [pageerror] ${event.message}`)
    if (event.stack) {
      state.consoleLogs.push(event.stack)
    }
  })

  page.on("response", (response) => {
    const event = classifyHttpResponse(response)
    if (!event) {
      return
    }

    if (state.httpContexts.length < maxContexts) {
      state.httpContexts.push({
        at: event.at,
        method: event.method,
        url: event.url,
        status: event.status,
        requestId: event.requestId || null,
        contentType: event.contentType || null
      })
    }

    const currentHttpErrorCount = state.errors.filter((item) => item.kind === "http-error").length
    if (currentHttpErrorCount >= maxHttpErrorsToCapture) {
      return
    }

    state.errors.push(event)
    state.consoleLogs.push(
      `[${event.at}] [http-error] ${event.method} ${event.url} -> ${event.status} requestId=${event.requestId || "n/a"}`
    )
  })
}

module.exports = {
  attachMonitors
}
