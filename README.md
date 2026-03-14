# mmx-web-react

Frontend web do projeto MMX, consumindo um backend dedicado (mmx-api) via REST.

## Estado arquitetural

A estrategia oficial e backend dedicado, sem camada transitoria como baseline.

- frontend: mmx-web-react (Next.js)
- backend: mmx-api (NestJS em apps/api)
- banco: PostgreSQL + Prisma

## Stack

- Next.js 14.2 (App Router)
- React 19
- TypeScript 5
- pnpm
- Prisma + PostgreSQL
- ESLint + Prettier
- Vitest (unit/integration)
- Playwright (E2E opcional)

## Inicio rapido

```bash
pnpm install
pnpm dev
```

Aplicacao: http://localhost:3000

## Arquitetura

Fluxo principal:

```text
Browser
  -> mmx-web-react
  -> HTTP REST
  -> mmx-api (NestJS)
  -> PostgreSQL
```

Fronteira de dados do frontend:

- lib/client/api.ts

Regra:

- componentes e hooks nao acessam storage persistente diretamente
- consumo de dados sempre via hooks + lib/client/api.ts

## Estrutura principal

```text
app/
components/
hooks/
lib/
apps/api/           # backend dedicado NestJS (modular monolith + DDD)
prisma/
docs/
docker/
scripts/
```

## Desenvolvimento

```bash
corepack enable
pnpm install
pnpm dev
pnpm lint
pnpm type-check
pnpm test:unit
pnpm test:integration
pnpm build
```

## Variaveis de ambiente

Criar .env.local na raiz:

```bash
DATABASE_URL=postgresql://mmx:mmx_password@localhost:5432/mmx?schema=public
NEXT_PUBLIC_API_BASE=http://localhost:4000
NEXT_PUBLIC_USE_API=true
MMX_APP_ENV=development
CORS_ORIGINS_DEV=http://localhost:3000,http://127.0.0.1:3000
CORS_ORIGINS_STAGING=
CORS_ORIGINS_PROD=
```

Para ambiente local real (API + banco), mantenha `NEXT_PUBLIC_USE_API=true` e `DATABASE_URL` valida.

## Seguranca esperada

- JWT access + refresh
- rotacao/revogacao de refresh token
- cookies HttpOnly, SameSite, Secure (producao)
- rate limiting
- CORS por ambiente
- OAuth Google e Microsoft

## Documentacao

- docs/system-overview.md
- docs/architecture.md
- docs/api-contracts.md
- docs/deployment.md
- docs/docker.md
- docs/project-structure.md
- docs/adr/README.md
- docs/adr/0012-backend-architecture.md

## Convencoes

- Conventional Commits: feat, fix, chore, docs, refactor, test
- TypeScript estrito
- mensagens de usuario preferencialmente em portugues
- evitar alteracoes em components/ui sem necessidade
