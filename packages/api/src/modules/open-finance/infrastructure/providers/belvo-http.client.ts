export interface BelvoHttpClientOptions {
  host: string
  secretId: string
  secretPassword: string
  fetchImpl?: typeof fetch
}

export class BelvoHttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly path: string,
    public readonly body: unknown,
  ) {
    super(`Belvo ${status} on ${path}`)
    this.name = "BelvoHttpError"
  }
}

export class BelvoHttpClient {
  private readonly fetchImpl: typeof fetch

  constructor(private readonly opts: BelvoHttpClientOptions) {
    this.fetchImpl = opts.fetchImpl ?? globalThis.fetch
    if (!this.fetchImpl) throw new Error("fetch impl not available")
    if (!opts.host?.trim()) throw new Error("BelvoHttpClient: host is required")
    if (!opts.secretId?.trim()) throw new Error("BelvoHttpClient: secretId is required")
    if (!opts.secretPassword?.trim()) throw new Error("BelvoHttpClient: secretPassword is required")
  }

  private authHeader(): string {
    return "Basic " + Buffer.from(`${this.opts.secretId}:${this.opts.secretPassword}`).toString("base64")
  }

  async request<T>(method: "GET" | "POST" | "DELETE", path: string, body?: unknown): Promise<T> {
    const url = `${this.opts.host}${path}`
    const init: RequestInit = {
      method,
      headers: {
        Authorization: this.authHeader(),
        "Content-Type": "application/json",
      },
    }
    if (body !== undefined) init.body = JSON.stringify(body)
    const response = await this.fetchImpl(url, init)
    const text = await response.text()
    let parsed: unknown = null
    if (text) {
      try {
        parsed = JSON.parse(text)
      } catch {
        parsed = text
      }
    }
    if (!response.ok) throw new BelvoHttpError(response.status, path, parsed)
    return parsed as T
  }

  async getAllPages<T>(path: string, queryString = ""): Promise<T[]> {
    const items: T[] = []
    let next: string | null = `${path}${queryString}`
    while (next) {
      const page: { results?: T[]; next?: string | null } = await this.request("GET", next)
      if (page.results) items.push(...page.results)
      else if (Array.isArray(page)) items.push(...(page as T[]))
      next = page.next ?? null
      if (next?.startsWith(this.opts.host)) {
        next = next.slice(this.opts.host.length)
      }
    }
    return items
  }
}
