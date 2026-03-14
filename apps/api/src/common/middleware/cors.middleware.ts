import { Injectable, NestMiddleware } from "@nestjs/common"
import type { Request, Response, NextFunction } from "express"
import {
  evaluateCorsRequest,
  resolveCorsOriginMatrix,
  resolveRuntimeEnvironment,
} from "@/core/lib/server/security/cors"

const environment = resolveRuntimeEnvironment()
const originMatrix = resolveCorsOriginMatrix()

@Injectable()
export class CorsMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const decision = evaluateCorsRequest({
      method: req.method,
      origin: req.headers.origin ?? null,
      requestHeaders: req.headers["access-control-request-headers"] as string | null,
      environment,
      originMatrix,
    })

    for (const [header, value] of Object.entries(decision.headers)) {
      res.setHeader(header, value)
    }

    if (req.method === "OPTIONS") {
      res.status(decision.allowed ? 204 : 403).end()
      return
    }

    if (!decision.allowed) {
      res.status(403).json({ data: null, error: { code: "CORS_REJECTED", message: "Origin not allowed" } })
      return
    }

    next()
  }
}
