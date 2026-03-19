Apps de finanças que crescem muito, como **YNAB, Mint, Firefly III**, usam uma arquitetura específica para manter **saldo e relatórios rápidos**, mesmo com milhões de transações.

O segredo é separar **ledger bruto** de **projeções agregadas**.

---

# 1. Duas camadas de dados

Arquitetura típica:

\`\`\`id="4d77wq"
Ledger (fonte da verdade)

transactions
transaction_lines
\`\`\`

e

\`\`\`id="0dnkht"
Projeções agregadas

account_balances
category_spending
monthly_cashflow
\`\`\`

Ledger nunca muda.
Projeções podem ser recalculadas.

---

# 2. Ledger permanece imutável

\`\`\`id="gk92av"
transactions
transaction_lines
\`\`\`

Cada movimento financeiro fica ali.

Saldo real sempre pode ser recalculado.

---

# 3. Problema de performance

Se você sempre fizer:

\`\`\`sql id="fq9xq0"
SELECT SUM(amount)
FROM transaction_lines
WHERE account_id = ?
\`\`\`

em milhões de linhas, relatórios ficam lentos.

---

# 4. Solução usada por fintechs

Criar **tabelas de agregação incremental**.

Exemplo.

\`\`\`sql id="sx2rfk"
account_balances
\`\`\`

\`\`\`id="uxx2x7"
account_id
date
balance
\`\`\`

Isso permite calcular saldo muito rápido.

---

# 5. Exemplo de saldo incremental

Quando uma transação acontece:

\`\`\`id="y9dth9"
transaction created
\`\`\`

Atualiza:

\`\`\`id="qqj9c2"
account_balances
\`\`\`

Fluxo:

\`\`\`id="9o5q0l"
ledger insert
→ balance update
\`\`\`

---

# 6. Tabela de gastos por categoria

Outra projeção útil.

\`\`\`sql id="u4p3in"
category_spending
\`\`\`

Campos:

\`\`\`id="41gr93"
user_id
category_id
month
amount
\`\`\`

Assim relatórios ficam instantâneos.

---

# 7. Cashflow mensal

Tabela agregada.

\`\`\`sql id="udr9k9"
monthly_cashflow

user_id
month
income
expenses
\`\`\`

Atualizada conforme transações chegam.

---

# 8. Prisma models sugeridos

\`\`\`prisma id="h3tiyh"
model AccountBalance {
  id        String   @id @default(uuid())
  accountId String
  date      DateTime
  balance   Decimal

  account   Account  @relation(fields: [accountId], references: [id])
}
\`\`\`

---

\`\`\`prisma id="tccqlm"
model CategorySpending {
  id         String   @id @default(uuid())
  userId     String
  categoryId String
  month      DateTime
  amount     Decimal
}
\`\`\`

---

\`\`\`prisma id="mqn6q7"
model MonthlyCashflow {
  id       String   @id @default(uuid())
  userId   String
  month    DateTime
  income   Decimal
  expenses Decimal
}
\`\`\`

---

# 9. Fluxo completo de transação

Usuário cria transação.

Fluxo backend:

\`\`\`id="o64tch"
1 insert transaction
2 insert transaction_lines
3 update account_balances
4 update category_spending
5 update monthly_cashflow
\`\`\`

Tudo na mesma transaction SQL.

---

# 10. Benefício

Relatórios passam a ser:

\`\`\`id="ibd51k"
SELECT * FROM category_spending
WHERE month = ?
\`\`\`

em vez de processar milhões de linhas.

---

# 11. Arquitetura de módulos backend

\`\`\`id="gnmuj4"
modules

transactions
ledger
balances
budget
reports
\`\`\`

Cada módulo tem responsabilidade clara.

---

# 12. Estrutura final de banco recomendada

\`\`\`id="zws7o8"
users

accounts

transactions
transaction_lines

categories
category_groups

budget_months
budget_allocations

contacts
areas

account_balances
category_spending
monthly_cashflow

ledger_events
\`\`\`

---

# 13. Escala bem

Com esse modelo:

* 10 mil transações → rápido
* 1 milhão → ainda rápido

Porque relatórios usam **tabelas agregadas**.

---

# 14. Como fintechs fazem

Arquitetura final:

\`\`\`id="4y6vwi"
ledger tables
↓
event bus
↓
projection tables
↓
reports
\`\`\`

---

# 15. Dica importante para o MMX

Se quiser manter simples no início:

Use apenas:

\`\`\`id="fcb1dl"
transactions
transaction_lines
budgets
categories
\`\`\`

E adicione projeções depois.

---

Se quiser, posso também te mostrar **um diagrama completo da arquitetura do MMX (frontend + backend + banco + docker)** que junta tudo o que discutimos.
