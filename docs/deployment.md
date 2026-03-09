# Deploy

## Desenvolvimento Local

**Requisitos:** Node.js 22, pnpm

\`\`\`bash
# Instalar dependencias
pnpm install

# Iniciar servidor de desenvolvimento (http://localhost:3000)
pnpm dev

# Verificacao de tipos
pnpm type-check

# Lint
pnpm lint

# Testes unitarios
pnpm test:unit

# Testes de integracao (rotas API + middleware)
pnpm test:integration

# Build (validar antes de enviar)
pnpm build

# Validacao de env/secrets (por ambiente)
pnpm validate:env -- --env=production
\`\`\`

**Atalho de login direto** (somente desenvolvimento): em `/auth`, o botao "Login Direto" fica disponivel apenas em ambiente de desenvolvimento para fluxo mock.

## Variaveis de Ambiente

| Variavel | Obrigatoria | Descricao |
|---|---|---|
| `NEXT_PUBLIC_API_BASE` | Nao | URL base para chamadas externas ainda nao first-party (em dominios first-party, o adapter usa `/api/*`) |
| `NEXT_PUBLIC_USE_API` | Nao | `"true"` troca de localStorage para API real |
| `MMX_APP_ENV` | Recomendado | Ambiente efetivo para politicas server (`development|staging|production`) |
| `CORS_ORIGINS_DEV` | Recomendado | CSV de origens permitidas para `/api` em desenvolvimento |
| `CORS_ORIGINS_STAGING` | Recomendado | CSV de origens permitidas para `/api` em staging |
| `CORS_ORIGINS_PROD` | Recomendado | CSV de origens permitidas para `/api` em producao |
| `GOOGLE_CLIENT_ID` | Obrigatorio para OAuth Google | Client ID do app Google OAuth |
| `GOOGLE_CLIENT_SECRET` | Obrigatorio para OAuth Google | Client secret do app Google OAuth |
| `GOOGLE_REDIRECT_URI` | Opcional | URI de callback (padrao: `/api/auth/oauth/google/callback`) |
| `MICROSOFT_CLIENT_ID` | Obrigatorio para OAuth Microsoft | Client ID do app Microsoft OAuth |
| `MICROSOFT_CLIENT_SECRET` | Obrigatorio para OAuth Microsoft | Client secret do app Microsoft OAuth |
| `MICROSOFT_REDIRECT_URI` | Opcional | URI de callback (padrao: `/api/auth/oauth/microsoft/callback`) |
| `MICROSOFT_TENANT_ID` | Opcional | Tenant Microsoft (padrao: `common`) |

Crie um `.env.local` para overrides locais (nunca commitar este arquivo):

\`\`\`bash
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
\`\`\`

Na Vercel, configure em **Project Settings -> Environment Variables** por ambiente.

Checklist rapido de producao (obrigatorio):
- `DATABASE_URL`
- `MMX_APP_ENV=production`
- `NEXT_PUBLIC_USE_API=true`
- `NEXT_PUBLIC_API_BASE`
- `CORS_ORIGINS_PROD` com ao menos uma origem
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`
- `MICROSOFT_CLIENT_ID`, `MICROSOFT_CLIENT_SECRET`, `MICROSOFT_REDIRECT_URI`

## Pipeline de CI (GitHub Actions)

\`\`\`yaml
# .github/workflows/ci.yml (setup recomendado)
on: [push, pull_request]
jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
      - uses: actions/setup-node@v4
        with: { node-version: 22 }
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm test:unit
      - run: pnpm test:integration
      - run: pnpm type-check
      - run: pnpm build
\`\`\`

## Deploy na Vercel

| Evento | Ambiente | URL |
|---|---|---|
| PR aberto / push em branch | Preview | `*.vercel.app` (unico por PR) |
| Merge em `main` | Producao | Dominio customizado |

**Fluxo de deploy:**
1. Push para qualquer branch -> Vercel gera preview automaticamente
2. Compartilhe a URL de preview com o time para revisao
3. Merge do PR em `main` -> deploy de producao e disparado

**Versao do Node.js:** defina **22** em Vercel Project Settings -> General -> Node.js Version (igual ao `engines` do `package.json`).

## Modo Mock vs Producao

\`\`\`
NEXT_PUBLIC_USE_API=false  -> localStorage (mock, padrao)
NEXT_PUBLIC_USE_API=true   -> lib/client/api.ts chama `/api/*` para dominios first-party e `NEXT_PUBLIC_API_BASE` para externos
MMX_APP_ENV               -> escolhe matriz de CORS para `/api`
\`\`\`

Observacao importante de credenciais em API mode:
- chamadas externas resolvidas para `NEXT_PUBLIC_API_BASE` usam `credentials: "include"` (cookie-based auth)
- chamadas first-party (`/api/*`) mantem comportamento atual

Para trocar para API de producao:
1. Definir `NEXT_PUBLIC_USE_API=true` e `NEXT_PUBLIC_API_BASE=<url>` nas variaveis de ambiente da Vercel
2. Garantir que novos dominios first-party sejam roteados em `resolveApiUrl` de `lib/client/api.ts`
3. Validar que fluxos de desenvolvimento (ex.: "Login Direto") permanecem protegidos por gate de ambiente
4. Remover a logica de `lib/server/migration-service.ts` apos migracao completa dos dados para o banco

Dominios first-party atualmente ativos no adapter (`NEXT_PUBLIC_USE_API=true`):
- `transactions`, `categories`, `category-groups`, `contacts`, `budget`, `budget-allocations`, `areas`, `settings`, `auth`, `reports/summary`, `reports/aging`, `reports/cashflow`.

## Hardening de seguranca (backend)

- Headers de seguranca aplicados no `middleware.ts`:
  - `X-Frame-Options: DENY`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: camera=(), microphone=(), geolocation=()`
  - `Cross-Origin-Opener-Policy: same-origin`
  - `Cross-Origin-Resource-Policy: same-site`
  - `Strict-Transport-Security` em producao
- Cookies de auth (`mmx_access_token`, `mmx_refresh_token`) emitidos com `HttpOnly`, `SameSite=Lax` e `Secure` em producao.

## Versao da Aplicacao

A versao e controlada em `package.json` e lida em runtime via `lib/shared/config.ts`. Atualize a versao no `package.json` a cada release; o footer exibe automaticamente.
