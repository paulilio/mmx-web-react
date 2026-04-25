import { Module } from "@nestjs/common"
import { USER_REPOSITORY } from "./application/ports/user-repository.port"
import { REFRESH_SESSION_REPOSITORY } from "./application/ports/refresh-session-repository.port"
import { ONE_TIME_TOKEN_REPOSITORY } from "./application/ports/one-time-token-repository.port"
import { OAUTH_ACCOUNT_REPOSITORY } from "./application/ports/oauth-account-repository.port"
import { EMAIL_SERVICE } from "./application/ports/email-service.port"
import { PrismaUserRepository } from "./infrastructure/repositories/prisma-user.repository"
import { PrismaRefreshSessionRepository } from "./infrastructure/repositories/prisma-refresh-session.repository"
import { PrismaOneTimeTokenRepository } from "./infrastructure/repositories/prisma-one-time-token.repository"
import { PrismaOAuthAccountRepository } from "./infrastructure/repositories/prisma-oauth-account.repository"
import { SmtpEmailService } from "./infrastructure/email/email.service"
import { RegisterUseCase } from "./application/use-cases/register.use-case"
import { LoginUseCase } from "./application/use-cases/login.use-case"
import { RefreshSessionUseCase } from "./application/use-cases/refresh-session.use-case"
import { LogoutUseCase } from "./application/use-cases/logout.use-case"
import { LogoutAllUseCase } from "./application/use-cases/logout-all.use-case"
import { GetCurrentUserUseCase } from "./application/use-cases/get-current-user.use-case"
import { RequestEmailVerificationUseCase } from "./application/use-cases/request-email-verification.use-case"
import { VerifyEmailUseCase } from "./application/use-cases/verify-email.use-case"
import { ForgotPasswordUseCase } from "./application/use-cases/forgot-password.use-case"
import { ResetPasswordUseCase } from "./application/use-cases/reset-password.use-case"
import { HandleOAuthCallbackUseCase } from "./application/use-cases/handle-oauth-callback.use-case"
import { AuthController } from "./auth.controller"
import { MeController } from "./me.controller"
import { EmailRecoveryController } from "./email-recovery.controller"
import { GoogleOAuthController } from "./oauth/google-oauth.controller"
import { MicrosoftOAuthController } from "./oauth/microsoft-oauth.controller"
import { SessionsController } from "./sessions.controller"
import { SESSION_REPOSITORY } from "./application/ports/session-repository.port"
import { PrismaSessionRepository } from "./infrastructure/repositories/prisma-session.repository"
import { ListSessionsUseCase } from "./application/use-cases/list-sessions.use-case"
import { RevokeSessionUseCase } from "./application/use-cases/revoke-session.use-case"
import { RevokeAllExceptUseCase } from "./application/use-cases/revoke-all-except.use-case"
import { TokenBlacklistService } from "@/infrastructure/redis/token-blacklist.service"
import { AuditLogService } from "@/infrastructure/redis/audit-log.service"
import { RedisModule } from "@/infrastructure/redis/redis.module"

@Module({
  imports: [RedisModule],
  controllers: [
    AuthController,
    MeController,
    EmailRecoveryController,
    GoogleOAuthController,
    MicrosoftOAuthController,
    SessionsController,
  ],
  providers: [
    { provide: USER_REPOSITORY, useClass: PrismaUserRepository },
    { provide: REFRESH_SESSION_REPOSITORY, useClass: PrismaRefreshSessionRepository },
    { provide: SESSION_REPOSITORY, useClass: PrismaSessionRepository },
    { provide: ONE_TIME_TOKEN_REPOSITORY, useClass: PrismaOneTimeTokenRepository },
    { provide: OAUTH_ACCOUNT_REPOSITORY, useClass: PrismaOAuthAccountRepository },
    { provide: EMAIL_SERVICE, useClass: SmtpEmailService },
    RegisterUseCase,
    LoginUseCase,
    RefreshSessionUseCase,
    LogoutUseCase,
    LogoutAllUseCase,
    GetCurrentUserUseCase,
    RequestEmailVerificationUseCase,
    VerifyEmailUseCase,
    ForgotPasswordUseCase,
    ResetPasswordUseCase,
    HandleOAuthCallbackUseCase,
    ListSessionsUseCase,
    RevokeSessionUseCase,
    RevokeAllExceptUseCase,
    AuditLogService,
    TokenBlacklistService,
  ],
})
export class AuthModule {}
