import type { UserRecord, CreateUserInput, UpdateUserInput } from "../../domain/user.types"

export const USER_REPOSITORY = Symbol("IUserRepository")

export interface IUserRepository {
  findById(id: string): Promise<UserRecord | null>
  findByEmail(email: string): Promise<UserRecord | null>
  create(data: CreateUserInput): Promise<UserRecord>
  update(id: string, data: UpdateUserInput): Promise<UserRecord>
}
