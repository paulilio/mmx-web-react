import { Injectable, Inject, Logger } from "@nestjs/common"
import { USER_REPOSITORY, type IUserRepository } from "../ports/user-repository.port"
import { type AuthUserView, toAuthUserView } from "../../domain/user.types"
import {
  validateRegisterInput,
  normalizeEmail,
  ensureEmailAvailable,
  type RegisterAuthInput,
} from "../../domain/auth-rules"
import { hashPassword } from "@/core/lib/server/security/password-hash"
import { RequestEmailVerificationUseCase } from "./request-email-verification.use-case"

export interface RegisterOutput {
  user: AuthUserView
  requiresEmailVerification: true
}

export interface RegisterContext {
  ipAddress?: string | null
}

@Injectable()
export class RegisterUseCase {
  private readonly logger = new Logger(RegisterUseCase.name)

  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepo: IUserRepository,
    private readonly requestEmailVerification: RequestEmailVerificationUseCase,
  ) {}

  async execute(input: RegisterAuthInput, context: RegisterContext = {}): Promise<RegisterOutput> {
    validateRegisterInput(input)

    const email = normalizeEmail(input.email)
    const existing = await this.userRepo.findByEmail(email)
    ensureEmailAvailable(existing)

    const passwordHash = await hashPassword(input.password)
    const user = await this.userRepo.create({
      email,
      passwordHash,
      firstName: input.firstName.trim(),
      lastName: input.lastName?.trim() ?? "",
      phone: input.phone ?? null,
      cpfCnpj: input.cpfCnpj ?? null,
      planType: "FREE",
    })

    // O cadastro não pode falhar por causa do email — o user já está criado.
    // Se o envio falhar, registramos no log e o usuário pode reenviar depois.
    try {
      await this.requestEmailVerification.execute({ userId: user.id, ipAddress: context.ipAddress ?? null })
    } catch (error) {
      const message = error instanceof Error ? error.message : "erro desconhecido"
      this.logger.warn(`Cadastro de ${email}: falha ao enviar email de verificação (${message}). Usuário criado; pedir reenvio.`)
    }

    return { user: toAuthUserView(user), requiresEmailVerification: true }
  }
}
