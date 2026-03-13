# Docker

Este documento cobre como rodar o projeto **com Docker** — tanto no modo desenvolvimento quanto no modo produção. Para rodar **sem Docker**, veja [`docs/local-development.md`](local-development.md).

Para onboarding tecnico consolidado (proposito, arquitetura, modulos e fluxo), veja `docs/system-overview.md`.

---

## Pré-requisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Windows/macOS) ou Docker Engine + Docker Compose plugin (Linux)
- Docker Compose v2 (`docker compose`, não `docker-compose`)

---

## Estrutura de arquivos Docker

```
docker/
  Dockerfile              # build multi-stage para produção
  Dockerfile.dev          # imagem de desenvolvimento com HMR
  compose/
    docker-compose.dev.yml  # stack de desenvolvimento
    docker-compose.prod.yml # stack de produção
  env/
    app.env.example         # template de variáveis da aplicação (desenvolvimento)
    app.prod.env.example    # template de variáveis da aplicação (produção)
    postgres.env.example    # template de variáveis do banco
scripts/
  docker/
    migrate-and-start.sh    # prisma migrate deploy + next start (prod)
    wait-for-db.sh          # pg_isready loop (uso em CI ou scripts manuais)
.dockerignore
```

---

## Preparacao inicial (uma vez)

Crie os arquivos de ambiente reais a partir dos exemplos. **Nunca commite os arquivos reais (`.env` sem `.example`).**

```bash
# desenvolvimento
cp docker/env/app.env.example docker/env/app.env

# produção
cp docker/env/app.prod.env.example docker/env/app.prod.env

# banco (compartilhado)
cp docker/env/postgres.env.example docker/env/postgres.env
```

Edite `docker/env/app.env` para desenvolvimento e `docker/env/app.prod.env` para produção (OAuth, domínios CORS, etc.). As variáveis `DATABASE_URL` já estão configuradas para apontar para o container `postgres` do compose — não altere este valor para uso com compose.

Para desenvolvimento local, você pode manter os valores padrão do `postgres.env`:
```bash
POSTGRES_USER=mmx
POSTGRES_PASSWORD=mmx_password
POSTGRES_DB=mmx
```

---

## Modo Desenvolvimento

Usa `docker-compose.dev.yml`:
- **Hot Module Replacement (HMR)** via bind mount do código fonte
- Banco PostgreSQL local em container
- Serviço `monitor` em loop para execuções de monitoramento
- `node_modules` e `.next` preservados no container (não sobrescritos pelo bind mount)
- Migrações Prisma rodadas automaticamente na inicialização
- Projeto compose nomeado como `mmx-dev` (containers e volumes previsíveis)
- Profile opcional `split` para incluir `backend` dedicado (`mmx-api`) quando disponivel

Atalho recomendado (com validacao de env files antes do compose):

```bash
pnpm docker:dev:up
```

```bash
# Subir a stack (app + postgres)
docker compose -f docker/compose/docker-compose.dev.yml up

# Em segundo plano
docker compose -f docker/compose/docker-compose.dev.yml up -d

# Acompanhar logs em segundo plano
docker compose -f docker/compose/docker-compose.dev.yml logs -f app

# Logs do monitor
docker compose -f docker/compose/docker-compose.dev.yml logs -f monitor

# Parar e remover containers (volumes preservados)
docker compose -f docker/compose/docker-compose.dev.yml down

# Parar e remover containers + volumes do banco
docker compose -f docker/compose/docker-compose.dev.yml down -v
```

Atalhos adicionais via `pnpm`:

```bash
pnpm docker:dev:logs
pnpm docker:dev:down
pnpm docker:dev:rebuild
pnpm docker:dev:ps
```

Aplicação disponível em: `http://localhost:3000`

> **Nota:** edições no código são refletidas automaticamente via HMR. Não é necessário rebuild da imagem para mudanças de código.

### Rebuild da imagem (dev)

Necessário apenas quando `package.json` ou `pnpm-lock.yaml` mudarem:

```bash
pnpm docker:dev:rebuild
```

---

## Modo Produção

Usa `docker-compose.prod.yml`:
- Build multi-stage com imagem otimizada (sem devDependencies, sem código-fonte)
- Usuário não-root (`nextjs`) para segurança
- Healthcheck em `/api/health`
- `restart: unless-stopped` na aplicação
- Serviço `monitor` em loop com dependência do healthcheck da aplicação
- Migrações Prisma rodadas via `scripts/docker/migrate-and-start.sh` no startup
- Projeto compose nomeado como `mmx-prod` (isolado do ambiente dev)
- Profile opcional `split` para incluir `backend` dedicado (`mmx-api`) no self-hosted

Atalho recomendado (com validacao de env files antes do compose):

```bash
pnpm docker:prod:up
```

```bash
# Build e subir a stack completa
docker compose -f docker/compose/docker-compose.prod.yml up --build

# Build e subir em segundo plano
docker compose -f docker/compose/docker-compose.prod.yml up --build -d

# Acompanhar logs
docker compose -f docker/compose/docker-compose.prod.yml logs -f app

# Logs do monitor
docker compose -f docker/compose/docker-compose.prod.yml logs -f monitor

# Parar
docker compose -f docker/compose/docker-compose.prod.yml down
```

Atalhos adicionais via `pnpm`:

```bash
pnpm docker:prod:logs
pnpm docker:prod:down
pnpm docker:prod:rebuild
pnpm docker:prod:ps
```

### Build isolado da imagem (sem compose)

Útil para testar o Dockerfile de produção localmente ou empurrar para um registry:

```bash
# Build
docker build -f docker/Dockerfile . -t mmx-web:latest

# Rodar isoladamente (sem postgres — apenas para checar se a imagem sobe)
docker run --rm -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e NODE_ENV=production \
  mmx-web:latest
```

---

## Comandos úteis

```bash
# Ver containers em execução
docker compose -f docker/compose/docker-compose.dev.yml ps

# Acessar shell dentro do container app
docker compose -f docker/compose/docker-compose.dev.yml exec app sh

# Rodar prisma studio dentro do container
docker compose -f docker/compose/docker-compose.dev.yml exec app pnpm prisma:studio

# Rodar migrations manualmente dentro do container
docker compose -f docker/compose/docker-compose.dev.yml exec app \
  node_modules/.bin/prisma migrate dev

# Ver logs de um serviço específico
docker compose -f docker/compose/docker-compose.dev.yml logs postgres

# Limpar imagens sem uso
docker image prune -f
```

---

## Variáveis de ambiente no Docker

| Arquivo | Usado por | Descrição |
|---|---|---|
| `docker/env/app.env` | `app` (dev compose) | Variáveis da aplicação para desenvolvimento |
| `docker/env/app.prod.env` | `app` (prod compose) | Variáveis da aplicação para produção |
| `docker/env/postgres.env` | `postgres` service | `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` |

Variáveis adicionais do serviço `monitor` no compose:

- `MONITOR_BASE_URL`: URL alvo monitorada pelo runner (padrão no compose: `http://app:3000`).
- `MONITOR_START_PATH`: rota inicial de monitoramento (padrão: `/dashboard`).
- `MONITOR_INTERVAL_SECONDS`: intervalo entre execuções do monitor (padrão: `300`).

Variáveis para migração frontend -> backend dedicado:

- `NEXT_PUBLIC_API_MIGRATION_DOMAINS`: lista CSV de domínios roteados para `NEXT_PUBLIC_API_BASE` (ex.: `reports,categories`).
- `MMX_API_IMAGE`: imagem Docker do backend dedicado usada no profile `split` (padrão: `mmx-api:local`).

Uso do profile `split` (quando o `mmx-api` estiver disponível):

```bash
# dev com frontend + backend + postgres
docker compose -f docker/compose/docker-compose.dev.yml --profile split up -d

# prod self-hosted com backend dedicado
docker compose -f docker/compose/docker-compose.prod.yml --profile split up -d
```

### Piloto reports em dev (copy/paste)

1. Preparar env da aplicacao para piloto:

```bash
cp docker/env/app.split.reports.env.example docker/env/app.env
```

2. Garantir imagem local do backend dedicado (`mmx-api`) com nome `mmx-api:local`.

3. Subir stack split com um comando:

```bash
pnpm docker:dev:up:split
```

4. Verificar logs:

```bash
pnpm docker:dev:logs:backend
pnpm docker:dev:logs
```

5. Resultado esperado:
- frontend continua em `http://localhost:3000`
- backend dedicado em `http://localhost:4000`
- dominio `reports` roteado para `NEXT_PUBLIC_API_BASE`

O `DATABASE_URL` em `app.env` e `app.prod.env` já está configurado para o hostname `postgres` (nome do serviço no compose). Não é necessário alterar para usar o compose.

Para produção em servidor remoto, substitua os valores de OAuth, `CORS_ORIGINS_PROD`, `GOOGLE_REDIRECT_URI`, `MICROSOFT_REDIRECT_URI` com os domínios reais.

---

## Diferenças: Docker vs sem Docker

| Aspecto | Sem Docker | Com Docker (dev) | Com Docker (prod) |
|---|---|---|---|
| Banco | PostgreSQL local ou mock | Container postgres | Container postgres |
| Env vars | `.env.local` na raiz | `docker/env/app.env` | `docker/env/app.prod.env` |
| HMR | Sim (pnpm dev) | Sim (bind mount) | Não (imagem buildada) |
| Migrations | Manual (`pnpm prisma:migrate:dev`) | Automático no startup | Automático no startup |
| Porta | 3000 (default) | 3000 (mapeada) | 3000 (mapeada) |

---

## Troubleshooting

**Container `app` não sobe — erro de conexão com banco**
O app aguarda o healthcheck do postgres antes de subir (`depends_on: condition: service_healthy`). Se o postgres demorar para ficar pronto, aguarde ou verifique os logs com `docker compose logs postgres`.

**Mudanças no código não refletem (dev)**
Verifique se o bind mount está ativo com `docker compose ps`. Se o container foi recriado sem o bind mount, rode `docker compose down` e `docker compose up` novamente.

**Erro `corepack` ou versão de pnpm**
A imagem ativa o corepack automaticamente. Se houver conflito, verifique se `packageManager` em `package.json` está correto (`pnpm@10.15.1+sha512...`).

**Migrações falham no startup (prod)**
Certifique-se de que `DATABASE_URL` aponta para o host correto e que as credenciais em `postgres.env` e `app.prod.env` coincidem.
