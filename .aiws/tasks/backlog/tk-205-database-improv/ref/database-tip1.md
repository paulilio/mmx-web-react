Para apps de orçamento e finanças pessoais, como o **MMX**, a modelagem de banco precisa evitar três problemas clássicos:

* cálculos inconsistentes de saldo
* perda de histórico financeiro
* relatórios lentos

A solução usada em apps como **YNAB, Mint, Firefly III** é baseada em **ledger de transações imutáveis**.

---

# 1. Princípio fundamental

Nunca recalcular saldo a partir de atualizações.

Sempre derivar saldo de **transações registradas**.

Modelo:

```id="dbrh7g"
accounts
transactions
transaction_lines
categories
budgets
```

Isso segue lógica de **double-entry ledger simplificado**.

---

# 2. Tabela users

```id="mt6m8a"
users

id
email
password_hash
created_at
last_login
```

---

# 3. Tabela accounts

Contas financeiras.

```id="b6p35y"
accounts

id
user_id
name
type
currency
created_at
```

Exemplos de type:

```id="3r71og"
checking
credit_card
cash
investment
```

---

# 4. Tabela transactions

Evento financeiro.

```id="c7xjyd"
transactions

id
user_id
date
description
created_at
```

Uma transação pode ter **várias linhas financeiras**.

---

# 5. transaction_lines

Aqui fica o dinheiro real.

```id="mkkjze"
transaction_lines

id
transaction_id
account_id
category_id
amount
```

Exemplo.

Compra de supermercado:

```id="cfq2d7"
transaction

description = supermercado
date = 2026-03-10
```

Linhas:

```id="ap5f21"
account: checking
amount: -120

account: expenses
amount: +120
```

Saldo sempre fecha.

---

# 6. categories

Categorias de gasto.

```id="3gj7j6"
categories

id
user_id
name
type
```

Tipos:

```id="ek9zhb"
expense
income
transfer
```

---

# 7. category_groups

Agrupamento de categorias.

```id="yfhwh8"
category_groups

id
user_id
name
order_index
```

Exemplo:

```id="h9u4a4"
housing
transport
food
subscriptions
```

---

# 8. budgets

Orçamento por categoria.

```id="d57qiv"
budgets

id
user_id
category_id
month
amount
```

Exemplo:

```id="h7r84x"
food
2026-03
1000
```

---

# 9. contacts

Pagador ou recebedor.

```id="38f8au"
contacts

id
user_id
name
type
```

Tipos:

```id="yxm6n4"
merchant
person
company
```

---

# 10. áreas financeiras

Seu MMX tem `areas`.

Isso pode representar:

```id="qbyq63"
family
personal
business
```

Tabela:

```id="2tqk8s"
areas

id
user_id
name
```

Accounts e transactions podem referenciar.

---

# 11. reports

Relatórios não precisam de tabela.

Eles derivam de:

```id="jqsmkl"
transactions
transaction_lines
categories
```

Exemplo cashflow.

Query:

```id="3ar1p8"
sum(amount)
group by month
```

---

# 12. índices importantes

Para performance.

```id="9q9v9x"
transactions(user_id, date)

transaction_lines(account_id)

transaction_lines(category_id)

budgets(user_id, month)
```

---

# 13. princípio importante

Nunca deletar transações.

Use:

```id="o1m8bt"
soft delete
```

ou

```id="y4o1yr"
reversal transaction
```

Isso preserva histórico financeiro.

---

# 14. exemplo simples de saldo

Saldo de conta.

```id="b5ss8d"
SELECT SUM(amount)
FROM transaction_lines
WHERE account_id = ?
```

---

# 15. estrutura final de banco para MMX

```id="o9x0ae"
users

accounts

transactions
transaction_lines

categories
category_groups

budgets

contacts

areas
```

---

# 16. benefício desse modelo

Evita três bugs comuns:

* saldo divergente
* histórico perdido
* relatórios inconsistentes

Tudo sempre deriva de **ledger de transações**.

---

Se quiser, posso também te mostrar **um schema Prisma completo para esse modelo**, já preparado para o backend do MMX. Isso acelera muito o início do `mmx-api`.
