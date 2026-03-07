# Contratos de API

## Modo Atual: Hibrido (mock-first + backend parcial)

Todas as chamadas de API passam por `lib/client/api.ts`.

- Em modo mock (`NEXT_PUBLIC_USE_API=false`), os dados sao servidos por adapters locais.
- Transacoes ja possuem rotas Next.js de primeira parte em `app/api/transactions/**`.
- Outros dominios ainda estao em mock-first e serao migrados incrementalmente.

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
```

## Endpoints Planejados (proximas fases)

```text
GET/POST /api/categories
GET/POST /api/contacts
GET/POST /api/category-groups
GET/POST /api/budget
GET/POST /api/areas

POST     /api/auth/login
POST     /api/auth/register
POST     /api/auth/refresh
POST     /api/auth/logout
```

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
