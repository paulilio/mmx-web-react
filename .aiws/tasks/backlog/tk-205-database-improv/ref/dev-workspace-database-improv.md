# Database Improvements - MMX

## Decisao Executiva

- Adotar agora: melhorias incrementais de integridade, historico e performance.
- Adotar depois: evolucoes estruturais maiores (ledger completo e projecoes em escala).
- Nao adotar agora: reescrita total do dominio financeiro em event sourcing.

## Fase 1 - Aplicar Agora (baixo risco, alto retorno)

1) Preservar historico financeiro (evitar delete fisico)
- Introduzir soft delete para transacoes (campo deletedAt)
- Em operacoes de remocao, preferir marcacao logica em vez de DELETE fisico

2) Reforcar integridade de budget mensal
- Unicidade: Budget por usuario + grupo + ano + mes
- Unicidade: BudgetAllocation por usuario + budgetGroupId + mes

3) Otimizar relatorios no banco
- Migrar agregacoes para query no banco: resumo, aging, cashflow
- Indices compostos: Transaction(userId, date), Transaction(userId, status, date), Transaction(userId, type, date)

4) Iniciar trilha de auditoria leve (ledger_events auxiliar)
- Campos: id, userId, eventType, entityType, entityId, payload, createdAt
- Eventos: transaction_created, transaction_updated, transaction_deleted
- Falha de log nao deve quebrar operacao principal (fail-safe)

## Plano de Evolucao (medio e longo prazo)

Fase 2: Consolidacao de consistencia financeira (saldo calculado no backend)
Fase 3: Envelope budgeting mais robusto (budget_month, carry over deterministico)
Fase 4: Projecoes agregadas (quando houver gargalo real)
Fase 5: Ledger estrutural (accounts + transaction_lines) e event-driven avancado

## Ordem de Implementacao Recomendada

1. Soft delete de transacoes
2. Unicidade de budget/budget-allocation
3. Queries de relatorio no banco + indices
4. ledger_events auxiliar
5. Fase 2+ somente apos estabilizar Fase 1

## Metricas de Sucesso

- Reducao de incidentes por inconsistencias de dados financeiros
- Reducao de tempo medio das rotas de relatorio
- Capacidade de auditoria sem perda de historico
- Zero quebra de contrato { data, error } e isolamento por userId
