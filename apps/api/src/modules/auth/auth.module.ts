import { Module } from "@nestjs/common"
import { USER_REPOSITORY } from "./application/ports/user-repository.port"
import { PrismaUserRepository } from "./infrastructure/repositories/prisma-user.repository"
import { RegisterUseCase } from "./application/use-cases/register.use-case"
import { LoginUseCase } from "./application/use-cases/login.use-case"
import { RefreshSessionUseCase } from "./application/use-cases/refresh-session.use-case"
import { LogoutUseCase } from "./application/use-cases/logout.use-case"
import { HandleOAuthCallbackUseCase } from "./application/use-cases/handle-oauth-callback.use-case"
import { AuthController } from "./auth.controller"
import { GoogleOAuthController } from "./oauth/google-oauth.controller"
import { MicrosoftOAuthController } from "./oauth/microsoft-oauth.controller"

@Module({
  controllers: [AuthController, GoogleOAuthController, MicrosoftOAuthController],
  providers: [
    { provide: USER_REPOSITORY, useClass: PrismaUserRepository },
    RegisterUseCase,
    LoginUseCase,
    RefreshSessionUseCase,
    LogoutUseCase,
    HandleOAuthCallbackUseCase,
  ],
})
export class AuthModule {}
