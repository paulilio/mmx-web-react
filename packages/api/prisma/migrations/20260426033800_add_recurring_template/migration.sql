-- ---- RecurringTemplate (recorrência como modelo de primeira classe) ----
-- 3 enums, 1 nova tabela RecurringTemplate, 4 colunas em Transaction, backfill idempotente.

-- CreateEnum
CREATE TYPE "RecurrenceFrequency" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY');

-- CreateEnum
CREATE TYPE "WeekOfMonth" AS ENUM ('FIRST', 'SECOND', 'THIRD', 'FOURTH', 'LAST');

-- CreateEnum
CREATE TYPE "DayOfWeekEnum" AS ENUM ('SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY');

-- CreateTable
CREATE TABLE "RecurringTemplate" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "frequency" "RecurrenceFrequency" NOT NULL,
    "interval" INTEGER NOT NULL DEFAULT 1,
    "daysOfWeek" "DayOfWeekEnum"[] DEFAULT ARRAY[]::"DayOfWeekEnum"[],
    "dayOfMonth" INTEGER,
    "weekOfMonth" "WeekOfMonth",
    "monthOfYear" INTEGER,
    "monthlyMode" TEXT,
    "count" INTEGER,
    "startDate" DATE NOT NULL,
    "endDate" DATE,
    "paused" BOOLEAN NOT NULL DEFAULT false,
    "pausedAt" TIMESTAMP(3),
    "templateAmount" DECIMAL(14,2) NOT NULL,
    "templateDescription" TEXT NOT NULL DEFAULT '',
    "templateNotes" TEXT,
    "templateType" "TransactionType" NOT NULL,
    "templateCategoryId" TEXT NOT NULL,
    "templateContactId" TEXT,
    "templateAreaId" TEXT,
    "templateCategoryGroupId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecurringTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RecurringTemplate_userId_paused_idx" ON "RecurringTemplate"("userId", "paused");

-- CreateIndex
CREATE INDEX "RecurringTemplate_userId_createdAt_idx" ON "RecurringTemplate"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "RecurringTemplate"
    ADD CONSTRAINT "RecurringTemplate_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "Transaction"
    ADD COLUMN "templateId" TEXT,
    ADD COLUMN "seriesIndex" INTEGER,
    ADD COLUMN "skipped" BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN "isException" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Transaction_userId_templateId_date_idx" ON "Transaction"("userId", "templateId", "date");

-- CreateIndex
CREATE INDEX "Transaction_userId_skipped_idx" ON "Transaction"("userId", "skipped");

-- AddForeignKey
ALTER TABLE "Transaction"
    ADD CONSTRAINT "Transaction_templateId_fkey"
    FOREIGN KEY ("templateId") REFERENCES "RecurringTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ---- Backfill: séries legadas (recurrence Json) → RecurringTemplate ----
-- Idempotente: WHERE templateId IS NULL filtra rows já backfilladas.
-- Skipa rows malformadas (frequency inválida ou amount não-decimal) silenciosamente.

DO $backfill$
DECLARE
    root_record RECORD;
    new_template_id TEXT;
    freq_text TEXT;
    freq_enum "RecurrenceFrequency";
BEGIN
    FOR root_record IN
        SELECT t.id, t."userId", t."recurrence", t."date", t."amount", t."description",
               t."type", t."categoryId", t."contactId", t."areaId", t."categoryGroupId",
               t."notes", t."createdAt"
        FROM "Transaction" t
        WHERE t."recurrence" IS NOT NULL
          AND t."deletedAt" IS NULL
          AND t."templateId" IS NULL
          AND COALESCE((t."recurrence"->>'enabled')::boolean, false) = true
          AND (t."recurrence"->>'generatedFrom') IS NULL
    LOOP
        BEGIN
            -- Parse frequency safely
            freq_text := UPPER(COALESCE(root_record."recurrence"->>'frequency', 'MONTHLY'));
            IF freq_text NOT IN ('DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY') THEN
                CONTINUE;
            END IF;
            freq_enum := freq_text::"RecurrenceFrequency";

            new_template_id := 'tpl_' || root_record.id;

            INSERT INTO "RecurringTemplate" (
                "id", "userId", "frequency", "interval",
                "count", "startDate", "endDate",
                "paused",
                "templateAmount", "templateDescription", "templateNotes", "templateType",
                "templateCategoryId", "templateContactId", "templateAreaId", "templateCategoryGroupId",
                "createdAt", "updatedAt"
            )
            VALUES (
                new_template_id,
                root_record."userId",
                freq_enum,
                COALESCE((root_record."recurrence"->>'interval')::int, 1),
                NULLIF((root_record."recurrence"->>'count')::text, '')::int,
                root_record."date",
                NULLIF((root_record."recurrence"->>'endDate')::text, '')::date,
                false,
                root_record."amount",
                root_record."description",
                root_record."notes",
                root_record."type",
                root_record."categoryId",
                root_record."contactId",
                root_record."areaId",
                root_record."categoryGroupId",
                root_record."createdAt",
                NOW()
            )
            ON CONFLICT (id) DO NOTHING;

            -- Vincula a transação raiz
            UPDATE "Transaction"
            SET "templateId" = new_template_id, "seriesIndex" = 1
            WHERE id = root_record.id AND "templateId" IS NULL;

            -- Vincula filhas (recurrence.generatedFrom = root.id), com seriesIndex calculado por ordem de data
            UPDATE "Transaction" t
            SET "templateId" = new_template_id,
                "seriesIndex" = sub.idx
            FROM (
                SELECT id, ROW_NUMBER() OVER (ORDER BY date, "createdAt") + 1 AS idx
                FROM "Transaction"
                WHERE "userId" = root_record."userId"
                  AND "deletedAt" IS NULL
                  AND "recurrence"->>'generatedFrom' = root_record.id
                  AND "templateId" IS NULL
            ) sub
            WHERE t.id = sub.id;

        EXCEPTION WHEN OTHERS THEN
            -- Loga e continua: row malformada não aborta a migration
            RAISE NOTICE 'Backfill skip row id=%: %', root_record.id, SQLERRM;
        END;
    END LOOP;
END
$backfill$;
