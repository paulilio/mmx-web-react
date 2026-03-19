# TK-202: Qualidade e UX (Fase 3)
Type: feature

## Objective
Aumentar confiabilidade de entrega e qualidade da experiência: testes E2E, cobertura de testes, acessibilidade, responsividade, internacionalização e loading states.

## Context
Status atual: 12%. Fundação técnica (Vitest, Testing Library) está pronta. Executar na ordem: testes E2E + unitários → acessibilidade + responsividade → i18n + loading states.

## Plan
- [ ] Bloco A: testes E2E (auth, transações, budget, cenários de erro) + cobertura unitária/integração
- [ ] Bloco B: auditoria WCAG + correções + responsividade mobile
- [ ] Bloco C: fundação i18n (EN + PT-BR) + loading/empty/error states padronizados

## Constraints
- UI via hooks + lib/client/api.ts (sem bypass em testes)
- Mensagens ao usuário em português até i18n concluído
- Envelope {data, error} preservado nos cenários testados

## Definition of Done
- [ ] E2E dos fluxos críticos concluído
- [ ] Lacunas de cobertura unitária/integração reduzidas
- [ ] Auditoria WCAG com correções críticas aplicadas
- [ ] Telas principais ajustadas para mobile
- [ ] Fundação i18n implantada e testada
- [ ] Loading states padronizados nas páginas principais
