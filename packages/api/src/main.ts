import "reflect-metadata"
import { NestFactory } from "@nestjs/core"
import { ValidationPipe } from "@nestjs/common"
import cookieParser = require("cookie-parser")
import { AppModule } from "./app.module"
import { ApiExceptionFilter } from "./common/filters/api-exception.filter"
import { EnvelopeInterceptor } from "./common/interceptors/envelope.interceptor"
import { RequestIdInterceptor } from "./common/interceptors/request-id.interceptor"
import { RequestLoggingInterceptor } from "./common/interceptors/request-logging.interceptor"
import { TimeoutInterceptor } from "./common/interceptors/timeout.interceptor"
import { RuntimeFileLoggerService } from "./common/logging/runtime-file-logger.service"

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: false,
    bufferLogs: true,
  })

  app.useLogger(new RuntimeFileLoggerService())

  app.use(cookieParser())

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  )

  app.useGlobalFilters(new ApiExceptionFilter())

  app.useGlobalInterceptors(
    new RequestIdInterceptor(),
    new RequestLoggingInterceptor(),
    new EnvelopeInterceptor(),
    new TimeoutInterceptor(),
  )

  const port = Number(process.env.PORT ?? 4000)
  await app.listen(port)
  console.log(`[mmx-api] running on port ${port}`)
}

bootstrap()
