/**
 * Application-wide constants
 * Centralizes magic numbers and configuration values
 */

// Session & Authentication
export const SESSION_DURATION_MS = 30 * 60 * 1000 // 30 minutes
export const SESSION_CHECK_INTERVAL_MS = 60 * 1000 // 1 minute
export const MAX_LOGIN_ATTEMPTS = 5
export const ACCOUNT_LOCK_DURATION_MS = 30 * 60 * 1000 // 30 minutes
export const CONFIRMATION_CODE_EXPIRY_MS = 24 * 60 * 60 * 1000 // 24 hours
export const PASSWORD_RESET_EXPIRY_MS = 60 * 60 * 1000 // 1 hour

// Cache
export const CACHE_DURATION_MS = 2000 // 2 seconds

// Dashboard targets (should be user-configurable in the future)
export const DEFAULT_RECEIVABLES_TARGET = 200000 // R$ 200k
export const DEFAULT_PAYABLES_TARGET = 80000 // R$ 80k

// Pagination
export const DEFAULT_PAGE_SIZE = 20
export const MAX_PAGE_SIZE = 100

// File paths
export const DATA_PATHS = {
  areas: '/data/areas.json',
  categoryGroups: '/data/category-groups.json',
  categories: '/data/categories.json',
  transactions: '/data/transactions.json',
  contacts: '/data/contacts.json',
} as const

// Storage keys
export const STORAGE_KEYS = {
  authSession: 'auth_session',
  authUser: 'auth_user',
  users: 'users',
  confirmationCodes: 'confirmation_codes',
  resetTokens: 'reset_tokens',
} as const

// Date formats
export const DATE_FORMATS = {
  display: 'dd/MM/yyyy',
  displayWithTime: 'dd/MM/yyyy HH:mm',
  iso: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
  month: 'yyyy-MM',
} as const

// Validation limits
export const VALIDATION = {
  minPasswordLength: 8,
  maxPasswordLength: 128,
  maxNameLength: 100,
  maxEmailLength: 254,
  maxDescriptionLength: 500,
  maxNotesLength: 1000,
  maxRecurrenceCount: 100,
  maxRecurrenceInterval: 99,
} as const

// Recurrence
export const RECURRENCE = {
  maxGeneratedTransactions: 52, // 1 year of weekly transactions
  daysAhead: 365, // Generate up to 1 year ahead
} as const

// Plan types
export const PLAN_TYPES = ['free', 'premium', 'pro'] as const
export type PlanType = (typeof PLAN_TYPES)[number]

// Transaction statuses
export const TRANSACTION_STATUSES = ['completed', 'pending', 'cancelled'] as const
export type TransactionStatus = (typeof TRANSACTION_STATUSES)[number]

// Transaction types
export const TRANSACTION_TYPES = ['income', 'expense'] as const
export type TransactionType = (typeof TRANSACTION_TYPES)[number]

// Contact types
export const CONTACT_TYPES = ['customer', 'supplier'] as const
export type ContactType = (typeof CONTACT_TYPES)[number]

// Entity statuses
export const ENTITY_STATUSES = ['active', 'inactive'] as const
export type EntityStatus = (typeof ENTITY_STATUSES)[number]
