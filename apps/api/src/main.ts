import "reflect-metadata"
import { NestFactory } from "@nestjs/core"
import cookieParser from "cookie-parser"
import { AppModule } from "./app.module"
import { ApiExceptionFilter } from "./common/filters/api-exception.filter"
import { EnvelopeInterceptor } from "./common/interceptors/envelope.interceptor"

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { logger: ["warn", "error", "log"] })

  app.use(cookieParser())

  app.useGlobalFilters(new ApiExceptionFilter())
  app.useGlobalInterceptors(new EnvelopeInterceptor())

  const port = Number(process.env.PORT ?? 4000)
  await app.listen(port)
  console.log(`[mmx-api] running on port ${port}`)
}

bootstrap()
