/*
  Warnings:

  - The values [MAINTENANCE] on the enum `ReportType` will be removed. If these variants are still used in the database, this will fail.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[reportId]` on the table `Report` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `reportId` to the `Report` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reportType` to the `Report` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `userId` on the `Report` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `moderatorId` on the `moderator_responses` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ReportType_new" AS ENUM ('CRITICAL', 'LOW_PRIORITY', 'EMERGENCY', 'NON_EMERGENCY');
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
DROP INDEX "Report_userId_idx";

-- AlterTable
ALTER TABLE "Report" ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION,
ADD COLUMN     "reportId" TEXT NOT NULL,
ADD COLUMN     "reportType" TEXT NOT NULL,
DROP COLUMN "userId",
ADD COLUMN     "userId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "moderator_responses" DROP COLUMN "moderatorId",
ADD COLUMN     "moderatorId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Report_reportId_key" ON "Report"("reportId");

-- CreateIndex
CREATE INDEX "Report_reportId_idx" ON "Report"("reportId");

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "moderator_responses" ADD CONSTRAINT "moderator_responses_moderatorId_fkey" FOREIGN KEY ("moderatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
