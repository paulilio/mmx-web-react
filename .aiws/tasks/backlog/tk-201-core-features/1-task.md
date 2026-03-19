# TK-201: Core Features (Fase 2)
Type: feature

## Objective
Implementar as funcionalidades principais do produto: contas bancárias, transferências, relatórios avançados, notificações, busca global e importação OFX/CSV.

## Context
Status atual: 28%. Backend e contratos da Fase 1 são a fundação. Executar na ordem: contas → transferências → relatórios → notificações+busca → importação.

## Plan
- [ ] Bloco A: domínio de contas bancárias (CRUD completo, hook, UI)
- [ ] Bloco B: transferências entre contas (atomicidade, validações, auditoria)
- [ ] Bloco C: relatórios avançados + exportação PDF/Excel
- [ ] Bloco D: notificações in-app + busca global unificada
- [ ] Bloco E: importação OFX/CSV (parser, preview, deduplicação)

## Constraints
- Preservar envelope {data, error} em todos os novos endpoints
- Isolamento por userId em todas as leituras/escritas
- UI via hooks + lib/client/api.ts (sem bypass de storage)
- NEXT_PUBLIC_USE_API=true sem fallback mock

## Definition of Done
- [ ] CRUD de contas bancárias completo e validado
- [ ] Transferência entre contas com operação atômica
- [ ] Relatórios com exportação PDF/Excel funcionando
- [ ] Notificações in-app com regras mínimas
- [ ] Busca global unificada funcionando
- [ ] Importação OFX/CSV com preview e deduplicação
- [ ] quality gates: test:unit, test:integration, lint, type-check, build
