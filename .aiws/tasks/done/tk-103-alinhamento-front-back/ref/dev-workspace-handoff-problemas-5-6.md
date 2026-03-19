# Handoff: Problemas 5 e 6 — Alinhamento Front-Back

Data: 2026-03-09

## Concluido

Problema 5 executado de 5.1 a 5.7:
- mapeamento de bypass em app/settings/page.tsx
- criadas rotas first-party de settings: /api/settings/import, /api/settings/export, /api/settings/clear
- criado hook hooks/use-settings-maintenance.ts consumindo lib/client/api.ts
- refatorada app/settings/page.tsx para remover acesso direto a lib/server/storage e localStorage
- testes de rota e hook adicionados e passando
- documentacao sincronizada

Problema 6 executado de 6.1 a 6.7:
- mapeado uso de API_BASE no adapter (resolveApiUrl + requestApi)
- implementado credentials: "include" para requests externos (nao /api/*) em lib/client/api.ts
- validada nao regressao do first-party (/api/*)
- revisada compatibilidade CORS/credenciais (origem explicita + allow-credentials)
- testes unitarios do adapter ampliados
- docs sincronizadas

Checkpoint automatizado concluido com sucesso:
- pnpm test:unit, test:integration, lint, type-check, build

## Decisoes tecnicas

1. Credenciais cross-origin centralizadas no adapter em requestApi:
   - URL externa (API_BASE): credentials: "include"
   - URL first-party (/api/*): comportamento preservado

2. Fluxos de manutencao de settings convergidos para boundary oficial:
   - UI -> hooks/use-settings-maintenance.ts -> lib/client/api.ts -> /api/settings/*

3. Testes de contrato priorizados no boundary (lib/client/api.ts) e nas rotas first-party.

## Pendencias

- P1: Validacao manual cross-origin em ambiente com backend externo (item final ainda aberto)
- P2: Confirmar em ambiente real cookies de auth com NEXT_PUBLIC_USE_API=true e CORS por ambiente
- P3: Opcional — suite E2E dedicada para settings maintenance

## Proximos passos

- Executar e evidenciar a validacao manual cross-origin do problema 6 em ambiente externo.
