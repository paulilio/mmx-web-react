-- AlterEnum: TransactionType ganha TRANSFER
ALTER TYPE "TransactionType" ADD VALUE 'TRANSFER';

-- CreateEnum: TransferRole
CREATE TYPE "TransferRole" AS ENUM ('DEBIT', 'CREDIT');

-- AlterTable: Transaction ganha accountId/transferGroupId/transferRole/transferKind
-- accountId entra como nullable, sera preenchido pelo backfill abaixo, depois ALTER NOT NULL
ALTER TABLE "Transaction"
  ADD COLUMN "accountId" TEXT,
  ADD COLUMN "transferGroupId" TEXT,
  ADD COLUMN "transferRole" "TransferRole",
  ADD COLUMN "transferKind" TEXT;

-- AlterTable: Transaction.categoryId fica nullable (TRANSFER nao tem categoria)
ALTER TABLE "Transaction" ALTER COLUMN "categoryId" DROP NOT NULL;

-- Data backfill: cria conta "Caixa Geral" (CASH) para cada usuario que tenha
-- transacoes sem accountId. Idempotente via NOT EXISTS.
INSERT INTO "Account" (
  "id",
  "userId",
  "name",
  "type",
  "status",
  "currency",
  "openingBalance",
  "openingBalanceDate",
  "isBusiness",
  "icon",
  "color",
  "createdAt",
  "updatedAt"
)
SELECT
  'caixa_geral_' || "userId" AS "id",
  "userId",
  'Caixa Geral' AS "name",
  'CASH'::"AccountType" AS "type",
  'ACTIVE'::"AccountStatus" AS "status",
  'BRL' AS "currency",
  0 AS "openingBalance",
  CURRENT_DATE AS "openingBalanceDate",
  FALSE AS "isBusiness",
  'Wallet' AS "icon",
  '#94A3B8' AS "color",
  NOW() AS "createdAt",
  NOW() AS "updatedAt"
FROM (
  SELECT DISTINCT t."userId"
  FROM "Transaction" t
  WHERE t."accountId" IS NULL
) AS users_with_orphan_tx
WHERE NOT EXISTS (
  SELECT 1 FROM "Account" a
  WHERE a."userId" = users_with_orphan_tx."userId"
    AND a."name" = 'Caixa Geral'
);

-- Backfill: liga toda transacao orfa ao Caixa Geral do user
UPDATE "Transaction" t
SET "accountId" = a."id"
FROM "Account" a
WHERE t."accountId" IS NULL
  AND a."userId" = t."userId"
  AND a."name" = 'Caixa Geral';

-- Promove accountId para NOT NULL (ja preenchido pelo backfill)
ALTER TABLE "Transaction" ALTER COLUMN "accountId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "Transaction_userId_accountId_date_idx" ON "Transaction"("userId", "accountId", "date");

-- CreateIndex
CREATE INDEX "Transaction_userId_transferGroupId_idx" ON "Transaction"("userId", "transferGroupId");
