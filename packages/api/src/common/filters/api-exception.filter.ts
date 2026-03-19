import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from "@nestjs/common"
import type { Response } from "express"

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const res = ctx.getResponse<Response>()

    if (exception instanceof HttpException) {
      const status = exception.getStatus()
      const body = exception.getResponse()

      // If already in envelope format, pass through
      if (typeof body === "object" && body !== null && "error" in body) {
        res.status(status).json(body)
        return
      }

      // Wrap NestJS built-in errors
      const message = typeof body === "string" ? body : (body as { message?: string }).message ?? "Erro interno"
      res.status(status).json({ data: null, error: { code: "HTTP_ERROR", message } })
      return
    }

    // Custom errors thrown by controllers/services using { status, code, message }
    if (exception instanceof Error) {
      const custom = exception as Error & { status?: number; code?: string }
      if (custom.status) {
        res.status(custom.status).json({
          data: null,
          error: {
            code: custom.code ?? "HTTP_ERROR",
            message: custom.message || "Erro interno",
          },
        })
        return
      }
    }

    // Unexpected errors
    const message = exception instanceof Error ? exception.message : "Erro interno do servidor"
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      data: null,
      error: { code: "INTERNAL_ERROR", message },
    })
  }
}
