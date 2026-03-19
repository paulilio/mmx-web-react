# Estrutura do Projeto

Este documento resume as principais pastas e responsabilidades.

## Raiz

- packages/web/: frontend Next.js (paginas, componentes, hooks, lib)
- packages/api/: backend dedicado NestJS
- prisma/: schema e migrations
- docs/: documentacao tecnica
- scripts/: scripts de suporte
- docker/scripts/: scripts operacionais canonicos para compose/runtime
- runtime/: saidas operacionais centralizadas por servico (front, api, monitor)

## Frontend

- packages/web/app/: rotas e composicao de telas
- packages/web/app/api/: route handlers locais do frontend (uso tecnico/local, ex.: probes e health local)
- packages/web/components/: UI reutilizavel
- packages/web/hooks/: estado remoto e casos de uso da interface
- packages/web/hooks/compat: aliases de compatibilidade para migracoes graduais de naming
- packages/web/lib/client/api.ts: fronteira unica de dados
- packages/web/lib/mock: servicos de mock/localStorage para modo local
- packages/web/lib/mock/data: datasets mock versionados junto da implementacao mock
- packages/web/lib/shared: tipos, helpers e utilitarios compartilhados

### Fronteira packages/web/app/api vs packages/api

- packages/api e o backend oficial (fonte de verdade para regras de negocio e contratos).
- packages/web/app/api nao substitui packages/api e nao deve evoluir como backend paralelo.
- packages/web/app/api deve ser restrito a endpoints locais/tecnicos do frontend.
- Fluxos de dominio consumidos por UI/hooks devem continuar passando por packages/web/lib/client/api.ts.

## Operacao Docker/Monitor

- docker/scripts e o caminho canonico de scripts de compose/runtime.
- logs e artefatos operacionais devem ser gravados em runtime/<servico>/...

## Backend (packages/api)

- src/modules/<context>/presentation
- src/modules/<context>/application
- src/modules/<context>/domain
- src/modules/<context>/infrastructure
- src/infrastructure/database/prisma
- src/common
- src/config

## Dominios backend

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

## Regra de acoplamento

- controllers delegam para use-cases
- application depende de ports
- domain e independente de framework
- infraestrutura implementa ports com Prisma
