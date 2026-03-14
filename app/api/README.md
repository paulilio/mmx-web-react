# app/api (escopo local do frontend)

Esta pasta existe apenas para handlers tecnicos/locais do app Next.js.

## Limites obrigatorios

- Nao e backend oficial de dominio.
- Nao deve duplicar regras de negocio de `apps/api`.
- Casos permitidos: probe local, health/checks tecnicos e adaptacoes BFF estritamente locais.
- Fluxos de dominio do produto continuam com backend oficial em `apps/api` via `lib/client/api.ts`.

## Backend oficial

- Fonte de verdade de contratos e regras: `apps/api`.
- Arquitetura: Modular Monolith + DDD (ADR 0012).
