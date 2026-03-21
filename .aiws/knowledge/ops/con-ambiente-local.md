# CON: Ambiente de Desenvolvimento Local

## What
Tudo que é necessário para rodar o MMX localmente — do zero até `pnpm dev` funcionando.

---

## Pré-requisitos de sistema

| Ferramenta | Versão mínima | Observação |
|---|---|---|
| Node.js | 22+ | Exigido pelo `engines` no package.json |
| pnpm | 10.15.1 | Definido em `packageManager` — use `corepack enable` |
| Docker Desktop | qualquer recente | Para rodar PostgreSQL local via Docker |
| Git | qualquer recente | — |

```bash
# Verificar versões
node -v        # deve ser 22+
pnpm -v        # deve ser 10.x
docker -v
```

---

## 1 — Clonar e instalar

```bash
git clone <repo-url>
cd mmx-web-react
pnpm install
```

---

## 2 — Configurar variáveis de ambiente

### Frontend — `packages/web/.env.local`
Copiar de `packages/web/.env.example`:

```env
NEXT_PUBLIC_API_BASE=http://127.0.0.1:8000
NEXT_PUBLIC_USE_API=false   # false = usa mock local, sem backend
```

> Para rodar com backend real: `NEXT_PUBLIC_USE_API=true` e `NEXT_PUBLIC_API_BASE=http://127.0.0.1:8000`

### Backend — `packages/api/.env`
Copiar de `packages/api/.env.example`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mmx?schema=public"
MMX_APP_ENV=development
CORS_ORIGINS_DEV=http://localhost:3000,http://127.0.0.1:3000
CORS_ORIGINS_STAGING=
CORS_ORIGINS_PROD=
GOOGLE_CLIENT_ID=          # opcional para dev (OAuth não funciona sem isso)
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=
MICROSOFT_CLIENT_ID=       # opcional para dev
MICROSOFT_CLIENT_SECRET=
MICROSOFT_REDIRECT_URI=
MICROSOFT_TENANT_ID=common
```

---

## 3 — Subir PostgreSQL local

```bash
# Sobe apenas o banco via Docker
docker compose -f tools/docker/compose/docker-compose.dev.yml up -d
```

Ou pelo script npm:
```bash
pnpm docker:dev:up
```

Banco disponível em `localhost:5432`, user `postgres`, senha `postgres`, database `mmx`.

---

## 4 — Aplicar migrações

```bash
pnpm prisma:migrate:dev
```

Gera o Prisma Client e aplica todas as migrações em `packages/api/prisma/migrations/`.

---

## 5 — Rodar o projeto

### Só frontend (modo mock — sem backend)
```bash
pnpm dev
# http://localhost:3000
```

### Frontend + backend (modo API real)
```bash
# Terminal 1 — backend
pnpm dev:api
# http://localhost:8000

# Terminal 2 — frontend
pnpm dev
# http://localhost:3000
```

> Certifique-se de ter `NEXT_PUBLIC_USE_API=true` no `.env.local` do frontend.

---

## 6 — Validar ambiente

```bash
pnpm validate:env -- --env=development
pnpm lint
pnpm type-check
```

---

## Comandos úteis do dia a dia

| Comando | O que faz |
|---|---|
| `pnpm dev` | Frontend em watch |
| `pnpm dev:api` | Backend em watch |
| `pnpm prisma:studio` | GUI do banco |
| `pnpm prisma:migrate:dev` | Criar/aplicar migrations |
| `pnpm test:unit` | Testes unitários (frontend) |
| `pnpm test:integration` | Testes de integração (backend) |
| `pnpm docker:dev:logs` | Logs do container frontend |
| `pnpm docker:dev:logs:backend` | Logs do container backend |

---

## Notes
- `NEXT_PUBLIC_USE_API=false` permite usar o frontend sem backend — útil para trabalhar só em UI.
- OAuth (Google/Microsoft) só funciona se as credenciais estiverem preenchidas no `.env` do backend.
- Nunca commitar arquivos `.env` — estão no `.gitignore`.
- `node_modules/` e `.next/` ficam ocultos no VS Code via `.vscode/settings.json`.
