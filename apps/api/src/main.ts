import "reflect-metadata"
import { NestFactory } from "@nestjs/core"
import { ValidationPipe } from "@nestjs/common"
import cookieParser = require("cookie-parser")
import { AppModule } from "./app.module"
import { ApiExceptionFilter } from "./common/filters/api-exception.filter"
import { EnvelopeInterceptor } from "./common/interceptors/envelope.interceptor"
import { RequestIdInterceptor } from "./common/interceptors/request-id.interceptor"
import { TimeoutInterceptor } from "./common/interceptors/timeout.interceptor"

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { logger: ["warn", "error", "log"] })

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
    new EnvelopeInterceptor(),
    new TimeoutInterceptor(),
  )

  const port = Number(process.env.PORT ?? 4000)
  await app.listen(port)
  console.log(`[mmx-api] running on port ${port}`)
}

bootstrap()
