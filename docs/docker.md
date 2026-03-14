# Docker

Guia de execucao com Docker para frontend e backend dedicados.

## Pre-requisitos

- Docker Engine
- Docker Compose v2
- pnpm

## Arquivos de ambiente

- docker/env/app.env
- docker/env/app.prod.env
- docker/env/postgres.env

## Subir ambiente de desenvolvimento

```bash
pnpm docker:dev:up
pnpm docker:dev:ps
pnpm docker:dev:logs
```

## Derrubar ambiente

```bash
pnpm docker:dev:down
```

## Subir ambiente de producao (self-hosted)

```bash
pnpm docker:prod:up
pnpm docker:prod:ps
pnpm docker:prod:logs
```

## Derrubar producao

```bash
pnpm docker:prod:down
```

## Variaveis relevantes

Aplicacao:
- NEXT_PUBLIC_USE_API=true
- NEXT_PUBLIC_API_BASE=http://backend:4000
- MMX_APP_ENV=development|staging|production

Banco:
- POSTGRES_USER
- POSTGRES_PASSWORD
- POSTGRES_DB

Monitor:
- MONITOR_BASE_URL
- MONITOR_START_PATH
- MONITOR_INTERVAL_SECONDS

## Prisma no backend

```bash
cd apps/api
pnpm db:generate
pnpm db:migrate
```

## Diferencas: sem Docker x com Docker

| Aspecto | Sem Docker | Docker dev | Docker prod |
|---|---|---|---|
| Banco | PostgreSQL local | Container postgres | Container postgres |
| Env vars | .env.local | docker/env/app.env | docker/env/app.prod.env |
| HMR | Sim | Sim | Nao |
| Migrations | Manual | Manual/automacao por entrypoint | Automacao por entrypoint |

## Troubleshooting rapido

- app nao sobe: verificar logs do postgres e credenciais.
- mudancas nao refletem: validar bind mount e rebuild.
- migrations falham: validar DATABASE_URL e acesso ao banco.
