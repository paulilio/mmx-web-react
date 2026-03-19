Para sistemas financeiros sérios, muitos acabam evoluindo do **ledger simples** para um **event ledger**.
Isso resolve auditoria completa e histórico perfeito.

A ideia central:

\`\`\`id="p7zqv4"
dados nunca são alterados
apenas novos eventos são registrados
\`\`\`

---

# 1. Problema que o event ledger resolve

Modelo tradicional:

\`\`\`id="6r7h8u"
UPDATE transactions
SET amount = 150
\`\`\`

Problema:

* histórico perdido
* difícil auditoria
* difícil depurar erros financeiros

---

# 2. Modelo event ledger

Em vez de alterar dados, criamos eventos.

Exemplo:

\`\`\`id="6h8f7e"
transaction_created
transaction_updated
transaction_deleted
\`\`\`

Cada evento vira um registro.

---

# 3. Tabela de eventos

\`\`\`sql id="8cxt0a"
ledger_events

id
event_type
entity_type
entity_id
payload
created_at
\`\`\`

Exemplo:

\`\`\`id="aj0wht"
event_type = transaction_created
entity_type = transaction
entity_id = tx_123
\`\`\`

Payload:

\`\`\`json id="imknj3"
{
 "amount": 120,
 "category": "food",
 "account": "checking"
}
\`\`\`

---

# 4. Exemplo real de alteração

Usuário corrige valor.

Evento 1:

\`\`\`id="2csu9a"
transaction_created
amount = 120
\`\`\`

Evento 2:

\`\`\`id="itkqmn"
transaction_updated
amount = 150
\`\`\`

Nada é apagado.

---

# 5. Estado atual da transação

Estado é derivado do último evento.

\`\`\`id="0wklj0"
select latest event
\`\`\`

Ou reconstruído via stream.

---

# 6. Estrutura Prisma para event ledger

\`\`\`prisma id="l4s5dr"
model LedgerEvent {
  id         String   @id @default(uuid())
  eventType  String
  entityType String
  entityId   String
  payload    Json
  createdAt  DateTime @default(now())
}
\`\`\`

---

# 7. Estrutura híbrida (mais comum)

A maioria dos SaaS usa **modelo híbrido**.

\`\`\`id="t5b2om"
tables normais
+
event log
\`\`\`

Assim:

\`\`\`id="9nkj2f"
transactions
transaction_lines
ledger_events
\`\`\`

Eventos servem para:

* auditoria
* debugging
* reconstrução de estado

---

# 8. Exemplo de evento de transação

Payload típico:

\`\`\`json id="7njjzw"
{
 "transactionId": "tx123",
 "amount": 120,
 "accountId": "acc1",
 "categoryId": "cat_food"
}
\`\`\`

---

# 9. Benefícios do event ledger

1 auditoria completa
2 debugging fácil
3 histórico imutável
4 possível event replay

---

# 10. Quando usar

Para MMX:

Use desde o início se pretende:

\`\`\`id="v8osqs"
multi-user
financeiro real
compliance
\`\`\`

Caso contrário:

ledger simples já funciona.

---

# 11. Estrutura final recomendada

\`\`\`id="b0e5x5"
users
accounts

transactions
transaction_lines

categories
category_groups

budget_months
budget_allocations

contacts

ledger_events
\`\`\`

---

# 12. Exemplo de fluxo real

Usuário cria transação.

\`\`\`id="vrm2wy"
insert transaction
insert transaction_line
insert ledger_event
\`\`\`

Três registros.

---

# 13. Logs financeiros importantes

Eventos úteis:

\`\`\`id="jqk0z3"
transaction_created
transaction_updated
transaction_deleted
budget_updated
category_created
account_created
\`\`\`

---

# 14. Impacto na arquitetura

Backend passa a ter um módulo:

\`\`\`id="3h4crl"
modules

ledger
transactions
budget
reports
\`\`\`

---

# 15. Benefício para relatórios

Relatórios podem usar:

\`\`\`id="a1q1jv"
transactions tables
\`\`\`

ou

\`\`\`id="5ydy4x"
event replay
\`\`\`

dependendo da necessidade.

---

Se quiser, posso também te mostrar **a arquitetura completa que apps tipo YNAB usam no backend**, incluindo **como calcular saldo, orçamento e relatórios sem ficar lento com milhões de transações**.
