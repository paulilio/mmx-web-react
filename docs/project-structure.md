# Estrutura do Projeto

Este documento resume as principais pastas e responsabilidades.

## Pastas principais

### `app/`

Camada de rotas e paginas do Next.js App Router.

Exemplos:

- `app/auth/page.tsx`
- `app/dashboard/page.tsx`
- `app/api/transactions/route.ts`

### `components/`

Componentes reutilizaveis de interface.

Exemplos:

- `components/transactions/transaction-form-modal.tsx`
- `components/layout/sidebar.tsx`
- `components/ui/*` (primitivos de design system)

### `hooks/`

Hooks de dominio e estado da aplicacao.

Exemplos:

- `hooks/use-auth.tsx`
- `hooks/use-auth.test.tsx`
- `hooks/use-session.test.tsx`
- `components/auth/auth-guard.test.tsx`
- `hooks/use-transactions.ts`
- `hooks/use-budget.ts`

### `server/` (equivalente logico)

No projeto atual, a camada server esta organizada em `lib/server/`.

Exemplos:

- `lib/server/services/`
- `lib/server/services/auth-service.ts`
- `lib/server/repositories/`
- `lib/server/db/prisma.ts`
- `lib/server/security/rate-limit.ts`
- `lib/server/security/cors.ts`
- `lib/server/security/password-hash.ts`

### `domain/` (equivalente logico)

No projeto atual, o dominio esta em `lib/domain/`.

Exemplos:

- `lib/domain/transactions/transaction-entity.ts`
- `lib/domain/transactions/transaction-rules.ts`
- `lib/domain/budgets/budget-entity.ts`
- `lib/domain/auth/auth-rules.ts`

### `repositories/` (equivalente logico)

No projeto atual, repositorios estao em `lib/server/repositories/`.

Exemplos:

- `lib/server/repositories/transaction-repository.ts`
- `lib/server/repositories/user-repository.ts`

## Outras pastas relevantes

- `lib/client/`: adapter de API para consumo no cliente
- `lib/shared/`: tipos, utils e configuracoes compartilhadas
- `prisma/`: schema e migrations do banco
- `docs/`: documentacao tecnica
- `scripts/`: utilitarios de validacao e testes auxiliares

## Fluxo arquitetural (backend)

```text
app/api -> lib/server/services -> lib/domain -> lib/server/repositories -> Prisma/PostgreSQL
```
