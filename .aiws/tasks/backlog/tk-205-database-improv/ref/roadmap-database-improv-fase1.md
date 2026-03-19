# Roadmap - Database Improvements Fase 1 (MMX)

## Status de Execucao (2026-03-13)
- A1 (soft delete de transacoes): implementado em codigo e validado por testes.
- A2 (unicidade budget/budget-allocation): implementado em codigo e validado por testes.
- B1 (agregacao de relatorios no banco): implementado em codigo e validado por testes de servico e rotas.
- Migrations: aplicadas com sucesso no PostgreSQL via Docker (`pnpm docker:dev:up app` + `docker exec mmx-dev-app-1 pnpm prisma migrate deploy`).
- B2 (`ledger_events` auxiliar): implementado em codigo, migration aplicada e validado com testes.
- Status geral da Fase 1: concluida.

## Objetivo da Fase 1
Implementar melhorias incrementais de consistencia, rastreabilidade e performance sem quebrar contratos atuais de API e sem reestruturar o modelo financeiro completo.

## Escopo da Fase 1
1. Soft delete em transacoes (fim de delete fisico no fluxo principal).
2. Unicidade de budget e budget-allocation por escopo mensal.
3. Otimizacao de relatorios com agregacao no banco.
4. Event log auxiliar (`ledger_events`) para auditoria tecnica.

## Fora de Escopo da Fase 1
- Migracao para `accounts + transaction_lines` como modelo principal.
- Event sourcing como fonte primaria de verdade.
- Tabelas de projecao incremental (`category_spending`, `monthly_cashflow`, etc).

---

## Sequencia de Entrega

## Sprint A - Integridade e Historico

### A1) Soft Delete de Transacoes
**Meta**
- Substituir remocao fisica por remocao logica para preservar historico.

**Arquivos-alvo (implementacao)**
- `prisma/schema.prisma`
- `lib/server/repositories/transaction-repository.ts`
- `lib/server/services/transaction-service.ts`
- `app/api/transactions/[id]/route.ts`
- `lib/server/services/report-service.ts` (garantir filtro de `deletedAt`)

**Tarefas tecnicas**
1. Adicionar `deletedAt DateTime?` no model `Transaction`.
2. Adicionar indice para filtro frequente por registros ativos:
	- `@@index([userId, deletedAt, date])` (ajustar conforme query planner real).
3. Trocar `delete()` do repository por `update({ deletedAt: now })`.
4. Garantir que `findById`, `findMany` e `findAllByUser` considerem apenas `deletedAt = null`.
5. Manter compatibilidade de contrato de rota (`200 + envelope`) sem expor detalhes internos.

**Testes**
- Repository: remove marca `deletedAt` e nao remove registro fisico.
- Service: `remove` continua com semantica de exclusao para o caller.
- Route: `DELETE` retorna sucesso e item removido nao aparece em `GET`.
- Reports: transacoes removidas logicamente nao entram nos calculos.

**Risco**
- Baixo.

**Definition of Done (A1)**
- Nenhum fluxo principal faz `DELETE` fisico de transacao.
- Listagens/relatorios ignoram soft-deleted.
- Testes da feature verdes.

### A2) Unicidade de Budget Mensal
**Meta**
- Eliminar duplicidade estrutural de budget/alocacao mensal por usuario.

**Arquivos-alvo (implementacao)**
- `prisma/schema.prisma`
- `lib/server/repositories/budget-repository.ts`
- `lib/server/repositories/budget-allocation-repository.ts`
- `lib/server/services/budget-service.ts`
- `app/api/budget/route.ts` (se necessario para mensagem de erro)
- `app/api/budget-allocations/route.ts` (se necessario para mensagem de erro)

**Tarefas tecnicas**
1. Adicionar constraints de unicidade:
	- `Budget`: `@@unique([userId, categoryGroupId, year, month])`
	- `BudgetAllocation`: `@@unique([userId, budgetGroupId, month])`
2. Antes da migration, rodar script de diagnostico de duplicidades em ambiente de desenvolvimento.
3. Tratar erro de unicidade no service e mapear para mensagem de dominio amigavel.
4. Preservar contrato de resposta `{ data, error }`.

**Testes**
- Criacao duplicada deve retornar erro de dominio claro.
- Criacao valida continua funcionando.
- Integracao de rotas confirma status esperado e envelope correto.

**Risco**
- Baixo a medio (dados legados podem exigir saneamento).

**Definition of Done (A2)**
- Constraints aplicadas por migration.
- Nenhuma duplicidade nova e mensagens de erro claras no fluxo.

---

## Sprint B - Performance e Auditoria

### B1) Relatorios com Agregacao no Banco
**Meta**
- Tirar agregacao principal da memoria e executar no banco para reduzir latencia.

**Arquivos-alvo (implementacao)**
- `lib/server/services/report-service.ts`
- `lib/server/repositories/transaction-repository.ts` (ou novo repositorio de relatorios)
- `app/api/reports/summary/route.ts`
- `app/api/reports/aging/route.ts`
- `app/api/reports/cashflow/route.ts`
- `prisma/schema.prisma` (indices adicionais)

**Tarefas tecnicas**
1. Introduzir metodos de agregacao por SQL/Prisma no backend.
2. Aplicar filtros no banco (`userId`, `status`, `type`, `date range`, `deletedAt = null`).
3. Indices recomendados:
	- `@@index([userId, date])`
	- `@@index([userId, status, date])`
	- `@@index([userId, type, date])`
4. Manter payload final de resposta inalterado para frontend.

**Testes**
- Regressao de relatorios (mesmos valores esperados dos cenarios atuais).
- Casos de filtros invalidos e combinacoes de status.
- Garantia de exclusao logica respeitada.

**Risco**
- Baixo.

**Definition of Done (B1)**
- Relatorios principais nao iteram em memoria todo o conjunto de transacoes.
- Ganho de latencia medido em ambiente local/CI com dataset de referencia.

### B2) Event Log Auxiliar (`ledger_events`)
**Meta**
- Criar trilha tecnica de eventos financeiros sem alterar fonte primaria de dados.

**Arquivos-alvo (implementacao)**
- `prisma/schema.prisma`
- `lib/server/repositories/ledger-event-repository.ts` (novo)
- `lib/server/services/transaction-service.ts`
- `lib/server/services/index.ts`
- `lib/server/services/ledger-event-service.ts` (opcional, recomendado)

**Tarefas tecnicas**
1. Criar model `LedgerEvent`:
	- `id`, `userId`, `eventType`, `entityType`, `entityId`, `payload`, `createdAt`.
2. Registrar eventos em create/update/delete logico de transacao:
	- `transaction_created`
	- `transaction_updated`
	- `transaction_deleted`
3. Implementar fail-safe: falha de gravacao do evento nao bloqueia operacao principal (com log tecnico interno).
4. Garantir isolamento por `userId`.

**Testes**
- Evento criado para cada operacao principal de transacao.
- Validacao de payload minimo.
- Simulacao de falha no log sem quebrar fluxo de transacao.

**Risco**
- Baixo.

**Definition of Done (B2)**
- Tabela de eventos ativa em producao.
- Eventos minimos sendo gravados de forma consistente.

---

## Plano de Migracoes
1. Migration 1: `Transaction.deletedAt` + indices relacionados.
2. Migration 2: constraints de unicidade em `Budget` e `BudgetAllocation`.
3. Migration 3: model `LedgerEvent` + indices (`userId`, `entityType`, `entityId`, `createdAt`).
4. Validacao de migration:
	- `pnpm prisma migrate dev`
	- `pnpm prisma generate`
	- `pnpm test:integration`

## Plano de Testes e Validacao
- `pnpm test:unit`
- `pnpm test:integration`
- `pnpm lint`
- `pnpm type-check`
- `pnpm build`
- `pnpm validate:env -- --env=development`

## Guardrails de Arquitetura
- Manter fluxo: `app/api -> services -> domain -> repositories -> prisma`.
- Nao importar `repositories/prisma` diretamente nas rotas `app/api/**/route.ts`.
- Preservar contrato de resposta `{ data, error }`.
- Preservar isolamento por `userId` em toda leitura/escrita.

## Riscos e Mitigacoes
1. Duplicidades legadas quebrarem migration de unicidade.
	- Mitigacao: script de diagnostico e saneamento antes de aplicar constraint.
2. Regressao em relatorios por mudanca de agregacao.
	- Mitigacao: snapshot de cenarios atuais + testes de regressao comparativa.
3. Sobrecarga por escrita de eventos.
	- Mitigacao: payload minimo, indices objetivos e observabilidade por metrica.

## Criterios de Conclusao da Fase 1
1. Transacoes com soft delete e sem remocao fisica no fluxo principal.
2. Budget e BudgetAllocation protegidos contra duplicidade mensal por escopo.
3. Relatorios principais agregando no banco com melhora de latencia observavel.
4. Event log auxiliar ativo para operacoes de transacao.
5. Sem quebra de contrato de API e sem regressao funcional nas suites principais.

## Proximo Passo Apos Fase 1
Executar Fase 2 (consistencia financeira server-side), removendo dependencia de `currentBalance` vindo do cliente para validacao critica de despesa.
