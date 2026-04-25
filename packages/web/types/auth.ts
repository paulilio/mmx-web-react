export interface User {
  id: string
  email: string
  firstName: string
  lastName?: string
  phone?: string
  cpfCnpj?: string
  isEmailConfirmed: boolean
  defaultOrganizationId?: string
  organizations?: UserOrganization[]
  createdAt: string
  lastLogin?: string
  // New profile fields
  planType: "free" | "premium" | "pro"
  profilePhoto?: string
  preferences?: UserPreferences
  creditCard?: CreditCardInfo
}

export interface UserOrganization {
  id: string
  name: string
  role: "owner" | "admin" | "member" | "viewer"
  permissions: string[]
  joinedAt: string
}

export interface SessionData {
  token: string
  userId: string
  organizationId?: string
  expiresAt: string
}

export interface RegisterData {
  firstName: string
  email: string
  password: string
  lastName?: string
  phone?: string
  cpfCnpj?: string
  organizationName?: string
}

export interface LoginData {
  email: string
  password: string
}

export interface AuthContextType {
  user: User | null
  isLoading: boolean
  logout: () => Promise<void>
  logoutAllDevices: () => Promise<{ revokedCount: number }>
  hydrateFromSession: () => Promise<void>
  switchOrganization: (organizationId: string) => Promise<void>
}

export interface UserPreferences {
  theme: "light" | "dark" | "system"
  language: "pt-BR" | "en-US"
  notifications: {
    email: boolean
    push: boolean
    sms: boolean
  }
  layout: {
    sidebarCollapsed: boolean
    compactMode: boolean
  }
}

export interface CreditCardInfo {
  id: string
  maskedNumber: string // Only last 4 digits, e.g., "**** **** **** 1234"
  brand: string // visa, mastercard, etc.
  expiryMonth: string
  expiryYear: string
  holderName: string
  isDefault: boolean
  createdAt: string
}
