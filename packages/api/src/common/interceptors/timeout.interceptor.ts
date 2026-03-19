import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  RequestTimeoutException,
} from "@nestjs/common"
import type { Observable } from "rxjs"
import { timeout, catchError } from "rxjs/operators"
import { TimeoutError, throwError } from "rxjs"

const REQUEST_TIMEOUT_MS = 30_000

@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  intercept(_ctx: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      timeout(REQUEST_TIMEOUT_MS),
      catchError((err) => {
        if (err instanceof TimeoutError) {
          return throwError(
            () => new RequestTimeoutException("Tempo limite da requisição atingido"),
          )
        }
        return throwError(() => err)
      }),
    )
  }
}
