/*
  Warnings:

  - You are about to drop the column `timestamp` on the `ActivityLog` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "ActivityLog_userId_timestamp_idx";

-- AlterTable
ALTER TABLE "ActivityLog" DROP COLUMN "timestamp",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "ActivityLog_userId_createdAt_idx" ON "ActivityLog"("userId", "createdAt" DESC);
