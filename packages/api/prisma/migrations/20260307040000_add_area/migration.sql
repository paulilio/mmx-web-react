-- CreateEnum
CREATE TYPE "AreaType" AS ENUM ('INCOME', 'EXPENSE', 'FIXED_EXPENSES', 'DAILY_EXPENSES', 'PERSONAL', 'TAXES_FEES');

-- CreateEnum
CREATE TYPE "AreaStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateTable
CREATE TABLE "Area" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "type" "AreaType" NOT NULL,
  "color" TEXT NOT NULL,
  "icon" TEXT NOT NULL,
  "status" "AreaStatus" NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Area_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Area_userId_status_idx" ON "Area"("userId", "status");

-- CreateIndex
CREATE INDEX "Area_userId_type_idx" ON "Area"("userId", "type");

-- AddForeignKey
ALTER TABLE "Area"
ADD CONSTRAINT "Area_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
