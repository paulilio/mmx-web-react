Apps de orçamento como **YNAB** usam um modelo chamado **envelope budgeting**.
Cada categoria recebe um valor mensal. As transações consomem esse valor.

Isso evita dois problemas comuns:

* orçamento que não fecha no mês
* saldo negativo invisível

---

# 1. Conceito central

Cada mês tem um **pool de dinheiro disponível**.

Exemplo:

\`\`\`id="n4oyay"
Saldo disponível no mês: 5000
\`\`\`

Distribuição:

\`\`\`id="oh7sy7"
Food: 1000
Transport: 600
Rent: 2000
Subscriptions: 200
Savings: 1200
\`\`\`

Isso cria **envelopes financeiros**.

---

# 2. Tabela de budget mensal

Modelo recomendado.

\`\`\`sql id="cdspop"
budget_months

id
user_id
month
income_planned
income_received
created_at
\`\`\`

Exemplo:

\`\`\`id="nqkjsa"
user_id = 1
month = 2026-03
income_planned = 5000
income_received = 4800
\`\`\`

---

# 3. Tabela budget allocations

Define quanto cada categoria recebe.

\`\`\`sql id="cfjz0p"
budget_allocations

id
budget_month_id
category_id
planned_amount
created_at
\`\`\`

Exemplo:

\`\`\`id="dnmdja"
Food = 1000
Transport = 600
Subscriptions = 200
\`\`\`

---

# 4. Consumo do orçamento

Consumo vem das transações.

Query:

\`\`\`sql id="s3c5p3"
SELECT
category_id,
SUM(amount)
FROM transaction_lines
WHERE category_id IS NOT NULL
AND date BETWEEN month_start AND month_end
GROUP BY category_id
\`\`\`

---

# 5. Cálculo do envelope

Fórmula:

\`\`\`id="ljuflu"
remaining =
planned_amount
- expenses_in_month
\`\`\`

Exemplo:

\`\`\`id="61dhts"
Food planned = 1000
Food spent = 650

Remaining = 350
\`\`\`

---

# 6. Carry over de saldo

YNAB usa carry over automático.

Se sobrar:

\`\`\`id="qotbif"
Food remaining = 200
\`\`\`

Mês seguinte:

\`\`\`id="71fag5"
Food available = planned + carry_over
\`\`\`

Exemplo:

\`\`\`id="hx7r5r"
planned = 1000
carry_over = 200

available = 1200
\`\`\`

---

# 7. Modelo Prisma para budgets

Adicionando ao schema anterior.

\`\`\`prisma id="r3w5x7"
model BudgetMonth {
  id             String   @id @default(uuid())
  userId         String
  month          DateTime
  incomePlanned  Decimal
  incomeReceived Decimal?
  createdAt      DateTime @default(now())

  user           User     @relation(fields: [userId], references: [id])

  allocations    BudgetAllocation[]
}
\`\`\`

---

\`\`\`prisma id="sb2ibg"
model BudgetAllocation {
  id            String   @id @default(uuid())
  budgetMonthId String
  categoryId    String
  plannedAmount Decimal
  createdAt     DateTime @default(now())

  budgetMonth   BudgetMonth @relation(fields: [budgetMonthId], references: [id])
  category      Category    @relation(fields: [categoryId], references: [id])
}
\`\`\`

---

# 8. Query para relatório de orçamento

Exemplo simplificado.

\`\`\`sql id="vwsu7y"
SELECT
c.name,
b.planned_amount,
COALESCE(SUM(t.amount),0) AS spent
FROM budget_allocations b
JOIN categories c ON c.id = b.category_id
LEFT JOIN transaction_lines t
  ON t.category_id = c.id
GROUP BY c.name, b.planned_amount
\`\`\`

---

# 9. Benefícios desse modelo

Evita problemas clássicos:

* orçamento inconsistente
* categorias sem controle
* relatórios difíceis

Tudo deriva de:

\`\`\`id="htl8m5"
transactions
budget_allocations
\`\`\`

---

# 10. Estrutura final recomendada do banco MMX

\`\`\`id="ifhx0c"
users

areas

accounts

transactions
transaction_lines

categories
category_groups

budget_months
budget_allocations

contacts
\`\`\`

---

# 11. Relatórios que ficam fáceis

Com esse modelo:

\`\`\`id="r45w1q"
cashflow
spending by category
budget vs actual
aging
\`\`\`

ficam simples.

---

# 12. Dica importante para apps financeiros

Sempre salvar **amount como Decimal**.

Nunca float.

Exemplo:

\`\`\`id="hyupnp"
Decimal(12,2)
\`\`\`

Evita erros de arredondamento.

---

Se quiser, posso te mostrar também **uma melhoria de arquitetura de banco que quase todos os apps de finanças acabam adotando depois**, chamada **event ledger**. Ela resolve auditoria financeira e histórico perfeito de mudanças.
