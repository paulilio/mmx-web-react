import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from "@nestjs/common"
import { Observable } from "rxjs"
import { tap } from "rxjs/operators"

@Injectable()
export class RequestLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger("HttpRequest")

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== "http") {
      return next.handle()
    }

    const req = context.switchToHttp().getRequest<{
      method: string
      originalUrl?: string
      url: string
      requestId?: string
    }>()
    const res = context.switchToHttp().getResponse<{ statusCode: number }>()
    const startedAt = Date.now()

    return next.handle().pipe(
      tap({
        next: () => {
          const durationMs = Date.now() - startedAt
          this.logger.log(
            `${req.method} ${req.originalUrl || req.url} -> ${res.statusCode} ${durationMs}ms requestId=${req.requestId || "n/a"}`,
          )
        },
        error: (error: unknown) => {
          const durationMs = Date.now() - startedAt
          const detail = error instanceof Error ? error.message : String(error)
          this.logger.error(
            `${req.method} ${req.originalUrl || req.url} -> ${res.statusCode} ${durationMs}ms requestId=${req.requestId || "n/a"} error=${detail}`,
          )
        },
      }),
    )
  }
}
