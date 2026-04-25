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

@Injectable()
export class RegisterUseCase {
  constructor(@Inject(USER_REPOSITORY) private readonly userRepo: IUserRepository) {}

  async execute(input: RegisterAuthInput): Promise<AuthUserView> {
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

    return toAuthUserView(user)
  }
}
