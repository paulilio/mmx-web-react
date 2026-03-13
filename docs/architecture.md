# Arquitetura

Para onboarding tecnico consolidado (visao de produto, modulos, fluxo e deploy), veja `docs/system-overview.md`.

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
3. `lib/client/api.ts` le/escreve adapters locais e roteia para endpoints de primeira parte ja conectados no adapter (`/api/transactions`, `/api/categories`, `/api/category-groups`, `/api/contacts`, `/api/budget`, `/api/budget-allocations`, `/api/areas`, `/api/settings/*`, `/api/auth`, `/api/reports/*`)
4. Rotas first-party para `category-groups` e `reports` (`summary`, `aging`, `cashflow`) estao implementadas em `app/api/**` e ja convergidas no adapter (`resolveApiUrl`).
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

Estado atual de auth no frontend:
- Em `NEXT_PUBLIC_USE_API=true`, `hooks/use-auth.tsx` usa `POST /api/auth/login|logout` para autenticacao e encerramento de sessao.
- Em `NEXT_PUBLIC_USE_API=true`, `hooks/use-session.ts` usa `POST /api/auth/refresh` para renovacao de sessao.
- Em `NEXT_PUBLIC_USE_API=true`, o bootstrap de auth nao depende de `auth_session` local.

## Backend de Primeira Parte (estado atual)

- Vertical slices completos no fluxo `API -> Service -> Domain -> Repository -> Prisma`:
        - transactions
        - categories
        - category-groups
        - contacts
        - budget + budget-allocations
        - areas
- Reports first-party:
        - `summary` ativo (`/api/reports/summary`)
        - `aging` ativo (`/api/reports/aging`)
        - `cashflow` ativo (`/api/reports/cashflow`)
- Settings maintenance first-party:
        - `import` ativo (`/api/settings/import`)
        - `export` ativo (`/api/settings/export`)
        - `clear` ativo (`/api/settings/clear`)
- Auth backend base concluido:
        - `POST /api/auth/login`
        - `POST /api/auth/register`
        - `POST /api/auth/refresh`
        - `POST /api/auth/logout`
        - `lib/server/services/auth-service.ts` (register/login)
        - `lib/domain/auth/auth-rules.ts` (validacoes de auth)
        - `lib/server/security/password-hash.ts` (`bcryptjs` para hash/compare)
        - `lib/server/security/jwt.ts` (access/refresh token)
        - `lib/server/security/refresh-session-store.ts` (rotacao/revogacao de refresh)

## Hardening HTTP (estado atual)

- Envelope padrao de resposta: `{ data, error }` em `lib/server/http/api-response.ts`
- Adapter cliente em `NEXT_PUBLIC_USE_API=true` desembrulha envelope e mantem compatibilidade legada temporaria (sem envelope) apenas no proprio adapter.
- Erros de envelope e indisponibilidade de API sao explicitos (`ApiError`), sem fallback automatico para mock em API mode.
- Em settings, manutencao de dados no frontend foi convergida para `hooks/use-settings-maintenance.ts` + `lib/client/api.ts` (sem bypass direto para storage/localStorage na pagina).
- Rate limiting de auth em `lib/server/security/rate-limit.ts`
- CORS por ambiente para `/api` em `lib/server/security/cors.ts` aplicado no `middleware.ts`
- Gate de autorizacao central no `middleware.ts` para APIs protegidas (`401 AUTH_REQUIRED` sem access token)
