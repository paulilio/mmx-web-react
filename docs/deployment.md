# Deploy

## Desenvolvimento Local

**Requisitos:** Node.js 22, pnpm

\`\`\`bash
# Instalar dependencias
pnpm install

# Iniciar servidor de desenvolvimento (http://localhost:3000)
pnpm dev

# Verificacao de tipos
pnpm tsc --noEmit

# Lint
pnpm lint

# Build (validar antes de enviar)
pnpm build
\`\`\`

**Atalho de login direto** (somente mock): em `/auth`, use o botao "Login Direto" para autenticar como `paulilio.ferreira@gmail.com`. Remova esse botao antes de producao.

## Variaveis de Ambiente

| Variavel | Obrigatoria | Descricao |
|---|---|---|
| `NEXT_PUBLIC_API_BASE` | Nao | URL base para chamadas de API (vazio = modo mock) |
| `NEXT_PUBLIC_USE_API` | Nao | `"true"` troca de localStorage para API real |

Crie um `.env.local` para overrides locais (nunca commitar este arquivo):

\`\`\`bash
NEXT_PUBLIC_API_BASE=http://localhost:4000
NEXT_PUBLIC_USE_API=false
\`\`\`

Na Vercel, configure em **Project Settings -> Environment Variables** por ambiente.

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
      - run: pnpm tsc --noEmit
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
NEXT_PUBLIC_USE_API=true   -> lib/client/api.ts chama endpoints reais
\`\`\`

Para trocar para API de producao:
1. Definir `NEXT_PUBLIC_USE_API=true` e `NEXT_PUBLIC_API_BASE=<url>` nas variaveis de ambiente da Vercel
2. Implementar/expandir chamadas `fetch` em `lib/client/api.ts`
3. Remover o botao "Login Direto" de `app/auth/page.tsx`
4. Remover a logica de `lib/server/migration-service.ts` apos migracao completa dos dados para o banco

## Versao da Aplicacao

A versao e controlada em `package.json` e lida em runtime via `lib/shared/config.ts`. Atualize a versao no `package.json` a cada release; o footer exibe automaticamente.
