-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('CHECKING', 'SAVINGS', 'CREDIT_CARD', 'INVESTMENT', 'BUSINESS', 'CASH', 'OTHER');

-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('ACTIVE', 'ARCHIVED', 'PENDING_REVIEW');

-- CreateTable
CREATE TABLE "Account" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "institutionName" TEXT,
  "type" "AccountType" NOT NULL,
  "status" "AccountStatus" NOT NULL DEFAULT 'ACTIVE',
  "currency" TEXT NOT NULL DEFAULT 'BRL',
  "openingBalance" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "openingBalanceDate" DATE NOT NULL,
  "color" TEXT,
  "icon" TEXT,
  "isBusiness" BOOLEAN NOT NULL DEFAULT false,
  "creditLimit" DECIMAL(14,2),
  "closingDay" INTEGER,
  "dueDay" INTEGER,
  "bankConnectionId" TEXT,
  "externalId" TEXT,
  "archivedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_userId_name_key" ON "Account"("userId", "name");

-- CreateIndex
CREATE INDEX "Account_userId_status_idx" ON "Account"("userId", "status");

-- CreateIndex
CREATE INDEX "Account_userId_type_idx" ON "Account"("userId", "type");

-- CreateIndex
CREATE INDEX "Account_bankConnectionId_idx" ON "Account"("bankConnectionId");

-- AddForeignKey
ALTER TABLE "Account"
ADD CONSTRAINT "Account_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
