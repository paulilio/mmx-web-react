import { beforeEach, describe, expect, it, vi } from "vitest"
import { AuthService } from "./auth-service"
import type { UserRepository } from "../repositories/user-repository"

const { passwordHashMock } = vi.hoisted(() => ({
  passwordHashMock: {
    hashPassword: vi.fn(),
    verifyPassword: vi.fn(),
  },
}))

vi.mock("../security/password-hash", () => passwordHashMock)

function createUserRepositoryMock() {
  return {
    findByEmail: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  }
}

describe("AuthService", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    passwordHashMock.hashPassword.mockResolvedValue("hashed-password")
    passwordHashMock.verifyPassword.mockResolvedValue(true)
  })

  it("registra usuario com senha em hash", async () => {
    const userRepository = createUserRepositoryMock()
    const service = new AuthService(userRepository as unknown as UserRepository)

    userRepository.findByEmail.mockResolvedValueOnce(null)
    userRepository.create.mockResolvedValueOnce({
      id: "u1",
      email: "user@email.com",
      firstName: "User",
      lastName: "Name",
      planType: "FREE",
    })

    const result = await service.register({
      email: " user@email.com ",
      password: "Senha@123",
      firstName: "User",
      lastName: "Name",
    })

    expect(result.email).toBe("user@email.com")
    expect(passwordHashMock.hashPassword).toHaveBeenCalledWith("Senha@123")
    expect(userRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        passwordHash: "hashed-password",
      }),
    )
  })

  it("falha registro com email duplicado", async () => {
    const userRepository = createUserRepositoryMock()
    const service = new AuthService(userRepository as unknown as UserRepository)

    userRepository.findByEmail.mockResolvedValueOnce({ id: "u1" })

    await expect(
      service.register({
        email: "user@email.com",
        password: "Senha@123",
        firstName: "User",
        lastName: "Name",
      }),
    ).rejects.toThrow("Email ja esta em uso")
  })

  it("realiza login e atualiza lastLogin", async () => {
    const userRepository = createUserRepositoryMock()
    const service = new AuthService(userRepository as unknown as UserRepository)

    userRepository.findByEmail.mockResolvedValueOnce({
      id: "u1",
      email: "user@email.com",
      passwordHash: "hashed-password",
      firstName: "User",
      lastName: "Name",
      planType: "FREE",
    })
    userRepository.update.mockResolvedValueOnce({})

    const result = await service.login({
      email: "user@email.com",
      password: "Senha@123",
    })

    expect(result.id).toBe("u1")
    expect(passwordHashMock.verifyPassword).toHaveBeenCalledWith("Senha@123", "hashed-password")
    expect(userRepository.update).toHaveBeenCalledWith("u1", expect.objectContaining({ lastLogin: expect.any(Date) }))
  })

  it("falha login com senha invalida", async () => {
    const userRepository = createUserRepositoryMock()
    const service = new AuthService(userRepository as unknown as UserRepository)

    userRepository.findByEmail.mockResolvedValueOnce({
      id: "u1",
      email: "user@email.com",
      passwordHash: "hashed-password",
      firstName: "User",
      lastName: "Name",
      planType: "FREE",
    })
    passwordHashMock.verifyPassword.mockResolvedValueOnce(false)

    await expect(
      service.login({
        email: "user@email.com",
        password: "senha-errada",
      }),
    ).rejects.toThrow("Credenciais invalidas")
  })
})
