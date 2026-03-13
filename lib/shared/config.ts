export const USE_API = process.env.NEXT_PUBLIC_USE_API === "true"
export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8000"

const migratedDomains = (process.env.NEXT_PUBLIC_API_MIGRATION_DOMAINS || "")
	.split(",")
	.map((domain) => domain.trim().toLowerCase())
	.filter(Boolean)

export const API_MIGRATION_DOMAINS = new Set(migratedDomains)
