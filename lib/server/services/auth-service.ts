import {
  ensureEmailAvailable,
  normalizeEmail,
  validateLoginInput,
  validateRegisterInput,
  type LoginAuthInput,
  type RegisterAuthInput,
} from "../../domain/auth/auth-rules"
import type { UserRecord, UserRepository } from "../repositories/user-repository"
import { hashPassword, verifyPassword } from "../security/password-hash"

export interface AuthUserView {
  id: string
  email: string
  firstName: string
  lastName: string
  planType: "FREE" | "PREMIUM" | "PRO"
}

function toAuthUserView(user: UserRecord): AuthUserView {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    planType: user.planType,
  }
}

export class AuthService {
  constructor(private readonly userRepository: UserRepository) {}

  async register(input: RegisterAuthInput): Promise<AuthUserView> {
    validateRegisterInput(input)

    const email = normalizeEmail(input.email)
    const existingUser = await this.userRepository.findByEmail(email)
    ensureEmailAvailable(existingUser)

    const passwordHash = await hashPassword(input.password)

    const createdUser = await this.userRepository.create({
      email,
      passwordHash,
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      phone: input.phone ?? null,
      cpfCnpj: input.cpfCnpj ?? null,
      planType: "FREE",
    })

    return toAuthUserView(createdUser)
  }

  async login(input: LoginAuthInput): Promise<AuthUserView> {
    validateLoginInput(input)

    const email = normalizeEmail(input.email)
    const user = await this.userRepository.findByEmail(email)

    if (!user || !user.passwordHash) {
      throw new Error("Credenciais invalidas")
    }

    const isValidPassword = await verifyPassword(input.password, user.passwordHash)
    if (!isValidPassword) {
      throw new Error("Credenciais invalidas")
    }

    await this.userRepository.update(user.id, { lastLogin: new Date() })

    return toAuthUserView(user)
  }
}
