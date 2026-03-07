# Arquitetura

## Visao Geral do Sistema

MoedaMix e um dashboard de financas pessoais construido com Next.js 14 (App Router). A persistencia atual e baseada em localStorage (JSON mock), com uma camada de adapter preparada para substituicao por API sem mudancas de UI.

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
3. `lib/client/api.ts` le/escreve adapters locais; transacoes ja usam `/api/transactions`
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
