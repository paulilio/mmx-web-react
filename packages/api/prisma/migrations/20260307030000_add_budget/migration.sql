-- CreateTable
CREATE TABLE "Budget" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "categoryGroupId" TEXT NOT NULL,
  "month" INTEGER NOT NULL,
  "year" INTEGER NOT NULL,
  "planned" DECIMAL(14,2) NOT NULL,
  "funded" DECIMAL(14,2) NOT NULL,
  "spent" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "rolloverEnabled" BOOLEAN NOT NULL DEFAULT false,
  "rolloverAmount" DECIMAL(14,2),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Budget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BudgetAllocation" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "budgetGroupId" TEXT NOT NULL,
  "categoryGroupId" TEXT,
  "month" TEXT NOT NULL,
  "plannedAmount" DECIMAL(14,2) NOT NULL,
  "fundedAmount" DECIMAL(14,2) NOT NULL,
  "spentAmount" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "availableAmount" DECIMAL(14,2) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "BudgetAllocation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Budget_userId_categoryGroupId_idx" ON "Budget"("userId", "categoryGroupId");

-- CreateIndex
CREATE INDEX "Budget_userId_month_year_idx" ON "Budget"("userId", "month", "year");

-- CreateIndex
CREATE INDEX "BudgetAllocation_userId_budgetGroupId_idx" ON "BudgetAllocation"("userId", "budgetGroupId");

-- CreateIndex
CREATE INDEX "BudgetAllocation_userId_month_idx" ON "BudgetAllocation"("userId", "month");

-- AddForeignKey
ALTER TABLE "Budget"
ADD CONSTRAINT "Budget_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetAllocation"
ADD CONSTRAINT "BudgetAllocation_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
