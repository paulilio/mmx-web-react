export interface RegisterAuthInput {
  email: string
  password: string
  firstName: string
  lastName?: string
  phone?: string
  cpfCnpj?: string
}

export interface LoginAuthInput {
  email: string
  password: string
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

export function validateEmail(email: string): void {
  const normalizedEmail = normalizeEmail(email)

  if (!normalizedEmail) {
    throw new Error("Email e obrigatorio")
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(normalizedEmail)) {
    throw new Error("Email invalido")
  }
}

export function validatePassword(password: string): void {
  if (!password) {
    throw new Error("Senha e obrigatoria")
  }

  if (password.length < 8) {
    throw new Error("Senha deve ter no minimo 8 caracteres")
  }
}

export function validateRegisterInput(input: RegisterAuthInput): void {
  validateEmail(input.email)
  validatePassword(input.password)

  if (!input.firstName?.trim()) {
    throw new Error("Nome e obrigatorio")
  }
}

export function validateLoginInput(input: LoginAuthInput): void {
  validateEmail(input.email)

  if (!input.password) {
    throw new Error("Senha e obrigatoria")
  }
}

export function ensureEmailAvailable(existingUser: unknown): void {
  if (existingUser) {
    throw new Error("Email ja esta em uso")
  }
}
