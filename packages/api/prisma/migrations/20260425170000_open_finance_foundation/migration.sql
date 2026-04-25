-- ---- Open Finance foundation ----
-- New enums, 4 new tables, 1 new column on Transaction.

-- CreateEnum
CREATE TYPE "BankConnectionStatus" AS ENUM ('SYNCING', 'ACTIVE', 'EXPIRED', 'REVOKED', 'ERROR');

-- CreateEnum
CREATE TYPE "ImportedTransactionStatus" AS ENUM ('PENDING', 'IMPORTED', 'DUPLICATE', 'IGNORED');

-- CreateEnum
CREATE TYPE "ImportedTransactionSource" AS ENUM ('TRANSACTION', 'BILL');

-- CreateEnum
CREATE TYPE "SyncJobStatus" AS ENUM ('PENDING', 'RUNNING', 'DONE', 'FAILED');

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN "importedFromOpenFinance" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "BankConnection" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerLinkId" TEXT NOT NULL,
    "institutionCode" TEXT NOT NULL,
    "institutionName" TEXT NOT NULL,
    "status" "BankConnectionStatus" NOT NULL DEFAULT 'SYNCING',
    "consentExpiresAt" TIMESTAMP(3),
    "lastSyncedAt" TIMESTAMP(3),
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BankConnection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImportedTransaction" (
    "id" TEXT NOT NULL,
    "bankConnectionId" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "source" "ImportedTransactionSource" NOT NULL,
    "rawPayload" JSONB NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'BRL',
    "occurredAt" DATE NOT NULL,
    "description" TEXT NOT NULL,
    "merchantName" TEXT,
    "categoryHint" TEXT,
    "status" "ImportedTransactionStatus" NOT NULL DEFAULT 'PENDING',
    "matchedTransactionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ImportedTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpenFinanceSyncJob" (
    "id" TEXT NOT NULL,
    "bankConnectionId" TEXT NOT NULL,
    "status" "SyncJobStatus" NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "scheduledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "lastError" TEXT,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OpenFinanceSyncJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebhookEvent" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "eventType" TEXT,
    "payload" JSONB NOT NULL,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),

    CONSTRAINT "WebhookEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BankConnection_userId_idx" ON "BankConnection"("userId");

-- CreateIndex
CREATE INDEX "BankConnection_userId_status_idx" ON "BankConnection"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "BankConnection_provider_providerLinkId_key" ON "BankConnection"("provider", "providerLinkId");

-- CreateIndex
CREATE INDEX "ImportedTransaction_bankConnectionId_status_idx" ON "ImportedTransaction"("bankConnectionId", "status");

-- CreateIndex
CREATE INDEX "ImportedTransaction_occurredAt_idx" ON "ImportedTransaction"("occurredAt");

-- CreateIndex
CREATE UNIQUE INDEX "ImportedTransaction_bankConnectionId_externalId_key" ON "ImportedTransaction"("bankConnectionId", "externalId");

-- CreateIndex
CREATE INDEX "OpenFinanceSyncJob_status_scheduledAt_idx" ON "OpenFinanceSyncJob"("status", "scheduledAt");

-- CreateIndex
CREATE INDEX "OpenFinanceSyncJob_bankConnectionId_idx" ON "OpenFinanceSyncJob"("bankConnectionId");

-- CreateIndex
CREATE INDEX "WebhookEvent_source_processed_idx" ON "WebhookEvent"("source", "processed");

-- CreateIndex
CREATE INDEX "WebhookEvent_receivedAt_idx" ON "WebhookEvent"("receivedAt");

-- AddForeignKey
ALTER TABLE "BankConnection" ADD CONSTRAINT "BankConnection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImportedTransaction" ADD CONSTRAINT "ImportedTransaction_bankConnectionId_fkey" FOREIGN KEY ("bankConnectionId") REFERENCES "BankConnection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImportedTransaction" ADD CONSTRAINT "ImportedTransaction_matchedTransactionId_fkey" FOREIGN KEY ("matchedTransactionId") REFERENCES "Transaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpenFinanceSyncJob" ADD CONSTRAINT "OpenFinanceSyncJob_bankConnectionId_fkey" FOREIGN KEY ("bankConnectionId") REFERENCES "BankConnection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
