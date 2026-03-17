# Documentation Index — MMX

Ponto de entrada para a documentacao tecnica do projeto.

Para entendimento rapido do sistema (Context Kernel), veja `.ai/`:
- `.ai/SYSTEM.md` — proposito, arquitetura, componentes
- `.ai/CODEBASE_MAP.md` — mapa modular do codigo
- `.ai/AGENTS.md` — como trabalhar no repositorio

---

## Onboarding

| Documento | O que cobre |
|---|---|
| [system-overview.md](system-overview.md) | Ponto de entrada tecnico — proposito, stack, componentes principais |
| [project-structure.md](project-structure.md) | Estrutura de pastas e responsabilidades |
| [local-development.md](local-development.md) | Como rodar o projeto localmente (sem Docker) |
| [docker.md](docker.md) | Como rodar com Docker |

---

## Arquitetura

| Documento | O que cobre |
|---|---|
| [architecture.md](architecture.md) | Visao arquitetural, decisao oficial de backend |
| [api-contracts.md](api-contracts.md) | Contratos de API, envelope { data, error }, boundaries |
| [frontend-guidelines.md](frontend-guidelines.md) | Convencoes de componentes, hooks, estado |
| [adr/](adr/README.md) | Registro de decisoes arquiteturais (12 ADRs) |

---

## Operacional

| Documento | O que cobre |
|---|---|
| [deployment.md](deployment.md) | Deploy de frontend e backend, topologia |
| [documentation-governance-checklist.md](documentation-governance-checklist.md) | Checklist para PRs que afetam arquitetura ou contratos |

---

## ADRs principais

| ADR | Decisao |
|---|---|
| [0001](adr/0001-use-postgresql.md) | PostgreSQL como banco de dados |
| [0005](adr/0005-adopt-backend-jwt-auth.md) | JWT com refresh token rotation |
| [0008](adr/0008-keep-modular-monolith-no-microservices-yet.md) | Monolito modular — sem microservicos por ora |
| [0012](adr/0012-backend-architecture.md) | Arquitetura backend — DDD, NestJS, Prisma |

Lista completa: [adr/README.md](adr/README.md)

---

## Regra de atualizacao

Sempre que um novo documento for criado em `docs/`, adicionar uma entrada neste indice.
Use o checklist [documentation-governance-checklist.md](documentation-governance-checklist.md) em PRs com mudancas estruturais.
