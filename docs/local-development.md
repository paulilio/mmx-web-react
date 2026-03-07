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
```

Variaveis principais:

- `NEXT_PUBLIC_USE_API`: `false` usa modo mock/local; `true` usa chamadas de API
- `NEXT_PUBLIC_API_BASE`: URL base para endpoints quando `NEXT_PUBLIC_USE_API=true`

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

# prisma
pnpm prisma:generate
pnpm prisma:migrate:dev
pnpm prisma:studio
```

## Observacoes rapidas

- Em modo mock (`NEXT_PUBLIC_USE_API=false`), o projeto funciona sem backend completo.
- O dominio de transacoes ja possui rotas em `app/api/transactions/**`.
