# Cenário: Alinhamento Frontend-Backend (6 Problemas)

Data: 2026-03-09
Fonte: work-main/1-backend-rev1/0-scenario.md

## Problemas identificados

1. Contrato FE/BE desalinhado
- Backend usa envelope { data, error }
- Frontend (adapter) retornava JSON bruto
- Adapter: lib/client/api.ts

2. Auth ainda em localStorage
- Backend opera com JWT + cookies HttpOnly
- Frontend persistia sessao em localStorage
- Risco de inconsistencia e 401 em APIs protegidas

3. Endpoints faltando no backend
- /category-groups e /reports/* nao existiam no backend first-party
- Frontend tinha hooks dependentes dessas rotas

4. use-budget.ts desalinhado
- Hook usava rotas diferentes das que existem no backend
- Caminho correto: use-budget-allocations

5. Settings bypassa boundary
- app/settings/page.tsx usava lib/server/storage diretamente no cliente
- Viola o boundary oficial: lib/client/api.ts

6. Falta credentials para API_BASE
- Requests para backend externo (NEXT_PUBLIC_API_BASE) nao enviavam credentials: "include"
- Necessario para cookies cross-origin

## Estrategia escolhida

- Problema 1: E3 — migracao gradual com fallback
- Problema 2: E1 — migracao completa para backend
- Problema 3: E1 — implementar first-party
- Problema 4: E3 — deprecar use-budget.ts
- Problema 5: E1 com E2 transitorio — criar endpoints/hooks
- Problema 6: E1 — adicionar credentials: "include"

## Plano de implementacao (4 fases)

1. Seguranca
2. Auth
3. Endpoints
4. Convergencia
