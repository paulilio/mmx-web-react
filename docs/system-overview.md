# Visao Geral do Sistema (Onboarding Tecnico)

Este e o ponto de entrada para onboarding tecnico do MMX.

## Proposito

MMX e uma aplicacao de financas pessoais com foco em:
- autenticacao e sessao
- transacoes e recorrencias
- categorias e grupos
- contatos
- orcamento e alocacoes
- relatorios
- manutencao de configuracoes

## Arquitetura oficial

A arquitetura oficial e backend dedicado com Modular Monolith + DDD.

Topologia:

```text
Browser
  -> mmx-web-react
  -> HTTP REST
  -> mmx-api (apps/api)
  -> PostgreSQL
```

## Stack

- Frontend: Next.js 14, React 19, TypeScript 5
- Backend: NestJS, Prisma, PostgreSQL
- Runtime: Node.js 22+, pnpm
- Testes: Vitest + Testing Library, Playwright (E2E)

## Fronteiras tecnicas

Frontend:
- UI em app e components
- orquestracao em hooks
- fronteira unica de dados em lib/client/api.ts

Backend (apps/api):
- presentation: controllers e DTOs
- application: use-cases e ports
- domain: entidades e regras
- infrastructure: repositorios Prisma e adapters

## Regras obrigatorias

- dominio nao depende de NestJS/Prisma
- controllers finos
- repository ports em application
- implementacoes de repositorio em infrastructure
- envelope HTTP: { data, error }
- sem fallback automatico para mock em API mode

## Seguranca baseline

- JWT access + refresh
- rotacao/revogacao de refresh
- cookies HttpOnly/SameSite/Secure em producao
- rate limiting
- CORS por ambiente
- OAuth Google e Microsoft

## Referencias

- docs/architecture.md
- docs/api-contracts.md
- docs/project-structure.md
- docs/deployment.md
- docs/docker.md
- docs/adr/0012-backend-architecture.md
