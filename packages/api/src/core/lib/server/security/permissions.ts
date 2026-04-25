/**
 * Permission scopes for MMX API
 * Defines granular permissions for role-based access control (RBAC)
 */

export const SCOPES = {
  // Transaction scopes
  "read:transactions": "View transactions",
  "write:transactions": "Create and edit transactions",
  "delete:transactions": "Delete transactions",

  // Budget scopes
  "read:budget": "View budgets",
  "write:budget": "Create and edit budgets",

  // Category scopes
  "read:categories": "View categories",
  "write:categories": "Create and edit categories",

  // Contact scopes
  "read:contacts": "View contacts",
  "write:contacts": "Create and edit contacts",

  // Admin scopes
  "admin:users": "Manage users (admin only)",
}

export type Scope = keyof typeof SCOPES

/**
 * Maps user role to list of permitted scopes
 * Extend this function to add more sophisticated role/permission logic
 */
export function resolveUserScopes(user: { role?: string } | null): Scope[] {
  if (!user) return []

  // Admin gets all scopes
  if (user.role === "admin") {
    return Object.keys(SCOPES) as Scope[]
  }

  // Standard user gets read + own-write scopes
  return [
    "read:transactions",
    "write:transactions",
    "delete:transactions",
    "read:budget",
    "write:budget",
    "read:categories",
    "write:categories",
    "read:contacts",
    "write:contacts",
  ] as Scope[]
}

/**
 * Check if a scope is valid
 */
export function isValidScope(scope: string): scope is Scope {
  return scope in SCOPES
}

/**
 * Filter list of scopes to only valid ones
 */
export function filterValidScopes(scopes: string[]): Scope[] {
  return scopes.filter(isValidScope)
}
