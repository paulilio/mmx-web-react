# TK-100a: Alpha Readiness — Backend + Frontend P0
Type: spike

## Objective
Validar readiness do backend para Alpha e definir/executar o pacote mínimo de frontend P0 para testes Alpha controladoss.

## Context
Roadmap Alpha definido após a Fase 1 (backend) estar ~84% concluída. Objetivo era confirmar que o backend estava pronto (ou pronto com restrições) e que o frontend tinha os fluxos P0 funcionando em API mode antes do deploy de infra.

## Plan
- [x] Bloco A: contrato e integridade de API (envelope, erros tipados, domínios)
- [x] Bloco B: auth, sessão e segurança baseline (JWT, refresh, middleware, hardening, OAuth)
- [x] Bloco C: gate técnico (test:unit, test:integration, lint, type-check, build)
- [~] Bloco D: gate de ambiente (development ok com warnings; production bloqueado por envs ausentes)
- [x] Frontend P0-01: auth e sessão em API mode
- [x] Frontend P0-02: transações + dashboard
- [x] Frontend P0-03: categorias, grupos e contatos
- [x] Frontend P0-04: budget principal (add funds, transfer, rollover)
- [x] Frontend P0-05: settings maintenance via first-party API

## Code Surface
- lib/client/api.ts — adapter com envelope {data, error}
- hooks/use-auth.tsx — auth convergido para backend
- hooks/use-session.ts — refresh via /api/auth/refresh
- app/api/auth/**, app/api/transactions/**, app/api/categories/**, app/api/budget/**
- middleware.ts — proteção de rotas

## Validation
- C1-C5 aprovados: 69 arquivos / 275 testes unit, 24 arquivos / 88 testes integration
- pnpm lint, type-check, build: ok
- D1 (dev): ok com warnings de env local
- D2 (prod): bloqueado — envs obrigatórias ausentes (resolvido em tk-100b)

## Definition of Done
- [x] Backend readiness confirmado (com restrição de envs de produção)
- [x] Frontend P0 definido e executado
- [x] Pacote de handoff para v0 produzido
- [x] Smoke test P0 definido
- [ ] Validação em ambiente real (depende de tk-100b — infra Alpha)
