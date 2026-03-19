-- AlterTable
ALTER TABLE "Transaction"
ADD COLUMN "deletedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Transaction_userId_deletedAt_date_idx"
ON "Transaction"("userId", "deletedAt", "date");
