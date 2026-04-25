import { Injectable, Inject } from "@nestjs/common"
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

    await this.requestEmailVerification.execute({ userId: user.id, ipAddress: context.ipAddress ?? null })

    return { user: toAuthUserView(user), requiresEmailVerification: true }
  }
}
