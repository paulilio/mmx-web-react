-- AlterTable
ALTER TABLE "RefreshSession" ADD COLUMN     "device_fingerprint" TEXT,
ADD COLUMN     "last_activity_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "last_ip" TEXT;

-- CreateIndex
CREATE INDEX "RefreshSession_device_fingerprint_idx" ON "RefreshSession"("device_fingerprint");
