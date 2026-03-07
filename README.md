# mmx-web-react

Frontend web do projeto **MMX**, construido com **Next.js + TypeScript**.

O repositorio esta em modo **mock-first com migracao incremental para backend real**.
Atualmente, transacoes, categories, contacts, budget e areas ja possuem rotas backend em `app/api/**`.

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
- Desenvolvimento local: `docs/local-development.md`
- Estrutura do projeto: `docs/project-structure.md`
- Diretrizes de frontend: `docs/frontend-guidelines.md`
- ADRs (decisoes arquiteturais): `docs/adr/README.md`
- Mapa explicativo de ADRs: `docs/adr/review.md`

---

## Convencoes

- Commits: Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`)
- Estilo: TypeScript estrito, sem `any` quando possivel
- UI base: `components/ui/**` (evitar alteracoes sem necessidade)
- Mensagens para usuario: preferencialmente em portugues

---

## Status atual (resumo)

- Fluxo completo em transacoes, categories, contacts, budget e areas: `API -> Service -> Domain -> Repository -> Prisma`
- Contrato HTTP padronizado com envelope `{ data, error }`
- Endpoints de auth backend: `POST /api/auth/login`, `POST /api/auth/register`, `POST /api/auth/refresh`
- OAuth Google backend: `GET /api/auth/oauth/google` + `GET /api/auth/oauth/google/callback`
- OAuth Microsoft backend: `GET /api/auth/oauth/microsoft` + `GET /api/auth/oauth/microsoft/callback`
- Hardening aplicado em auth/API: rate limiting (`429`) + CORS por ambiente com preflight no `middleware.ts`
- Auth backend completo (hash/JWT): em andamento no plano
