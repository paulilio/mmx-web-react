# Desenvolvimento Local

## Requisitos

- Node.js 22+
- pnpm
- Docker (opcional, para banco PostgreSQL local)

## Como instalar dependencias

```bash
pnpm install
```

## Variaveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```bash
NEXT_PUBLIC_API_BASE=http://localhost:4000
NEXT_PUBLIC_USE_API=false
MMX_APP_ENV=development
CORS_ORIGINS_DEV=http://localhost:3000,http://127.0.0.1:3000
CORS_ORIGINS_STAGING=
CORS_ORIGINS_PROD=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/oauth/google/callback
MICROSOFT_CLIENT_ID=
MICROSOFT_CLIENT_SECRET=
MICROSOFT_REDIRECT_URI=http://localhost:3000/api/auth/oauth/microsoft/callback
MICROSOFT_TENANT_ID=common
```

Variaveis principais:

- `NEXT_PUBLIC_USE_API`: `false` usa modo mock/local; `true` usa chamadas de API
- `NEXT_PUBLIC_API_BASE`: URL base para endpoints quando `NEXT_PUBLIC_USE_API=true`
- `MMX_APP_ENV`: ambiente efetivo para politicas server (`development|staging|production`)
- `CORS_ORIGINS_DEV|STAGING|PROD`: lista CSV de origens permitidas para `/api`
- `GOOGLE_CLIENT_ID|GOOGLE_CLIENT_SECRET|GOOGLE_REDIRECT_URI`: configuracao do OAuth Google (`BE-06.1`)
- `MICROSOFT_CLIENT_ID|MICROSOFT_CLIENT_SECRET|MICROSOFT_REDIRECT_URI|MICROSOFT_TENANT_ID`: configuracao do OAuth Microsoft (`BE-06.2`)

## Como rodar localmente

```bash
# desenvolvimento
pnpm dev
```

Aplicacao local:

- `http://localhost:3000`

## Comandos principais

```bash
# desenvolvimento
pnpm dev

# lint
pnpm lint

# checagem de tipos
pnpm type-check

# testes unitarios
pnpm test:unit

# build de validacao
pnpm build

# validacao de env/secrets por ambiente
pnpm validate:env -- --env=development

# prisma
pnpm prisma:generate
pnpm prisma:migrate:dev
pnpm prisma:studio
```

## Observacoes rapidas

- Em modo mock (`NEXT_PUBLIC_USE_API=false`), o projeto funciona sem backend completo.
- Dominios com rotas de primeira parte ja ativos: transacoes, categories, contacts, budget, budget-allocations, areas e auth.
