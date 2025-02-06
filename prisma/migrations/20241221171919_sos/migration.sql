-- CreateTable
CREATE TABLE "SOSAlert" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "radius" DOUBLE PRECISION NOT NULL,
    "message" TEXT NOT NULL,
    "recipientCount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SOSAlert_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SOSAlert" ADD CONSTRAINT "SOSAlert_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
