import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { auditLogger } from "./audit-logger"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number | string | null | undefined): string {
  // Convert to number and handle invalid values
  const numericValue = typeof value === "number" ? value : Number.parseFloat(String(value || 0))
  const safeValue = isNaN(numericValue) ? 0 : numericValue

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(safeValue)
}

export function generateSessionToken(): string {
  return "session_" + Math.random().toString(36).substring(2) + Date.now().toString(36)
}

export function generateUserId(): string {
  return "user_" + Math.random().toString(36).substring(2) + Date.now().toString(36)
}

export function createDefaultAccount(userId: string): void {
  // Create default account data for new user
  const defaultAccount = {
    id: "account_" + Math.random().toString(36).substring(2),
    name: "Conta Principal",
    userId,
    createdAt: new Date().toISOString(),
  }

  const accounts = JSON.parse(localStorage.getItem("accounts") || "[]")
  accounts.push(defaultAccount)
  localStorage.setItem("accounts", JSON.stringify(accounts))
}

export function logAuditEvent(action: string, userId: string | null, metadata: Record<string, unknown> = {}): void {
  auditLogger.log(action, userId, metadata)
}
