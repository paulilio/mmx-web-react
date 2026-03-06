# API Contracts

## Current Mode: Mock (localStorage)

All API calls are routed through `lib/api.ts`. In mock mode this file reads/writes localStorage. To switch to a real backend, replace the implementations in `lib/api.ts` — no other files need to change.

```ts
// lib/api.ts (pattern)
export async function getTransactions(userId: string): Promise<Transaction[]> {
  // Mock: read from localStorage
  // Production: return fetch(`/api/transactions?userId=${userId}`).then(r => r.json())
  const raw = localStorage.getItem("mmx_transactions") ?? "[]"
  return (JSON.parse(raw) as Transaction[]).filter(t => t.userId === userId)
}
```

## localStorage Keys

| Key | Entity | Scoped by |
|---|---|---|
| `mmx_users` | Users | — |
| `mmx_transactions` | Transactions | `userId` |
| `mmx_categories` | Categories | `userId` |
| `mmx_category_groups` | Category groups | `userId` |
| `mmx_areas` | Areas | `userId` |
| `mmx_budget_allocations` | Budget | `userId` |
| `mmx_contacts` | Contacts | `userId` |
| `mmx_sessions` | Sessions | `userId` |
| `mmx_audit_logs` | Audit logs | `userId` |

## TypeScript Interfaces

```ts
// types/auth.ts
interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  planType: "free" | "premium" | "pro"
  isEmailConfirmed: boolean
  status: "active" | "inactive" | "blocked"
  createdAt: string
  updatedAt: string
}

// lib/types.ts
interface Transaction {
  id: string
  userId: string
  description: string
  amount: number
  type: "income" | "expense"
  categoryId: string
  date: string
  createdAt: string
  updatedAt: string
}
```

## Expected REST Endpoints (production)

```
GET    /api/transactions          → Transaction[]
POST   /api/transactions          → Transaction
PUT    /api/transactions/:id      → Transaction
DELETE /api/transactions/:id      → { success: boolean }

GET    /api/categories            → Category[]
POST   /api/categories            → Category

POST   /api/auth/login            → { user: User, token: string }
POST   /api/auth/register         → { user: User }
POST   /api/auth/confirm-email    → { success: boolean }
POST   /api/auth/forgot-password  → { success: boolean }
POST   /api/auth/reset-password   → { success: boolean }
```

## Standard Response Shape

```ts
// Success
{ data: T, error: null }

// Error
{ data: null, error: { code: string, message: string } }
```

## Error Handling Pattern

```ts
// hooks/use-transactions.ts
try {
  const data = await getTransactions(userId)
  setTransactions(data)
} catch (err) {
  toast.error("Erro ao carregar transações")
  console.error("[transactions]", err)
}
```

- Never expose raw error messages in the UI
- Always show a Portuguese user-facing message via `toast.error()`
- Log technical details with a namespaced prefix: `[module-name]`
