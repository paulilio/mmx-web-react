# Contratos de API

## Modo Atual: Hibrido (mock-first + backend parcial)

Todas as chamadas de API passam por `lib/client/api.ts`.

- Em modo mock (`NEXT_PUBLIC_USE_API=false`), os dados sao servidos por adapters locais.
- Rotas Next.js de primeira parte ja estao ativas para transacoes, categories, contacts, budget, budget-allocations, areas e auth.
- A migracao incremental continua para dominios/fluxos ainda nao cobertos (ex.: JWT completo, logout).

```ts
// lib/client/api.ts (pattern)
export async function getTransactions(userId: string): Promise<Transaction[]> {
  const response = await fetch(`/api/transactions?userId=${userId}`)
  const payload = (await response.json()) as {
    data: { data: Transaction[] }
    error: { code: string; message: string } | null
  }

  if (payload.error) {
    throw new Error(payload.error.message)
  }

  return payload.data.data
}
```

## Chaves de localStorage

| Chave | Entidade | Escopo |
|---|---|---|
| `mmx_users` | Usuarios | - |
| `mmx_transactions` | Transacoes | `userId` |
| `mmx_categories` | Categorias | `userId` |
| `mmx_category_groups` | Grupos de categoria | `userId` |
| `mmx_areas` | Areas | `userId` |
| `mmx_budget_allocations` | Orcamento | `userId` |
| `mmx_contacts` | Contatos | `userId` |
| `mmx_sessions` | Sessoes | `userId` |
| `mmx_audit_logs` | Logs de auditoria | `userId` |

## Interfaces TypeScript (referencia)

```ts
// types/auth.ts
interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  cpfCnpj?: string
  isEmailConfirmed: boolean
  defaultOrganizationId?: string
  createdAt: string
  lastLogin?: string
  planType: "free" | "premium" | "pro"
}

// lib/shared/types.ts
interface Transaction {
  id: string
  description: string
  amount: number
  type: "income" | "expense"
  categoryId: string
  date: string
  status: "completed" | "pending" | "cancelled"
  notes?: string
  createdAt: string
  updatedAt: string
}
```

## Endpoints Implementados (atual)

```text
GET    /api/transactions      -> { data: { data: Transaction[]; total; page; pageSize }, error: null } | { data: null, error }
POST   /api/transactions      -> { data: Transaction, error: null } | { data: null, error }
GET    /api/transactions/:id  -> { data: Transaction, error: null } | { data: null, error }
PUT    /api/transactions/:id  -> { data: Transaction, error: null } | { data: null, error }
DELETE /api/transactions/:id  -> { data: Transaction, error: null } | { data: null, error }

GET    /api/categories         -> { data: Category[], error: null } | { data: null, error }
POST   /api/categories         -> { data: Category, error: null } | { data: null, error }
GET    /api/categories/:id     -> { data: Category, error: null } | { data: null, error }
PUT    /api/categories/:id     -> { data: Category, error: null } | { data: null, error }
DELETE /api/categories/:id     -> { data: Category, error: null } | { data: null, error }

GET    /api/contacts           -> { data: Contact[], error: null } | { data: null, error }
POST   /api/contacts           -> { data: Contact, error: null } | { data: null, error }
GET    /api/contacts/:id       -> { data: Contact, error: null } | { data: null, error }
PUT    /api/contacts/:id       -> { data: Contact, error: null } | { data: null, error }
DELETE /api/contacts/:id       -> { data: Contact, error: null } | { data: null, error }

GET    /api/budget/:groupId/:year/:month               -> { data: BudgetSnapshot, error: null } | { data: null, error }
POST   /api/budget/:groupId/:year/:month/add-funds     -> { data: BudgetSnapshot, error: null } | { data: null, error }
POST   /api/budget/:groupId/:year/:month/rollover      -> { data: BudgetSnapshot, error: null } | { data: null, error }
GET    /api/budget-allocations                          -> { data: BudgetAllocation[], error: null } | { data: null, error }
POST   /api/budget-allocations                          -> { data: BudgetAllocation, error: null } | { data: null, error }
PUT    /api/budget-allocations/:id                      -> { data: BudgetAllocation, error: null } | { data: null, error }
DELETE /api/budget-allocations/:id                      -> { data: BudgetAllocation, error: null } | { data: null, error }

GET    /api/areas               -> { data: Area[], error: null } | { data: null, error }
POST   /api/areas               -> { data: Area, error: null } | { data: null, error }
GET    /api/areas/:id           -> { data: Area, error: null } | { data: null, error }
PUT    /api/areas/:id           -> { data: Area, error: null } | { data: null, error }
DELETE /api/areas/:id           -> { data: Area, error: null } | { data: null, error }

POST   /api/auth/login          -> { data: AuthLoginResponse, error: null } | { data: null, error }
POST   /api/auth/register       -> { data: AuthRegisterResponse, error: null } | { data: null, error }
POST   /api/auth/refresh        -> { data: AuthRefreshResponse, error: null } | { data: null, error }
GET    /api/auth/oauth/google   -> redirect para consentimento Google
GET    /api/auth/oauth/google/callback -> { data: OAuthLoginResponse, error: null } | { data: null, error }
GET    /api/auth/oauth/microsoft -> redirect para consentimento Microsoft
GET    /api/auth/oauth/microsoft/callback -> { data: OAuthLoginResponse, error: null } | { data: null, error }
```

## Endpoints Planejados (proximas fases)

```text
POST     /api/auth/logout
```

## Hardening Ativo em API

- Rate limiting em auth: `POST /api/auth/login`, `POST /api/auth/register`, `POST /api/auth/refresh`
  - Ao exceder limite da janela: `429` com `error.code = "RATE_LIMITED"`
- CORS por ambiente aplicado no `middleware.ts` para `/api`
  - Preflight `OPTIONS`: `204` com headers `Access-Control-Allow-*`
  - Origem bloqueada: `403` com `error.code = "CORS_ORIGIN_BLOCKED"`
- Cookies de auth emitidos nas rotas de login/refresh/OAuth callback:
  - `mmx_access_token` e `mmx_refresh_token`
  - `HttpOnly`, `SameSite=Lax`, `Secure` em producao

## Formato Padrao de Resposta

```ts
// Sucesso
{ data: T, error: null }

// Erro
{ data: null, error: { code: string, message: string } }
```

## Padrao de Tratamento de Erros

```ts
// hooks/use-transactions.ts
try {
  const data = await getTransactions(userId)
  setTransactions(data)
} catch (err) {
  toast.error("Erro ao carregar transacoes")
  console.error("[transactions]", err)
}
```

- Nunca expor mensagens tecnicas brutas na UI
- Sempre mostrar mensagem amigavel em portugues via `toast.error()`
- Registrar detalhes tecnicos com prefixo de namespace: `[module-name]`
