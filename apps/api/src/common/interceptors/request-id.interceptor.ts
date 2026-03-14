import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from "@nestjs/common"
import type { Observable } from "rxjs"
import type { Request, Response } from "express"
import { randomUUID } from "crypto"

@Injectable()
export class RequestIdInterceptor implements NestInterceptor {
  intercept(ctx: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = ctx.switchToHttp().getRequest<Request>()
    const res = ctx.switchToHttp().getResponse<Response>()
    const requestId = (req.headers["x-request-id"] as string | undefined) || randomUUID()
    res.setHeader("x-request-id", requestId)
    return next.handle()
  }
}
