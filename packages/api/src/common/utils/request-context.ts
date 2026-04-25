import type { Request } from "express"

export interface RequestContext {
  userAgent: string | null
  ipAddress: string | null
}

export function extractRequestContext(req: Request): RequestContext {
  const userAgent = req.headers["user-agent"]?.toString().slice(0, 255) ?? null
  const forwarded = req.headers["x-forwarded-for"]
  const realIp = req.headers["x-real-ip"]
  let ipAddress: string | null = null
  if (typeof forwarded === "string" && forwarded.length > 0) {
    ipAddress = forwarded.split(",")[0]!.trim()
  } else if (Array.isArray(forwarded) && forwarded.length > 0) {
    ipAddress = forwarded[0]!
  } else if (typeof realIp === "string" && realIp.length > 0) {
    ipAddress = realIp
  } else {
    ipAddress = req.ip ?? req.socket?.remoteAddress ?? null
  }
  if (ipAddress) ipAddress = ipAddress.slice(0, 64)
  return { userAgent, ipAddress }
}
