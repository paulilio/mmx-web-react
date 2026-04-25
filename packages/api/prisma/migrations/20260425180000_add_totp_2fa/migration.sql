/*
  Warnings:

  - You are about to drop the column `passwordHash` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN "totpEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "totpSecret" TEXT,
ADD COLUMN "totpBackupCodes" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "totpBackupCodesUsed" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "totpEnabledAt" TIMESTAMP(3);
