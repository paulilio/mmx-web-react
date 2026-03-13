const {
  classifyConsoleMessage,
  classifyPageError,
  classifyHttpResponse
} = require("./detector")

function attachMonitors(page, state, options = {}) {
  const maxHttpErrorsToCapture = options.maxHttpErrorsToCapture ?? 5

  page.on("console", (message) => {
    const event = classifyConsoleMessage(message)
    if (event) {
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

    const currentHttpErrorCount = state.errors.filter((item) => item.kind === "http-error").length
    if (currentHttpErrorCount >= maxHttpErrorsToCapture) {
      return
    }

    state.errors.push(event)
    state.consoleLogs.push(
      `[${event.at}] [http-error] ${event.method} ${event.url} -> ${event.status}`
    )
  })
}

module.exports = {
  attachMonitors
}
