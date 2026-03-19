function isHttpErrorStatus(status) {
  return status >= 400
}

function classifyConsoleMessage(message) {
  const type = message.type()
  const text = message.text()

  if (type === "error") {
    return {
      kind: "console-error",
      message: text,
      at: new Date().toISOString()
    }
  }

  return null
}

function classifyPageError(error) {
  return {
    kind: "page-error",
    message: error?.message || String(error),
    stack: error?.stack || null,
    at: new Date().toISOString()
  }
}

function classifyHttpResponse(response) {
  const status = response.status()

  if (!isHttpErrorStatus(status)) {
    return null
  }

  const headers = response.headers()

  return {
    kind: "http-error",
    status,
    method: response.request().method(),
    url: response.url(),
    requestId: headers["x-request-id"] || null,
    contentType: headers["content-type"] || null,
    at: new Date().toISOString()
  }
}

module.exports = {
  classifyConsoleMessage,
  classifyPageError,
  classifyHttpResponse
}
