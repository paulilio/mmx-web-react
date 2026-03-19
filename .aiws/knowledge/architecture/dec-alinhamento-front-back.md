# DEC: Alinhamento Frontend-Backend — 6 Problemas Resolvidos (TK-103)

## Decision
Resolver 6 problemas de desalinhamento entre frontend e backend em uma única task de refactoring, priorizando corretude técnica sem alterar contratos públicos ou UI.

## Context
Após o cutover do backend DDD (tk-101), o frontend ainda usava padrões do legado: sem desembrulhar envelope, auth via localStorage, endpoints inexistentes, settings com bypass de storage e requests sem credentials cross-origin.

## Options Considered
- Opção 1 (Rápido, 1-2 dias): adaptar apenas o adapter no frontend, sem corrigir auth ou settings
- Opção 2 (Intermediário, 3-5 dias): resolver problemas críticos em sequência
- Opção 3 (Completo, 1-2 semanas): resolver todos os 6 problemas com testes e docs completos

## Rationale
Opção 3 foi escolhida para garantir base sólida antes do Alpha, evitando débito técnico que bloquearia infra e testes em ambiente real.

## Impact
Cada problema e sua resolução:

1. **Envelope** — handleResponse em lib/client/api.ts desembrulha { data, error }; compatibilidade legada preservada
2. **Auth frontend** — use-auth.tsx e use-session.ts integrados com /api/auth/* via cookies; localStorage removido dos fluxos de produção
3. **Endpoints faltantes** — category-groups e reports/* implementados como first-party
4. **Budget** — use-budget.ts deprecado; caminho oficial via use-budget-allocations
5. **Settings** — app/settings/page.tsx convergido: UI → use-settings-maintenance.ts → lib/client/api.ts → /api/settings/*
6. **Credentials** — credentials:"include" para requests externos (API_BASE); first-party preservado

Regra resultante para credentials:
- URL externa (NEXT_PUBLIC_API_BASE): `credentials: "include"`
- URL first-party (/api/*): comportamento padrão preservado

Pendência residual:
- Validação manual cross-origin em ambiente com backend externo (depende de tk-100b — infra Alpha)
- Confirmar cookies de auth em chamadas externas com NEXT_PUBLIC_USE_API=true e CORS por ambiente
