/*
  Warnings:

  - The values [CRITICAL,LOW_PRIORITY] on the enum `ReportType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `latitude` on the `Report` table. All the data in the column will be lost.
  - You are about to drop the column `longitude` on the `Report` table. All the data in the column will be lost.
  - You are about to drop the column `reportId` on the `Report` table. All the data in the column will be lost.
  - You are about to drop the column `reportType` on the `Report` table. All the data in the column will be lost.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ReportType_new" AS ENUM ('EMERGENCY', 'NON_EMERGENCY', 'MAINTENANCE');
ALTER TABLE "Report" ALTER COLUMN "type" TYPE "ReportType_new" USING ("type"::text::"ReportType_new");
ALTER TYPE "ReportType" RENAME TO "ReportType_old";
ALTER TYPE "ReportType_new" RENAME TO "ReportType";
DROP TYPE "ReportType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "Report" DROP CONSTRAINT "Report_userId_fkey";

-- DropForeignKey
ALTER TABLE "moderator_responses" DROP CONSTRAINT "moderator_responses_moderatorId_fkey";

-- DropIndex
DROP INDEX "Report_reportId_idx";

-- DropIndex
DROP INDEX "Report_reportId_key";

-- AlterTable
ALTER TABLE "Report" DROP COLUMN "latitude",
DROP COLUMN "longitude",
DROP COLUMN "reportId",
DROP COLUMN "reportType",
ALTER COLUMN "userId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "User_id_seq";

-- AlterTable
ALTER TABLE "moderator_responses" ALTER COLUMN "moderatorId" SET DATA TYPE TEXT;

-- CreateIndex
CREATE INDEX "Report_userId_idx" ON "Report"("userId");

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "moderator_responses" ADD CONSTRAINT "moderator_responses_moderatorId_fkey" FOREIGN KEY ("moderatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
