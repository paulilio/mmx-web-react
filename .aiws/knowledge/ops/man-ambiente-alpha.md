# MAN: Manutenção do Ambiente Alpha

> Guia operacional para Claude Code acessar, diagnosticar e alterar os serviços do ambiente Alpha.
> Leia este arquivo antes de qualquer operação nos serviços abaixo.

---

## Serviços e Identificadores

| Serviço | Identificador | URL |
|---|---|---|
| **GitHub** | repo `paulilio/mmx-web-react` | github.com/paulilio/mmx-web-react |
| **Vercel** | projeto `mmx-platform` · ID `prj_5LdlpJf2w5UWuvXYLRbeQNUfDJeJ` | vercel.com |
| **Neon** | projeto `mmx-platform` · ID `broad-band-63721769` | console.neon.tech |
| **Railway** | projeto `melodious-acceptance` · ID `893f7753-c72f-424a-a780-5e29ceaf4c21` | railway.app |

---

## 1 — GitHub

### Método: CLI (`gh`)

**Binário:** `/c/Program Files/GitHub CLI/gh`
**Auth:** token salvo no keyring do sistema (login: `paulilio`)
**Scopes:** `gist`, `read:org`, `repo`, `workflow`

```bash
# Sempre adicionar ao PATH antes de usar
export PATH="$PATH:/c/Program Files/GitHub CLI"

# Verificar auth
gh auth status

# PRs
gh pr list
gh pr create --title "..." --body "..."
gh pr merge <number> --squash --yes

# CI/Workflows
gh run list
gh run view <id> --log

# Issues
gh issue list
gh issue create --title "..." --body "..."
```

**Config:** `C:/Users/pauli/AppData/Roaming/GitHub CLI/hosts.yml`

---

## 2 — Vercel

### Método A: CLI (`vercel`)

**Binário:** `vercel` (npm global, disponível no PATH)
**Auth:** token em `C:/Users/pauli/AppData/Roaming/com.vercel.cli/Data/auth.json`
**Diretório vinculado:** `packages/web/` (contém `.vercel/project.json`)

```bash
# Verificar auth
vercel whoami   # → paulilio

# IMPORTANTE: rodar de dentro de packages/web (projeto linkado)
cd packages/web

# Listar env vars
vercel env ls

# Adicionar env var
vercel env add NOME_VAR   # pergunta ambiente interativamente
vercel env add NOME_VAR production < <(echo "valor")  # não-interativo

# Remover env var
vercel env rm NOME_VAR production

# Deploy
vercel          # preview
vercel --prod   # production

# Logs
vercel logs
```

### Método B: REST API (não-interativo, preferido para automação)

```bash
VERCEL_TOKEN=$(python3 -c "import json; d=json.load(open('C:/Users/pauli/AppData/Roaming/com.vercel.cli/Data/auth.json')); print(d['token'])")
TEAM_ID="team_YxQ5Vf0lPZxE1TzFIxFvBs8N"
PROJECT_ID="prj_5LdlpJf2w5UWuvXYLRbeQNUfDJeJ"

# Listar env vars
curl -s "https://api.vercel.com/v9/projects/$PROJECT_ID/env?teamId=$TEAM_ID" \
  -H "Authorization: Bearer $VERCEL_TOKEN"

# Criar env var
curl -s -X POST "https://api.vercel.com/v9/projects/$PROJECT_ID/env?teamId=$TEAM_ID" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"key":"NOME","value":"valor","target":["production"],"type":"encrypted"}'

# Deletar env var (precisa do ID retornado no list)
curl -s -X DELETE "https://api.vercel.com/v9/projects/$PROJECT_ID/env/<env-id>?teamId=$TEAM_ID" \
  -H "Authorization: Bearer $VERCEL_TOKEN"

# Listar deployments
curl -s "https://api.vercel.com/v6/deployments?projectId=$PROJECT_ID&teamId=$TEAM_ID&limit=5" \
  -H "Authorization: Bearer $VERCEL_TOKEN"
```

**Configuração atual:**
- **Team ID:** `team_YxQ5Vf0lPZxE1TzFIxFvBs8N`
- **Project ID:** `prj_5LdlpJf2w5UWuvXYLRbeQNUfDJeJ`
- **URL production:** `https://mmx-platform.vercel.app`
- **Root Directory:** `packages/web`
- **Node version:** `24.x`

**Env vars atuais (production):**

| Variável | Status |
|---|---|
| `MMX_APP_ENV` | ✅ configurado |
| `NEXT_PUBLIC_USE_API` | ✅ configurado |
| `NEXT_PUBLIC_API_BASE` | ⚠️ verificar |

---

## 3 — Neon (PostgreSQL)

### Método A: MCP (preferido — acesso direto sem CLI)

Claude Code tem acesso via MCP server Neon. Usar as ferramentas `mcp__Neon__*`:

```
mcp__Neon__list_projects          → listar projetos
mcp__Neon__describe_project       → detalhes do projeto
mcp__Neon__get_database_tables    → listar tabelas
mcp__Neon__run_sql                → executar SQL
mcp__Neon__get_connection_string  → obter connection string
mcp__Neon__create_branch          → criar branch (ex: para testar migration)
mcp__Neon__describe_branch        → detalhes de branch
mcp__Neon__delete_branch          → deletar branch
mcp__Neon__list_branch_computes   → listar computes da branch
```

**Parâmetros padrão para o projeto:**
- `projectId`: `broad-band-63721769`
- `branchId` (main): `br-morning-queen-an1cl268`
- `databaseName`: `neondb`

### Método B: CLI (`neonctl`)

**Binário:** `npx neonctl@latest` (via npx — não está no PATH global)
**Auth:** OAuth token em `C:/Users/pauli/.config/neonctl/credentials.json`

> ⚠️ Token expira. Se `neonctl me` mostrar interactive prompt de org, o token expirou.
> Re-autenticar: `npx neonctl@latest auth` (abre browser).

```bash
# Verificar auth
npx neonctl@latest me

# Projetos
npx neonctl@latest projects list

# Branches
npx neonctl@latest branches list --project-id broad-band-63721769

# Connection string
npx neonctl@latest connection-string --project-id broad-band-63721769

# SQL direto
npx neonctl@latest sql --project-id broad-band-63721769 "SELECT COUNT(*) FROM \"User\""
```

### Método C: REST API

```bash
# Token do neonctl (quando válido)
NEON_TOKEN=$(python3 -c "import json; d=json.load(open('C:/Users/pauli/.config/neonctl/credentials.json')); print(d['access_token'])")

# Listar branches
curl -s "https://console.neon.tech/api/v2/projects/broad-band-63721769/branches" \
  -H "Authorization: Bearer $NEON_TOKEN"

# Executar SQL
curl -s -X POST "https://console.neon.tech/api/v2/projects/broad-band-63721769/query" \
  -H "Authorization: Bearer $NEON_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query":"SELECT COUNT(*) FROM \"User\"","database_name":"neondb"}'
```

**Identificadores Neon:**
- **Project ID:** `broad-band-63721769`
- **Branch padrão:** `br-morning-queen-an1cl268`
- **Endpoint pooler:** `ep-purple-bar-an7ojuar-pooler.c-6.us-east-1.aws.neon.tech`
- **Endpoint direct:** `ep-purple-bar-an7ojuar.c-6.us-east-1.aws.neon.tech`
- **Database:** `neondb` | **Role:** `neondb_owner`

**Tabelas existentes:** `User`, `Transaction`, `Category`, `CategoryGroup`, `Contact`, `Budget`, `BudgetAllocation`, `Area`, `LedgerEvent`

---

## 4 — Railway

### Método A: CLI (`@railway/cli`)

**Binário:** `npx @railway/cli@latest` (via npx)
**Auth:** token em `C:/Users/pauli/.railway/config.json`
**Link:** projeto `melodious-acceptance`, environment `production`

```bash
# Verificar auth e link
npx @railway/cli@latest whoami
npx @railway/cli@latest status

# Linkar projeto (se não estiver linkado)
npx @railway/cli@latest link --project melodious-acceptance

# Deployments
npx @railway/cli@latest deployment list --service "@mmx/api"
npx @railway/cli@latest redeploy --service "@mmx/api" --yes

# Env vars
npx @railway/cli@latest variables --service "@mmx/api"
npx @railway/cli@latest variables set KEY=VALUE --service "@mmx/api"

# Logs de build (últimas linhas)
npx @railway/cli@latest logs --service "@mmx/api" --lines 100
```

> ⚠️ `railway logs` mostra apenas build logs. Deploy/runtime logs só via GraphQL API ou dashboard.

### Método B: GraphQL API (preferido para leitura de logs e mutações)

```bash
# Extrair token automaticamente
RAILWAY_TOKEN=$(python3 -c "import json; d=json.load(open('C:/Users/pauli/.railway/config.json')); print(d['user']['token'])")

# Helper para queries
railway_gql() {
  curl -s -X POST https://backboard.railway.app/graphql/v2 \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $RAILWAY_TOKEN" \
    -d "{\"query\": \"$1\"}"
}
```

**Queries úteis:**

```graphql
# Verificar auth
{ me { name email } }

# Listar deployments recentes
{ deployments(input: { projectId: "893f7753-c72f-424a-a780-5e29ceaf4c21", serviceId: "698f5e72-8b7f-4033-b622-025e61dd5ff8" }) { edges { node { id status createdAt } } } }

# Build logs de um deployment
{ buildLogs(deploymentId: "<id>") { message severity } }

# Deploy/runtime logs
{ deploymentLogs(deploymentId: "<id>") { message severity } }

# Ver configuração atual do serviço
{ service(id: "698f5e72-8b7f-4033-b622-025e61dd5ff8") { serviceInstances { edges { node { id startCommand buildCommand preDeployCommand } } } } }
```

**Mutations úteis:**

```graphql
# Atualizar start/pre-deploy command
mutation {
  serviceInstanceUpdate(
    serviceId: "698f5e72-8b7f-4033-b622-025e61dd5ff8"
    environmentId: "8b50886a-b70c-4f95-9b23-23f1168fa7bb"
    input: {
      startCommand: "node dist/main"
      preDeployCommand: null
    }
  )
}
```

**Parsear logs (bash):**
```bash
echo "$RESPONSE" | grep -o '"message":"[^"]*"' | sed 's/"message":"//;s/"$//'
```

### Método C: MCP (Railway tem MCP server local)

```bash
# Iniciar MCP server local do Railway (para uso com Claude Code)
npx @railway/cli@latest mcp
```

> Railway CLI v10+ tem MCP server embutido. Pode ser configurado como tool adicional se necessário.

**Identificadores Railway:**

| Campo | Valor |
|---|---|
| Project ID | `893f7753-c72f-424a-a780-5e29ceaf4c21` |
| Environment ID | `8b50886a-b70c-4f95-9b23-23f1168fa7bb` |
| Service ID | `698f5e72-8b7f-4033-b622-025e61dd5ff8` |
| Service instance ID | `24eeebcf-c086-41d5-948b-8feeb4e73270` |
| Service name | `@mmx/api` |
| URL pública | `https://mmxapi-production.up.railway.app` |
| URL privada | `mmxapi.railway.internal` |

**Configuração atual do serviço:**

| Campo | Valor |
|---|---|
| Dockerfile | `packages/api/Dockerfile` |
| Root directory | raiz do repo |
| Start command | `node dist/main` (via `entrypoint.sh`) |
| Pre-deploy command | nenhum |
| Build command | Docker (padrão) |

**Env vars atuais (Railway production):**

| Variável | Status |
|---|---|
| `DATABASE_URL` | ✅ string pooled Neon |
| `DIRECT_URL` | ✅ string direct Neon |
| `MMX_APP_ENV` | ✅ `production` |
| `CORS_ORIGINS_PROD` | ✅ `https://mmx-platform.vercel.app` |
| `JWT_ACCESS_SECRET` | ⚠️ não configurado |
| `JWT_REFRESH_SECRET` | ⚠️ não configurado |

---

## 5 — Localização dos tokens/config

| Serviço | Arquivo |
|---|---|
| GitHub CLI | `C:/Users/pauli/AppData/Roaming/GitHub CLI/hosts.yml` (keyring) |
| Vercel | `C:/Users/pauli/AppData/Roaming/com.vercel.cli/Data/auth.json` → campo `token` |
| Vercel (team/project) | `C:/Users/pauli/AppData/Roaming/com.vercel.cli/Data/config.json` → campo `currentTeam` |
| Neon (neonctl) | `C:/Users/pauli/.config/neonctl/credentials.json` → campo `access_token` (expira) |
| Neon (MCP) | `C:/Users/pauli/.claude/mcp.json` → header `Authorization` |
| Railway | `C:/Users/pauli/.railway/config.json` → campo `user.token` |

---

## 6 — Fluxo de deploy padrão

```
git push main
    ↓
Railway detecta push → Docker build → container iniciado
    ↓
entrypoint.sh: prisma migrate deploy → node dist/main
    ↓
Vercel detecta push → Next.js build → deploy frontend
```

---

## 7 — Diagnóstico rápido

### Railway: build falhou
```bash
# Pegar ID do último deployment
npx @railway/cli@latest deployment list --service "@mmx/api" 2>&1 | head -5

# Build logs via GraphQL
RAILWAY_TOKEN=$(python3 -c "import json; d=json.load(open('C:/Users/pauli/.railway/config.json')); print(d['user']['token'])")
RESPONSE=$(curl -s -X POST https://backboard.railway.app/graphql/v2 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $RAILWAY_TOKEN" \
  -d "{\"query\": \"{ buildLogs(deploymentId: \\\"<id>\\\") { message severity } }\"}")
echo "$RESPONSE" | grep -o '"message":"[^"]*"' | sed 's/"message":"//;s/"$//' | tail -60
```

### Railway: container não sobe / runtime error
```bash
RESPONSE=$(curl -s -X POST https://backboard.railway.app/graphql/v2 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $RAILWAY_TOKEN" \
  -d "{\"query\": \"{ deploymentLogs(deploymentId: \\\"<id>\\\") { message severity } }\"}")
echo "$RESPONSE" | grep -o '"message":"[^"]*"' | sed 's/"message":"//;s/"$//'
```

### Vercel: env var faltando
```bash
cd packages/web && vercel env ls
```

### Neon: verificar tabelas / dados
```
# via MCP (preferido):
mcp__Neon__get_database_tables(projectId: "broad-band-63721769")
mcp__Neon__run_sql(projectId: "broad-band-63721769", sql: "SELECT COUNT(*) FROM \"User\"")
```

### Testar API em produção
```bash
curl https://mmxapi-production.up.railway.app/health
```

---

## 8 — Pendências / TODO Alpha

- [ ] Adicionar `GET /health` endpoint na API (Railway health check usa isso)
- [ ] Configurar `JWT_ACCESS_SECRET` e `JWT_REFRESH_SECRET` no Railway
- [ ] Configurar OAuth Google no Railway e Vercel
- [ ] Configurar OAuth Microsoft no Railway e Vercel
- [ ] Configurar `NEXT_PUBLIC_API_BASE` no Vercel → `https://mmxapi-production.up.railway.app`
- [ ] Smoke test P0 após primeiro deploy bem-sucedido
