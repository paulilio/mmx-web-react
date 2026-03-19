# TK-205: Database Improvements
Type: spike

## Objective
Aplicar melhorias incrementais de integridade, histórico e performance no banco de dados sem quebrar o modelo atual.

## Context
Fase 1 (baixo risco, alto retorno) já mapeada. Fases 2-5 são evolução de médio/longo prazo.

## Plan
- [ ] Fase 1.1: soft delete para transações (deletedAt + ajuste de consultas)
- [ ] Fase 1.2: unicidade de budget/budget-allocation (constraints Prisma)
- [ ] Fase 1.3: migrar agregações de relatórios para query no banco + índices compostos
- [ ] Fase 1.4: ledger_events auxiliar (id, userId, eventType, entityType, entityId, payload, createdAt)
- [ ] Fase 2+: evolução estrutural (saldo calculado no backend, envelope budgeting, projeções, ledger completo)

## Constraints
- Limpeza de dados legados antes de aplicar constraints de unicidade
- Falha de log em ledger_events não deve quebrar operação principal
- Preservar contrato {data, error} e isolamento por userId

## Definition of Done
- [ ] Fase 1 completa com testes cobrindo soft delete, unicidade, agregações no banco e ledger_events
- [ ] Zero quebra de contrato de API
- [ ] Métricas de latência de relatórios melhoradas
