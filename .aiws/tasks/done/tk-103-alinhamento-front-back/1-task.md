# TK-103: Alinhamento Frontend-Backend (6 Problemas)
Type: refactor

## Objective
Resolver 6 problemas de desalinhamento entre frontend e backend: envelope de contrato, auth frontend, endpoints faltantes, budget, settings e credentials cross-origin.

## Context
Após o cutover do tk-101 (backend DDD), o frontend ainda usava padrões antigos: sem desembrulhar envelope {data,error}, auth via localStorage, endpoints inexistentes no backend, use-budget.ts legado, settings acessando storage direto, e requests sem credentials:include para API_BASE. Esta task convergiu os 6 pontos.

## Plan
- [x] Problema 1: envelope {data, error} — adapter desembrulha resposta; erro explícito sem fallback
- [x] Problema 2: auth frontend — login/logout/refresh integrados com /api/auth/*; localStorage removido
- [x] Problema 3: endpoints faltantes — category-groups e reports/* implementados como first-party
- [x] Problema 4: budget convergência — use-budget.ts deprecado; caminho via use-budget-allocations
- [x] Problema 5: settings sem bypass — app/settings/page.tsx converge para use-settings-maintenance.ts → lib/client/api.ts → /api/settings/*
- [x] Problema 6: credentials cross-origin — credentials:"include" para requests externos (API_BASE); first-party preservado

## Code Surface
- lib/client/api.ts — handleResponse, envelope, credentials
- hooks/use-auth.tsx — auth convergido para backend
- hooks/use-session.ts — refresh via /api/auth/refresh
- hooks/use-settings-maintenance.ts — novo hook (criado nesta task)
- app/settings/page.tsx — removido bypass de lib/server/storage
- app/api/settings/import/route.ts, export/route.ts, clear/route.ts — rotas first-party (criadas nesta task)

## Validation
- pnpm test:unit, test:integration, lint, type-check, build: todos ok
- Pendência: validação manual cross-origin em ambiente com backend externo (NEXT_PUBLIC_USE_API=true + cookies + CORS)

## Definition of Done
- [x] Problemas 1-6 resolvidos com testes passando
- [x] Documentação sincronizada (api-contracts.md, architecture.md, AGENTS.md, etc.)
- [ ] Validação manual cross-origin em ambiente externo (depende de tk-100b)
