# Documentation Index — MMX

Ponto de entrada para a documentação técnica do projeto.

Para contexto operacional da IA, veja `.ai/`:
- `.ai/SYSTEM.md` — propósito, arquitetura, componentes
- `.ai/CODEBASE_MAP.md` — mapa modular do código
- `.ai/AGENTS.md` — como trabalhar no repositório

---

## Onboarding

Para quem está chegando no projeto.

| Documento | O que cobre |
|---|---|
| [system-overview.md](onboarding/system-overview.md) | Ponto de entrada técnico — propósito, stack, componentes principais |
| [project-structure.md](onboarding/project-structure.md) | Estrutura de pastas e responsabilidades |
| [historia-criacao.md](onboarding/historia-criacao.md) | Origem do projeto, fases de desenvolvimento, estado atual |

---

## Arquitetura

Decisões e padrões técnicos do sistema.

| Documento | O que cobre |
|---|---|
| [architecture.md](architecture/architecture.md) | Visão arquitetural, decisão oficial de backend |
| [api-contracts.md](architecture/api-contracts.md) | Contratos de API, envelope `{ data, error }`, boundaries |
| [frontend-guidelines.md](architecture/frontend-guidelines.md) | Convenções de componentes, hooks, estado |
| [adr/](adr/README.md) | Registro de decisões arquiteturais (12 ADRs) |

---

## Operacional

Como rodar, configurar e fazer deploy do projeto.

| Documento | O que cobre |
|---|---|
| [local-development.md](ops/local-development.md) | Como rodar o projeto localmente (sem Docker) |
| [docker.md](ops/docker.md) | Como rodar com Docker |
| [deployment.md](ops/deployment.md) | Deploy de frontend e backend, topologia |

---

## Governança

| Documento | O que cobre |
|---|---|
| [documentation-governance-checklist.md](governance/documentation-governance-checklist.md) | Checklist para PRs que afetam arquitetura ou contratos |

---

## ADRs principais

| ADR | Decisão |
|---|---|
| [0001](adr/0001-use-postgresql.md) | PostgreSQL como banco de dados |
| [0005](adr/0005-adopt-backend-jwt-auth.md) | JWT com refresh token rotation |
| [0008](adr/0008-keep-modular-monolith-no-microservices-yet.md) | Monolito modular — sem microsserviços por ora |
| [0012](adr/0012-backend-architecture.md) | Arquitetura backend — DDD, NestJS, Prisma |

Lista completa: [adr/README.md](adr/README.md)

---

## Regra de atualização

Sempre que um novo documento for criado em `docs/`, adicionar uma entrada neste índice na seção correspondente.
Use o checklist [governance/documentation-governance-checklist.md](governance/documentation-governance-checklist.md) em PRs com mudanças estruturais.
