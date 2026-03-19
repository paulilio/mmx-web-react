# Arquitetura

Para onboarding consolidado, veja docs/system-overview.md.

## Decisao oficial

A arquitetura oficial do MMX e:

- Modular Monolith
- Domain-Driven Design (DDD)
- Backend dedicado em NestJS (packages/api)
- Prisma + PostgreSQL

A referencia normativa e o ADR 0012:
- docs/adr/0012-backend-architecture.md

## Topologia de servicos

\`\`\`text
Browser
  -> mmx-web-react (frontend)
  -> HTTP REST
  -> mmx-api (backend dedicado)
  -> PostgreSQL
\`\`\`

## Fronteiras de camada

Frontend:

- packages/web/app e packages/web/components: apresentacao
- packages/web/hooks: orquestracao de UI e estado remoto
- packages/web/lib/client/api.ts: fronteira unica de dados

Backend (packages/api):

- modules/<context>/presentation: controllers e DTOs
- modules/<context>/application: use cases e ports
- modules/<context>/domain: entidades, value objects, regras
- modules/<context>/infrastructure: implementacoes Prisma e adapters

Infra compartilhada:

- src/infrastructure/database/prisma: PrismaService
- src/common: guards, filters, interceptors, decorators
- src/config: configuracoes por ambiente

## Dominios do backend

- health
- auth
- transactions
- categories
- category-groups
- contacts
- budget
- budget-allocations
- areas
- settings
- reports

## Regras de acoplamento

- dominio nao depende de NestJS ou Prisma
- use cases dependem de ports, nao de implementacoes
- PrismaClient apenas via PrismaService na infraestrutura
- controllers permanecem finos
- acesso entre contextos via contratos/eventos de aplicacao

## Contrato HTTP

Envelope padrao:

- sucesso: { data, error: null }
- falha: { data: null, error }

No frontend em NEXT_PUBLIC_USE_API=true:

- lib/client/api.ts deve manter erro explicito (ApiError)
- sem fallback automatico para mock em falha de conectividade
- requests externas para NEXT_PUBLIC_API_BASE com credentials include

## Seguranca (baseline)

- JWT access e refresh
- rotacao/revogacao de refresh token
- cookies seguros
- rate limiting
- CORS por ambiente
- OAuth Google e Microsoft
- headers de seguranca e gate de autorizacao central

## Status de cutover

- Cutover backend dedicado concluido no escopo TK-101.
- Modulos ativos no runtime em packages/api: health, auth, transactions, categories, category-groups, contacts, areas, budget, budget-allocations, settings e reports.
- Removido do source de runtime o legado alvo de cutover: core/lib/domain, core/lib/server/repositories, core/lib/server/services e core/lib/server/db/prisma.ts.
- Mantidos no runtime atual de packages/api os utilitarios de contrato e seguranca em core/lib/server/http e core/lib/server/security.
