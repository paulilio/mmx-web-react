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

## Frontend

- app/: rotas e composicao de telas
- components/: UI reutilizavel
- hooks/: estado remoto e casos de uso da interface
- lib/client/api.ts: fronteira unica de dados
- lib/mock: servicos de mock/localStorage para modo local
- lib/shared: tipos, helpers e utilitarios compartilhados

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
