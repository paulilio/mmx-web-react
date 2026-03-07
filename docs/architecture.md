# Arquitetura

## Visao Geral do Sistema

MoedaMix e um dashboard de financas pessoais construido com Next.js 14 (App Router). A persistencia atual e hibrida (localStorage + API de primeira parte), com camada de adapter preparada para migracao incremental sem mudancas de UI.

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 14.2 - App Router |
| Linguagem | TypeScript 5 |
| UI | React 19 + shadcn/ui + Radix UI |
| Estilizacao | Tailwind CSS v4 |
| Formularios | React Hook Form + Zod |
| Graficos | Recharts |
| Estado | React Context + SWR |
| Runtime | Node.js 22 |

## Camadas de Frontend

\`\`\`
UI (paginas + componentes)
        ↓
Hooks customizados (use-transactions, use-budget, use-auth ...)
        ↓
Camada de servicos (lib/server/persistence-service, lib/server/storage, lib/server/user-data-service)
        ↓
Repositorio / adapter (lib/client/api.ts  <- substituir mock adapters progressivamente)
        ↓
localStorage (mock) | REST API (production)
\`\`\`

## Fluxo de Dados

1. A pagina renderiza e chama o hook de dominio (ex.: `useTransactions`)
2. O hook chama o servico de persistencia, que chama `lib/client/api.ts`
3. `lib/client/api.ts` le/escreve adapters locais e roteia para endpoints de primeira parte em dominos migrados (`/api/transactions`, `/api/categories`, `/api/contacts`, `/api/budget`, `/api/budget-allocations`, `/api/areas`, `/api/auth`)
4. O hook retorna dados tipados e o componente re-renderiza

## Isolamento por Usuario

Todos os registros armazenados possuem campo `userId`. `UserDataService` filtra toda leitura/escrita pelo usuario autenticado. `MigrationService` atualiza chaves legadas no primeiro login.

## Estrutura de Pastas

\`\`\`
app/                  # Next.js App Router pages & layouts
components/
  auth/               # AuthGuard, SessionMonitor
  layout/             # Sidebar, MainLayout, Footer
  profile/            # UserProfileButton, modals
  dashboard/          # Charts, SummaryCard
  transactions/       # Forms, recurring modals
  budget/             # Add/Transfer/Rollover modals
  categories/         # Category & group forms
  contacts/           # Contact form
  ui/                 # shadcn/ui primitives
hooks/                # Domain hooks (use-auth, use-transactions …)
lib/                  # Services, utils, types, validations
types/                # Shared TypeScript interfaces
data/                 # JSON seed files (mock mode)
config/               # app-config.json (version, env, feature flags)
scripts/              # Migration validators & test utilities
docs/                 # This folder
\`\`\`

## Pontos de Integracao

| Tema | Arquivo |
|---|---|
| Auth context | `hooks/use-auth.tsx` |
| Session | `hooks/use-session.ts` |
| Storage adapter | `lib/client/api.ts` |
| Multi-user migration | `lib/server/migration-service.ts` |
| Audit log | `lib/shared/audit-logger.ts` |
| Route protection | `middleware.ts` + `components/auth/auth-guard.tsx` |

## Backend de Primeira Parte (estado atual)

- Vertical slices completos no fluxo `API -> Service -> Domain -> Repository -> Prisma`:
        - transactions
        - categories
        - contacts
        - budget + budget-allocations
        - areas
- Auth backend inicial:
        - `POST /api/auth/login`
        - `POST /api/auth/register`
        - `POST /api/auth/refresh`

## Hardening HTTP (estado atual)

- Envelope padrao de resposta: `{ data, error }` em `lib/server/http/api-response.ts`
- Rate limiting de auth em `lib/server/security/rate-limit.ts`
- CORS por ambiente para `/api` em `lib/server/security/cors.ts` aplicado no `middleware.ts`
