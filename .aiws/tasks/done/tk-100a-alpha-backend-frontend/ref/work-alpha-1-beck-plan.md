# Etapa 1 - Readiness Backend (Alpha)

Data de referencia: 2026-03-11
Camada: Operacional
Origem: Etapa 1 do roadmap Alpha

## 1. Objetivo

Confirmar readiness backend para liberar a versao Alpha com risco controlado.

## 3. Checklist Objetivo de Readiness

## Bloco A - Contrato e Integridade de API

- [x] A1 - Envelope padrao ativo em first-party API (`{ data, error }`)
  - Status: done
  - Evidencia: lib/server/http/api-response.ts, app/api/transactions/route.ts, docs/api-contracts.md

- [x] A2 - Erros tipados no adapter sem fallback automatico para mock em NEXT_PUBLIC_USE_API=true
  - Status: done
  - Evidencia: lib/client/api.ts, lib/client/api.test.ts

- [x] A3 - Dominios first-party essenciais respondendo: auth, transactions, categories, category-groups, contacts, budget, budget-allocations, areas, settings, reports/*
  - Status: done

## Bloco B - Auth, Sessao e Seguranca Baseline

- [x] B1 - Auth backend funcional (login/register/refresh/logout) — done
- [x] B2 - JWT + refresh rotation/revocation ativos — done
- [x] B3 - Middleware protegendo rotas API com 401 AUTH_REQUIRED — done
- [x] B4 - Hardening ativo (rate limiting, CORS, cookies HttpOnly/SameSite/Secure, security headers) — done
- [x] B5 - OAuth Google/Microsoft sem regressao — done

## Bloco C - Gate Tecnico Obrigatorio

- [x] C1 - pnpm test:unit — done (69 arquivos, 275 testes)
- [x] C2 - pnpm test:integration — done (24 arquivos, 88 testes)
- [x] C3 - pnpm lint — done (sem warnings nem errors)
- [x] C4 - pnpm type-check — done (tsc --noEmit sem erros)
- [x] C5 - pnpm build — done (next build com sucesso)

## Bloco D - Gate de Ambiente

- [ ] D1 - validate:env development — partial (ok com warnings de env local ausente)
- [ ] D2 - validate:env production — blocked (9 erros por variaveis obrigatorias ausentes)
- [ ] D3 - Revisao de variaveis obrigatorias — blocked
- [ ] D4 - Validacao de banco e migracoes — pendente (executar no deploy Alpha)

## Bloco E - Pendencias

### E1 - Bloqueia Alpha
1. validate:env production falhou — envs obrigatorias ausentes: DATABASE_URL, MMX_APP_ENV, CORS_ORIGINS_PROD, GOOGLE_*, MICROSOFT_*
2. D4 (migracoes em banco real) ainda nao executado

### E2 - Hardening pos-Alpha
1. Pipeline CI obrigatorio no repositorio
2. Checklist operacional de go-live

### E3 - Divida tecnica monitorada
1. Remocao de compatibilidades legadas no adapter
2. Revisao da descontinuacao de use-budget.ts

## 5. Decisao Formal

Status desta rodada:
- Resultado tecnico de codigo: aprovado (C1-C5 ok)
- Resultado de ambiente production: reprovado ate configurar envs reais
