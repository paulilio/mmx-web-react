export interface UserRecord {
  id: string
  email: string
  passwordHash?: string | null
  firstName: string
  lastName: string
  phone?: string | null
  cpfCnpj?: string | null
  isEmailConfirmed: boolean
  defaultOrganizationId?: string | null
  planType: "FREE" | "PREMIUM" | "PRO"
  profilePhoto?: string | null
  preferences?: unknown
  lastLogin?: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface CreateUserInput {
  email: string
  passwordHash?: string | null
  firstName: string
  lastName: string
  phone?: string | null
  cpfCnpj?: string | null
  isEmailConfirmed?: boolean
  defaultOrganizationId?: string | null
  planType?: "FREE" | "PREMIUM" | "PRO"
  profilePhoto?: string | null
  preferences?: unknown
  lastLogin?: Date | null
}

export interface UpdateUserInput {
  email?: string
  passwordHash?: string | null
  firstName?: string
  lastName?: string
  phone?: string | null
  cpfCnpj?: string | null
  isEmailConfirmed?: boolean
  defaultOrganizationId?: string | null
  planType?: "FREE" | "PREMIUM" | "PRO"
  profilePhoto?: string | null
  preferences?: unknown
  lastLogin?: Date | null
}

export interface AuthUserView {
  id: string
  email: string
  firstName: string
  lastName: string
  planType: "FREE" | "PREMIUM" | "PRO"
}

export function toAuthUserView(record: UserRecord): AuthUserView {
  return {
    id: record.id,
    email: record.email,
    firstName: record.firstName,
    lastName: record.lastName,
    planType: record.planType,
  }
}
