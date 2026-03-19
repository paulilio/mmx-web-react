-- CreateIndex
CREATE UNIQUE INDEX "Budget_userId_categoryGroupId_year_month_key"
ON "Budget"("userId", "categoryGroupId", "year", "month");

-- CreateIndex
CREATE UNIQUE INDEX "BudgetAllocation_userId_budgetGroupId_month_key"
ON "BudgetAllocation"("userId", "budgetGroupId", "month");
