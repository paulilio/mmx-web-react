# Changelog Tecnico - Cutover Backend (TK-101)

Data: 2026-03-13
Escopo: refatoracao definitiva para backend dedicado (apps/api) em Modular Monolith + DDD + NestJS + Prisma.

## Resumo executivo

- Cutover Big Bang executado no runtime principal (apps/api).
- Backend source of truth consolidado em apps/api.
- Schema e migrations Prisma consolidados em apps/api/prisma.

## Principais mudancas tecnicas

1. Foundation e cross-cutting
- bootstrap global com validation pipe, interceptors e exception filter.
- PrismaModule/PrismaService como ponto unico de acesso a banco.
- middlewares/guards de seguranca (headers, CORS por ambiente, JWT e rate limit).

2. DDD por contexto
- contextos com camadas presentation/application/domain/infrastructure.
- repositorios via ports na camada application e implementacoes Prisma em infrastructure.
- controllers finos, delegando para servicos/use-cases.

3. Dominios cobertos no runtime
- health
- auth
- transactions
- categories
- category-groups
- contacts
- areas
- budget
- budget-allocations
- settings
- reports

4. Prisma e banco
- schema canonico: apps/api/prisma/schema.prisma.
- migrations em apps/api/prisma/migrations.
- T6.3 validado via Docker com resultado "Already in sync".

5. Remocao de legado alvo (runtime)
- removidos:
  - apps/api/src/core/lib/domain
  - apps/api/src/core/lib/server/repositories
  - apps/api/src/core/lib/server/services
  - apps/api/src/core/lib/server/db/prisma.ts
- mantidos no runtime do backend dedicado:
  - apps/api/src/core/lib/server/http (mappers de contrato)
  - apps/api/src/core/lib/server/security (jwt, cors, rate-limit, refresh-session-store, password-hash)

## Evidencias de validacao (local)

- pnpm test:unit: ok
- pnpm test:integration: ok
- pnpm lint: ok
- pnpm type-check: ok
- pnpm build: ok
- pnpm validate:env -- --env=development: ok (com warnings nao bloqueantes)

## Decisoes finais e desvios

- Decisao final: manter backend dedicado em apps/api como baseline oficial.
- Desvio aprovado no escopo: validacao de ambiente production (T8.7) adiada por decisao operacional; ambiente local development validado.
