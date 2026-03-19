-- CreateTable
CREATE TABLE "LedgerEvent" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "eventType" TEXT NOT NULL,
  "entityType" TEXT NOT NULL,
  "entityId" TEXT NOT NULL,
  "payload" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "LedgerEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LedgerEvent_userId_createdAt_idx"
ON "LedgerEvent"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "LedgerEvent_entityType_entityId_idx"
ON "LedgerEvent"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "LedgerEvent_eventType_createdAt_idx"
ON "LedgerEvent"("eventType", "createdAt");

-- AddForeignKey
ALTER TABLE "LedgerEvent"
ADD CONSTRAINT "LedgerEvent_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
