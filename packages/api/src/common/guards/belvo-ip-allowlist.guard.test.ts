import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { UnauthorizedException, type ExecutionContext } from "@nestjs/common"
import { BelvoIpAllowlistGuard } from "./belvo-ip-allowlist.guard"
import type { Request } from "express"

function makeContext(req: Partial<Request>): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => req as Request,
    }),
  } as unknown as ExecutionContext
}

const ORIGINAL = process.env.BELVO_WEBHOOK_IPS

describe("BelvoIpAllowlistGuard", () => {
  beforeEach(() => {
    delete process.env.BELVO_WEBHOOK_IPS
  })
  afterEach(() => {
    if (ORIGINAL === undefined) delete process.env.BELVO_WEBHOOK_IPS
    else process.env.BELVO_WEBHOOK_IPS = ORIGINAL
  })

  it("passa quando allowlist vazio (env undefined)", () => {
    const guard = new BelvoIpAllowlistGuard()
    const ctx = makeContext({ headers: {}, ip: "9.9.9.9" })
    expect(guard.canActivate(ctx)).toBe(true)
  })

  it("passa quando allowlist é só whitespace", () => {
    process.env.BELVO_WEBHOOK_IPS = "  ,  "
    const guard = new BelvoIpAllowlistGuard()
    const ctx = makeContext({ headers: {}, ip: "9.9.9.9" })
    expect(guard.canActivate(ctx)).toBe(true)
  })

  it("permite IP listado via X-Forwarded-For (primeiro IP)", () => {
    process.env.BELVO_WEBHOOK_IPS = "1.2.3.4,5.6.7.8"
    const guard = new BelvoIpAllowlistGuard()
    const ctx = makeContext({
      headers: { "x-forwarded-for": "1.2.3.4, 10.0.0.1" },
      ip: "10.0.0.1",
    })
    expect(guard.canActivate(ctx)).toBe(true)
  })

  it("recusa IP não listado", () => {
    process.env.BELVO_WEBHOOK_IPS = "1.2.3.4"
    const guard = new BelvoIpAllowlistGuard()
    const ctx = makeContext({
      headers: { "x-forwarded-for": "9.9.9.9" },
      ip: "9.9.9.9",
    })
    expect(() => guard.canActivate(ctx)).toThrow(UnauthorizedException)
  })

  it("recusa quando não há header forwarded e req.ip não bate", () => {
    process.env.BELVO_WEBHOOK_IPS = "1.2.3.4"
    const guard = new BelvoIpAllowlistGuard()
    const ctx = makeContext({ headers: {}, ip: "9.9.9.9" })
    expect(() => guard.canActivate(ctx)).toThrow(UnauthorizedException)
  })

  it("aceita via x-real-ip quando x-forwarded-for ausente", () => {
    process.env.BELVO_WEBHOOK_IPS = "1.2.3.4"
    const guard = new BelvoIpAllowlistGuard()
    const ctx = makeContext({
      headers: { "x-real-ip": "1.2.3.4" },
      ip: "10.0.0.1",
    })
    expect(guard.canActivate(ctx)).toBe(true)
  })
})
