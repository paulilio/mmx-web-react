import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from "@nestjs/common"
import type { Observable } from "rxjs"
import { map } from "rxjs/operators"

@Injectable()
export class EnvelopeInterceptor implements NestInterceptor {
  intercept(_ctx: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(map((data) => ({ data, error: null })))
  }
}
