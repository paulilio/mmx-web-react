# Estrutura do Projeto

Este documento resume as principais pastas e responsabilidades.

## Raiz

- app/: paginas e layouts do frontend
- components/: componentes de UI
- hooks/: hooks de dominio do frontend
- lib/: client API boundary, mock/localStorage e utilitarios compartilhados
- apps/api/: backend dedicado NestJS
- prisma/: schema e migrations
- docs/: documentacao tecnica
- scripts/: scripts de suporte
- docker/scripts/: scripts operacionais canonicos para compose/runtime
- runtime/: saidas operacionais centralizadas por servico (front, api, monitor)

## Frontend

- app/: rotas e composicao de telas
- app/api/: route handlers locais do frontend (uso tecnico/local, ex.: probes e health local)
- components/: UI reutilizavel
- hooks/: estado remoto e casos de uso da interface
- hooks/compat: aliases de compatibilidade para migracoes graduais de naming
- lib/client/api.ts: fronteira unica de dados
- lib/mock: servicos de mock/localStorage para modo local
- lib/mock/data: datasets mock versionados junto da implementacao mock
- lib/shared: tipos, helpers e utilitarios compartilhados

### Fronteira app/api vs apps/api

- apps/api e o backend oficial (fonte de verdade para regras de negocio e contratos).
- app/api nao substitui apps/api e nao deve evoluir como backend paralelo.
- app/api deve ser restrito a endpoints locais/tecnicos do frontend.
- Fluxos de dominio consumidos por UI/hooks devem continuar passando por lib/client/api.ts.

## Operacao Docker/Monitor

- docker/scripts e o caminho canonico de scripts de compose/runtime.
- logs e artefatos operacionais devem ser gravados em runtime/<servico>/...

## Backend (apps/api)

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
