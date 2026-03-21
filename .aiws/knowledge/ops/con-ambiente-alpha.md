# CON: Ambiente Alpha (Vercel + Neon)

## What
Configuração do ambiente externo de Alpha: frontend na Vercel, banco PostgreSQL no Neon, backend ainda local/Docker. Objetivo: validar o produto com usuários reais antes de evoluir a infra.

---

## Arquitetura Alpha

```
Browser → Vercel (Next.js frontend) → API local ou futura URL pública
                                     ↓
                               Neon PostgreSQL
```

> Na Alpha, o backend (NestJS) pode ainda rodar localmente ou via Docker — o foco é publicar o frontend e conectar ao banco externo.

---

## Pré-requisitos de conta

| Serviço | Plano | Observação |
|---|---|---|
| [Neon](https://neon.tech) | Free | PostgreSQL serverless |
| [Vercel](https://vercel.com) | Free (Hobby) | Deploy do frontend Next.js |
| GitHub | — | Repositório conectado à Vercel |
| Vercel CLI | `npm install -g vercel` | Para operar via terminal (usar npm, não pnpm) |

---

## 1 — Configurar Neon

### 1.1 Criar projeto
- Acesse neon.tech → New Project
- Configurações definidas:

| Campo | Valor |
|---|---|
| **Project name** | `mmx-platform` |
| **Project ID** | `broad-band-63721769` |
| **PostgreSQL version** | `17` |
| **Cloud provider** | `AWS` |
| **Region** | `US East (N. Virginia) — us-east-1` |
| **Branch padrão** | `br-morning-queen-an1cl268` |
| **Neon Auth** | Não |

> AWS us-east-1 alinha com a região default da Vercel (iad1). Vercel roda 100% sobre AWS — não há suporte a Azure.

### 1.2 Obter connection strings
No dashboard do Neon → **Connection Details**, copie:

```env
# Pooled — para a aplicação em runtime (usa PgBouncer)
DATABASE_URL="postgresql://user:pass@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require"

# Direct — para Prisma CLI / migrações
DIRECT_URL="postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require"
```

### 1.3 Atualizar schema Prisma
Em `packages/api/prisma/schema.prisma`, adicionar `directUrl`:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

### 1.4 Aplicar migrações no Neon
```bash
cd packages/api
env $(cat .env.alpha | grep -v '^#' | xargs) npx prisma migrate deploy
```

> ✅ **Executado em 2026-03-21** — 9 migrações aplicadas com sucesso:
> `init`, `add_category`, `add_contact`, `add_budget`, `add_area`,
> `add_category_group_model`, `add_transaction_soft_delete`, `add_budget_uniques`, `add_ledger_events`

**Tabelas criadas no Neon:**
`User`, `Transaction`, `Category`, `CategoryGroup`, `Contact`, `Budget`, `BudgetAllocation`, `Area`, `LedgerEvent`

---

## 2 — Configurar Vercel

### 2.1 Instalar CLI
```bash
npm install -g vercel   # versão instalada: 50.34.3
vercel login
```

### 2.2 Conectar projeto
```bash
vercel link   # na raiz do repo
```

### 2.3 Configurar variáveis de ambiente

#### Via CLI
```bash
vercel env add NEXT_PUBLIC_API_BASE production
vercel env add NEXT_PUBLIC_USE_API production    # valor: true
vercel env add DATABASE_URL production
vercel env add DIRECT_URL production
vercel env add MMX_APP_ENV production            # valor: production
vercel env add CORS_ORIGINS_PROD production
vercel env add GOOGLE_CLIENT_ID production
vercel env add GOOGLE_CLIENT_SECRET production
vercel env add GOOGLE_REDIRECT_URI production
vercel env add MICROSOFT_CLIENT_ID production
vercel env add MICROSOFT_CLIENT_SECRET production
vercel env add MICROSOFT_REDIRECT_URI production
vercel env add MICROSOFT_TENANT_ID production    # valor: common
```

#### Via integração nativa Neon ↔ Vercel (alternativa)
- Vercel dashboard → Storage → Browse Marketplace → Neon
- Conectar ao projeto `mmx` — configura `DATABASE_URL` automaticamente em preview e production
- Branching automático: cada preview deploy ganha branch isolado no banco

### 2.4 Referência de variáveis obrigatórias para production

| Variável | Valor exemplo | Fonte |
|---|---|---|
| `NEXT_PUBLIC_API_BASE` | `https://api.suaurl.com` | URL do backend publicado |
| `NEXT_PUBLIC_USE_API` | `true` | Fixo |
| `DATABASE_URL` | string pooled do Neon | Neon dashboard |
| `DIRECT_URL` | string direct do Neon | Neon dashboard |
| `MMX_APP_ENV` | `production` | Fixo |
| `CORS_ORIGINS_PROD` | `https://seuapp.vercel.app` | URL do deploy |
| `GOOGLE_CLIENT_ID` | — | Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | — | Google Cloud Console |
| `GOOGLE_REDIRECT_URI` | `https://seuapp.vercel.app/api/auth/google/callback` | — |
| `MICROSOFT_CLIENT_ID` | — | Azure Portal |
| `MICROSOFT_CLIENT_SECRET` | — | Azure Portal |
| `MICROSOFT_REDIRECT_URI` | `https://seuapp.vercel.app/api/auth/microsoft/callback` | — |
| `MICROSOFT_TENANT_ID` | `common` | Fixo (multi-tenant) |

---

## 3 — Deploy

```bash
# Preview deploy
vercel

# Production deploy
vercel --prod
```

---

## 4 — Validar

```bash
# Validar envs antes do deploy
pnpm validate:env -- --env=production

# Ver logs de deploy
vercel logs

# Status do projeto
vercel inspect
```

---

## 5 — Smoke test P0

Após deploy, validar em ambiente publicado:
- [ ] Login com email/senha
- [ ] Login com Google (OAuth)
- [ ] Criar transação
- [ ] Listar transações
- [ ] Criar budget
- [ ] Acessar relatório
- [ ] Settings funcionando

---

## 6 — Segredos e portabilidade (Bitwarden)

Tokens de API (ex: `NEON_API_KEY`) são armazenados no Bitwarden CLI — portável entre máquinas.

### Setup em máquina nova
```bash
# 1. Instalar Bitwarden CLI
npm install -g @bitwarden/cli

# 2. Login e unlock
bw login
bw unlock   # retorna BW_SESSION

# 3. Injetar NEON_API_KEY na sessão
export NEON_API_KEY=$(bw get item "NEON_API_KEY" --session $BW_SESSION \
  | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{const i=JSON.parse(d);console.log(i.fields[0].value)})")
```

### Itens armazenados no Bitwarden

| Item | Campo | Uso |
|---|---|---|
| `NEON_API_KEY` | `NEON_API_KEY` | Token da API do Neon — MCP server do Claude Code |

### MCP server do Neon (Claude Code)
Configurado em `~/.claude/mcp.json` com token direto:
```json
{
  "mcpServers": {
    "Neon": {
      "type": "http",
      "url": "https://mcp.neon.tech/mcp",
      "headers": { "Authorization": "Bearer <NEON_API_KEY>" }
    }
  }
}
```

> Token disponível no Bitwarden — item `NEON_API_KEY`.
> Em máquina nova: obter token do Bitwarden e substituir `<NEON_API_KEY>` no arquivo.
> Após configurar, reiniciar o Claude Code para carregar o MCP server.

O VS Code usa configuração equivalente em `%APPDATA%/Code/User/mcp.json` (gerada pelo `neonctl init`).

---

## Notes
- `NEXT_PUBLIC_USE_API=false` nunca deve ir para production — sem fallback para mock em API mode.
- `credentials: "include"` é obrigatório para chamadas ao `NEXT_PUBLIC_API_BASE` externo (já configurado no `lib/client/api.ts`).
- Neon free tier pausa compute após 5min de inatividade, mas retoma automaticamente — sem impacto para o usuário.
- Neon free: 500 MB storage, 100 CU-hours/mês, 10 branches — suficiente para Alpha.
- Para preview deploys com banco isolado: usar a integração nativa Neon ↔ Vercel (cria branch por deploy).
- Referência da task em andamento: `.aiws/tasks/doing/tk-100b-alpha-infra/`.
