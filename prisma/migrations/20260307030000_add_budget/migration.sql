-- migration: add Budget and BudgetAllocation tables

CREATE TABLE IF NOT EXISTS "Budget" (
  "id" text PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" text NOT NULL,
  "categoryGroupId" text NOT NULL,
  "month" integer NOT NULL,
  "year" integer NOT NULL,
  "planned" numeric(14,2) NOT NULL,
  "funded" numeric(14,2) NOT NULL,
  "spent" numeric(14,2) NOT NULL DEFAULT 0,
  "rolloverEnabled" boolean NOT NULL DEFAULT false,
  "rolloverAmount" numeric(14,2),
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "Budget_userId_categoryGroupId_idx" ON "Budget" ("userId", "categoryGroupId");
CREATE INDEX IF NOT EXISTS "Budget_userId_month_year_idx" ON "Budget" ("userId", "month", "year");

CREATE TABLE IF NOT EXISTS "BudgetAllocation" (
  "id" text PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" text NOT NULL,
  "budgetGroupId" text NOT NULL,
  "categoryGroupId" text,
  "month" text NOT NULL,
  "plannedAmount" numeric(14,2) NOT NULL,
  "fundedAmount" numeric(14,2) NOT NULL,
  "spentAmount" numeric(14,2) NOT NULL DEFAULT 0,
  "availableAmount" numeric(14,2) NOT NULL,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "BudgetAllocation_userId_budgetGroupId_idx" ON "BudgetAllocation" ("userId", "budgetGroupId");
CREATE INDEX IF NOT EXISTS "BudgetAllocation_userId_month_idx" ON "BudgetAllocation" ("userId", "month");
