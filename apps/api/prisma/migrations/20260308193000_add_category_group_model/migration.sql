-- CreateTable
CREATE TABLE "CategoryGroup" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "color" TEXT NOT NULL,
  "icon" TEXT NOT NULL,
  "status" "CategoryStatus" NOT NULL DEFAULT 'ACTIVE',
  "areaId" TEXT,
  "categoryIds" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CategoryGroup_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CategoryGroup_userId_status_idx" ON "CategoryGroup"("userId", "status");

-- CreateIndex
CREATE INDEX "CategoryGroup_userId_areaId_idx" ON "CategoryGroup"("userId", "areaId");

-- AddForeignKey
ALTER TABLE "CategoryGroup"
ADD CONSTRAINT "CategoryGroup_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
