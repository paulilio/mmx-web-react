export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

export function validateEmail(email: string): ValidationResult {
  const errors: string[] = []

  if (!email) {
    errors.push("Email é obrigatório")
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      errors.push("Email deve ter um formato válido")
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export function validatePassword(password: string): ValidationResult {
  const errors: string[] = []

  if (!password) {
    errors.push("Senha é obrigatória")
    return { isValid: false, errors }
  }

  if (password.length < 8) {
    errors.push("Senha deve ter pelo menos 8 caracteres")
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Senha deve conter pelo menos uma letra maiúscula")
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Senha deve conter pelo menos uma letra minúscula")
  }

  if (!/\d/.test(password)) {
    errors.push("Senha deve conter pelo menos um número")
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push("Senha deve conter pelo menos um caractere especial")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export function validatePhone(phone: string): ValidationResult {
  const errors: string[] = []

  if (!phone) {
    errors.push("Telefone é obrigatório")
    return { isValid: false, errors }
  }

  // Remove all non-digits
  const digitsOnly = phone.replace(/\D/g, "")

  if (digitsOnly.length < 10 || digitsOnly.length > 11) {
    errors.push("Telefone deve ter 10 ou 11 dígitos")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export function validateCpfCnpj(cpfCnpj: string): ValidationResult {
  const errors: string[] = []

  if (!cpfCnpj) {
    errors.push("CPF/CNPJ é obrigatório")
    return { isValid: false, errors }
  }

  // Remove all non-digits
  const digitsOnly = cpfCnpj.replace(/\D/g, "")

  if (digitsOnly.length === 11) {
    // CPF validation
    if (!isValidCpf(digitsOnly)) {
      errors.push("CPF inválido")
    }
  } else if (digitsOnly.length === 14) {
    // CNPJ validation
    if (!isValidCnpj(digitsOnly)) {
      errors.push("CNPJ inválido")
    }
  } else {
    errors.push("CPF deve ter 11 dígitos ou CNPJ deve ter 14 dígitos")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

function isValidCpf(cpf: string): boolean {
  // Basic CPF validation with check digits
  if (cpf.length !== 11) return false

  // Check for known invalid patterns
  if (/^(\d)\1{10}$/.test(cpf)) return false

  // Calculate first check digit
  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += Number.parseInt(cpf.charAt(i) || "0") * (10 - i)
  }
  let remainder = sum % 11
  const checkDigit1 = remainder < 2 ? 0 : 11 - remainder

  if (Number.parseInt(cpf.charAt(9) || "0") !== checkDigit1) return false

  // Calculate second check digit
  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += Number.parseInt(cpf.charAt(i) || "0") * (11 - i)
  }
  remainder = sum % 11
  const checkDigit2 = remainder < 2 ? 0 : 11 - remainder

  return Number.parseInt(cpf.charAt(10) || "0") === checkDigit2
}

function isValidCnpj(cnpj: string): boolean {
  // Basic CNPJ validation with check digits
  if (cnpj.length !== 14) return false

  // Check for known invalid patterns
  if (/^(\d)\1{13}$/.test(cnpj)) return false

  // Calculate first check digit
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  let sum = 0
  for (let i = 0; i < 12; i++) {
    sum += Number.parseInt(cnpj.charAt(i) || "0") * (weights1[i] || 0)
  }
  let remainder = sum % 11
  const checkDigit1 = remainder < 2 ? 0 : 11 - remainder

  if (Number.parseInt(cnpj.charAt(12) || "0") !== checkDigit1) return false

  // Calculate second check digit
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  sum = 0
  for (let i = 0; i < 13; i++) {
    sum += Number.parseInt(cnpj.charAt(i) || "0") * (weights2[i] || 0)
  }
  remainder = sum % 11
  const checkDigit2 = remainder < 2 ? 0 : 11 - remainder

  return Number.parseInt(cnpj.charAt(13) || "0") === checkDigit2
}

export function formatPhone(phone: string): string {
  const digitsOnly = phone.replace(/\D/g, "")

  if (digitsOnly.length <= 10) {
    // Format as (XX) XXXX-XXXX
    return digitsOnly.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3")
  } else {
    // Format as (XX) XXXXX-XXXX
    return digitsOnly.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")
  }
}

export function formatCpfCnpj(cpfCnpj: string): string {
  const digitsOnly = cpfCnpj.replace(/\D/g, "")

  if (digitsOnly.length <= 11) {
    // Format as CPF: XXX.XXX.XXX-XX
    return digitsOnly.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
  } else {
    // Format as CNPJ: XX.XXX.XXX/XXXX-XX
    return digitsOnly.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5")
  }
}

export function validateRegistrationForm(data: {
  firstName: string
  lastName: string
  phone: string
  email: string
  confirmEmail: string
  cpfCnpj: string
  password: string
  confirmPassword: string
}): ValidationResult {
  const errors: string[] = []

  // Required fields
  if (!data.firstName.trim()) errors.push("Nome é obrigatório")
  if (!data.lastName.trim()) errors.push("Sobrenome é obrigatório")

  // Email validation
  const emailValidation = validateEmail(data.email)
  if (!emailValidation.isValid) {
    errors.push(...emailValidation.errors)
  }

  // Email confirmation
  if (data.email !== data.confirmEmail) {
    errors.push("Emails não coincidem")
  }

  // Phone validation
  const phoneValidation = validatePhone(data.phone)
  if (!phoneValidation.isValid) {
    errors.push(...phoneValidation.errors)
  }

  // CPF/CNPJ validation
  const cpfCnpjValidation = validateCpfCnpj(data.cpfCnpj)
  if (!cpfCnpjValidation.isValid) {
    errors.push(...cpfCnpjValidation.errors)
  }

  // Password validation
  const passwordValidation = validatePassword(data.password)
  if (!passwordValidation.isValid) {
    errors.push(...passwordValidation.errors)
  }

  // Password confirmation
  if (data.password !== data.confirmPassword) {
    errors.push("Senhas não coincidem")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}
