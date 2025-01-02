/*
  Warnings:

  - You are about to drop the column `reportType` on the `Report` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Report" DROP COLUMN "reportType";

-- CreateTable
CREATE TABLE "rescue_teams" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "specialization" TEXT NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rescue_teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "moderator_responses" (
    "id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reportId" TEXT NOT NULL,
    "moderatorId" INTEGER NOT NULL,

    CONSTRAINT "moderator_responses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ReportRescueTeam" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ReportRescueTeam_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ReportRescueTeam_B_index" ON "_ReportRescueTeam"("B");

-- AddForeignKey
ALTER TABLE "moderator_responses" ADD CONSTRAINT "moderator_responses_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "moderator_responses" ADD CONSTRAINT "moderator_responses_moderatorId_fkey" FOREIGN KEY ("moderatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ReportRescueTeam" ADD CONSTRAINT "_ReportRescueTeam_A_fkey" FOREIGN KEY ("A") REFERENCES "Report"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ReportRescueTeam" ADD CONSTRAINT "_ReportRescueTeam_B_fkey" FOREIGN KEY ("B") REFERENCES "rescue_teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;
