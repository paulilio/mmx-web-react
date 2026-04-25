import { Injectable, Inject } from "@nestjs/common"
import { USER_REPOSITORY, type IUserRepository } from "../ports/user-repository.port"
import { type AuthUserView, toAuthUserView } from "../../domain/user.types"

@Injectable()
export class GetCurrentUserUseCase {
  constructor(@Inject(USER_REPOSITORY) private readonly userRepo: IUserRepository) {}

  async execute(userId: string): Promise<AuthUserView & { isEmailConfirmed: boolean }> {
    const user = await this.userRepo.findById(userId)
    if (!user) {
      throw Object.assign(new Error("Usuário não encontrado"), { status: 404, code: "USER_NOT_FOUND" })
    }
    return { ...toAuthUserView(user), isEmailConfirmed: user.isEmailConfirmed }
  }
}
