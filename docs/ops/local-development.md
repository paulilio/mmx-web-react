# Desenvolvimento Local (Sem Docker)

Este guia cobre execucao local direta com Node.js e pnpm.

## Requisitos

- Node.js 22+
- pnpm
- PostgreSQL local (recomendado para API mode)

## Instalar dependencias

\`\`\`bash
pnpm install
\`\`\`

## Variaveis de ambiente

Crie .env.local na raiz:

\`\`\`bash
DATABASE_URL=postgresql://mmx:mmx_password@localhost:5432/mmx?schema=public
NEXT_PUBLIC_API_BASE=http://localhost:4000
NEXT_PUBLIC_USE_API=true
MMX_APP_ENV=development
CORS_ORIGINS_DEV=http://localhost:3000,http://127.0.0.1:3000
CORS_ORIGINS_STAGING=
CORS_ORIGINS_PROD=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:4000/auth/oauth/google/callback
MICROSOFT_CLIENT_ID=
MICROSOFT_CLIENT_SECRET=
MICROSOFT_REDIRECT_URI=http://localhost:4000/auth/oauth/microsoft/callback
MICROSOFT_TENANT_ID=common
\`\`\`

Observacao:
- para rodar em API mode local real, `NEXT_PUBLIC_USE_API=true` e `DATABASE_URL` devem estar definidos.

## Execucao

Frontend:

\`\`\`bash
pnpm dev
\`\`\`

Backend dedicado:

\`\`\`bash
cd packages/api
pnpm install
pnpm dev
\`\`\`

## Comandos de validacao

\`\`\`bash
pnpm lint
pnpm type-check
pnpm test:unit
pnpm test:integration
pnpm build
pnpm validate:env -- --env=development
\`\`\`

## Prisma (backend)

\`\`\`bash
cd packages/api
pnpm db:generate
pnpm db:migrate
\`\`\`
