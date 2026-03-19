Abaixo está um **schema Prisma inicial** para o backend do **MMX**, baseado em **ledger de transações**. Ele cobre usuários, contas, transações, categorias, orçamento, contatos e áreas.

---

# schema.prisma

\`\`\`prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id           String   @id @default(uuid())
  email        String   @unique
  passwordHash String
  createdAt    DateTime @default(now())
  lastLogin    DateTime?

  accounts     Account[]
  transactions Transaction[]
  categories   Category[]
  categoryGroups CategoryGroup[]
  budgets      Budget[]
  contacts     Contact[]
  areas        Area[]
}

model Area {
  id        String   @id @default(uuid())
  name      String
  userId    String
  createdAt DateTime @default(now())

  user      User     @relation(fields: [userId], references: [id])
  accounts  Account[]
  transactions Transaction[]
}

model Account {
  id        String   @id @default(uuid())
  name      String
  type      AccountType
  currency  String   @default("BRL")
  userId    String
  areaId    String?
  createdAt DateTime @default(now())

  user      User     @relation(fields: [userId], references: [id])
  area      Area?    @relation(fields: [areaId], references: [id])

  lines     TransactionLine[]
}

model Transaction {
  id          String   @id @default(uuid())
  userId      String
  areaId      String?
  description String?
  date        DateTime
  createdAt   DateTime @default(now())

  user        User     @relation(fields: [userId], references: [id])
  area        Area?    @relation(fields: [areaId], references: [id])

  lines       TransactionLine[]
}

model TransactionLine {
  id            String   @id @default(uuid())
  transactionId String
  accountId     String
  categoryId    String?
  contactId     String?
  amount        Decimal
  createdAt     DateTime @default(now())

  transaction   Transaction @relation(fields: [transactionId], references: [id])
  account       Account     @relation(fields: [accountId], references: [id])
  category      Category?   @relation(fields: [categoryId], references: [id])
  contact       Contact?    @relation(fields: [contactId], references: [id])
}

model CategoryGroup {
  id        String   @id @default(uuid())
  name      String
  order     Int
  userId    String
  createdAt DateTime @default(now())

  user      User     @relation(fields: [userId], references: [id])

  categories Category[]
}

model Category {
  id            String   @id @default(uuid())
  name          String
  type          CategoryType
  userId        String
  groupId       String?
  createdAt     DateTime @default(now())

  user          User           @relation(fields: [userId], references: [id])
  group         CategoryGroup? @relation(fields: [groupId], references: [id])

  lines         TransactionLine[]
  budgets       Budget[]
}

model Budget {
  id         String   @id @default(uuid())
  userId     String
  categoryId String
  month      DateTime
  amount     Decimal
  createdAt  DateTime @default(now())

  user       User     @relation(fields: [userId], references: [id])
  category   Category @relation(fields: [categoryId], references: [id])
}

model Contact {
  id        String   @id @default(uuid())
  name      String
  type      ContactType
  userId    String
  createdAt DateTime @default(now())

  user      User     @relation(fields: [userId], references: [id])

  lines     TransactionLine[]
}

enum AccountType {
  checking
  credit_card
  cash
  investment
}

enum CategoryType {
  expense
  income
  transfer
}

enum ContactType {
  merchant
  person
  company
}
\`\`\`

---

# Fluxo de dados financeiro

Exemplo de compra.

Transação:

\`\`\`
Compra supermercado
2026-03-10
\`\`\`

Linhas:

\`\`\`
Conta: checking
Categoria: food
Valor: -120
\`\`\`

Saldo da conta sempre vem de:

\`\`\`
SUM(transaction_lines.amount)
\`\`\`

---

# Índices recomendados

Adicione no Prisma:

\`\`\`prisma
@@index([userId, date])
\`\`\`

no model `Transaction`.

E:

\`\`\`prisma
@@index([accountId])
@@index([categoryId])
\`\`\`

no model `TransactionLine`.

Isso acelera relatórios.

---

# Queries comuns

Saldo de conta:

\`\`\`sql
SELECT SUM(amount)
FROM "TransactionLine"
WHERE accountId = $1;
\`\`\`

Gastos por categoria:

\`\`\`sql
SELECT categoryId, SUM(amount)
FROM "TransactionLine"
GROUP BY categoryId;
\`\`\`

Cashflow mensal:

\`\`\`sql
SELECT date_trunc('month', date), SUM(amount)
FROM transactions
JOIN transaction_lines
GROUP BY 1;
\`\`\`

---

# Estrutura final do backend

\`\`\`
mmx-api

src

modules
  auth
  transactions
  categories
  budgets
  reports
  contacts

shared
  database
  auth
  http
\`\`\`

---

# Próximo passo recomendado

Criar **seed inicial** com:

* categorias padrão
* grupos de categoria
* conta inicial

Isso facilita onboarding do usuário.

---

Se quiser, posso também te mostrar **a modelagem usada por apps tipo YNAB para budgets mensais**, que resolve vários problemas de controle de orçamento.
