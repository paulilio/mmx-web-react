# mmx-web-react

Frontend web do projeto **MMX**, construido com **Next.js + TypeScript**.

O repositorio esta em modo **mock-first com migracao incremental para backend real**.
Atualmente, transacoes, categories, category-groups, contacts, budget, areas, settings e reports (`summary`, `aging`, `cashflow`) ja possuem rotas backend em `app/api/**`.

---

## Stack

- **Next.js 14.2** (App Router)
- **React 19**
- **TypeScript 5**
- **pnpm**
- **Prisma + PostgreSQL**
- **ESLint + Prettier**
- **Vitest** (testes unitarios)
- (Opcional) **Playwright** (E2E)
- Deploy: **Vercel**

---

## Desenvolvimento local

```bash
corepack enable
pnpm install
pnpm dev
```

Aplicacao local: `http://localhost:3000`

Comandos principais:

```bash
pnpm lint
pnpm type-check
pnpm test:unit
pnpm test:unit:watch
pnpm test:integration
pnpm build
```

---

## Variaveis de ambiente

Crie um `.env.local` na raiz do projeto:

```bash
NEXT_PUBLIC_API_BASE=http://localhost:4000
NEXT_PUBLIC_USE_API=false
MMX_APP_ENV=development
CORS_ORIGINS_DEV=http://localhost:3000,http://127.0.0.1:3000
CORS_ORIGINS_STAGING=
CORS_ORIGINS_PROD=
```

- `NEXT_PUBLIC_USE_API=false`: usa modo mock/local
- `NEXT_PUBLIC_USE_API=true`: usa chamadas de API
- `MMX_APP_ENV`: seleciona ambiente efetivo para matriz de CORS (`development|staging|production`)
- `CORS_ORIGINS_DEV|STAGING|PROD`: lista CSV de origens permitidas para `/api`

---

## Documentacao

- Arquitetura geral: `docs/architecture.md`
- Contratos de API: `docs/api-contracts.md`
- Deploy e CI: `docs/deployment.md`
- Desenvolvimento local (sem Docker): `docs/local-development.md`
- Docker (dev e produção): `docs/docker.md`
- Estrutura do projeto: `docs/project-structure.md`
- Diretrizes de frontend: `docs/frontend-guidelines.md`
- ADRs (decisoes arquiteturais): `docs/adr/README.md`

---

## Docker (Checklist Rapido)

Operacao recomendada com os atalhos `pnpm`:

```bash
# preparar envs uma vez
cp docker/env/app.env.example docker/env/app.env
cp docker/env/app.prod.env.example docker/env/app.prod.env
cp docker/env/postgres.env.example docker/env/postgres.env

# desenvolvimento
pnpm docker:dev:up
pnpm docker:dev:ps
pnpm docker:dev:logs
pnpm docker:dev:rebuild
pnpm docker:dev:down

# producao (self-hosted)
pnpm docker:prod:up
pnpm docker:prod:ps
pnpm docker:prod:logs
pnpm docker:prod:rebuild
pnpm docker:prod:down
```

Observacoes:
- `docker:dev:*` usa o projeto compose `mmx-dev`
- `docker:prod:*` usa o projeto compose `mmx-prod`
- Os comandos validam os env files obrigatorios antes de executar o compose

---

## Convencoes

- Commits: Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`)
- Estilo: TypeScript estrito, sem `any` quando possivel
- UI base: `components/ui/**` (evitar alteracoes sem necessidade)
- Mensagens para usuario: preferencialmente em portugues

---

## Status atual (resumo)

- Fluxo completo em transacoes, categories, category-groups, contacts, budget e areas: `API -> Service -> Domain -> Repository -> Prisma`
- Budget no frontend convergido em E3: `use-budget-allocations` como caminho principal; `use-budget.ts` mantido apenas como legado de compatibilidade transitoria
- Reports first-party ativos em `app/api/reports/summary`, `app/api/reports/aging` e `app/api/reports/cashflow`
- Settings maintenance first-party ativo em `app/api/settings/import`, `app/api/settings/export` e `app/api/settings/clear`
- Settings no frontend convergido para boundary: `app/settings/page.tsx` usa `hooks/use-settings-maintenance.ts` + `lib/client/api.ts` (sem acesso direto a storage/localStorage)
- Contrato HTTP padronizado com envelope `{ data, error }`
- Adapter cliente (`lib/client/api.ts`) em `NEXT_PUBLIC_USE_API=true`: desembrulha envelope, aceita payload legado sem envelope temporariamente, envia `credentials: "include"` para chamadas externas via `API_BASE` e lanca erro explicito de conectividade (`ApiError`, `status: 0`) sem fallback automatico para mock
- Endpoints de auth backend: `POST /api/auth/login`, `POST /api/auth/register`, `POST /api/auth/refresh`
- OAuth Google backend: `GET /api/auth/oauth/google` + `GET /api/auth/oauth/google/callback`
- OAuth Microsoft backend: `GET /api/auth/oauth/microsoft` + `GET /api/auth/oauth/microsoft/callback`
- Hardening aplicado em auth/API: rate limiting (`429`) + CORS por ambiente com preflight no `middleware.ts`
- Auth backend base concluido: hash de senha com `bcryptjs`, `AuthService` e atualizacao de `lastLogin` no login
- Auth JWT concluido: emissao/validacao de access+refresh token, `POST /api/auth/logout` e gate central de autorizacao para APIs protegidas no `middleware.ts`
- Frontend auth (migracao incremental): em `NEXT_PUBLIC_USE_API=true`, `use-auth` ja usa `POST /api/auth/login|logout`, `use-session` ja usa `POST /api/auth/refresh` e o bootstrap nao depende mais de `auth_session` local
- Cobertura de teste de auth/frontend atualizada: `hooks/use-auth.test.tsx` cobre sucesso/falha/expiracao de sessao, `hooks/use-session.test.tsx` cobre refresh (`401` e `429`) e `components/auth/auth-guard.test.tsx` valida navegacao protegida sem regressao
