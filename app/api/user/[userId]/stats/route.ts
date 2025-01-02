import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    console.log(params);
    const userId = parseInt(params.userId);
    
    if (isNaN(userId)) {
      return NextResponse.json(
        { error: "Invalid user ID" },
        { status: 400 }
      );
    }

    const totalReports = await prisma.report.count({
      where: { userId },
    });

    const uniqueLocations = await prisma.report.findMany({
      where: { userId },
      select: { location: true },
      distinct: ["location"],
    });

    const resolvedReports = await prisma.report.count({
      where: {
        userId,
        status: "RESOLVED",
      },
    });

    const responseRate = 
      totalReports > 0 ? (resolvedReports / totalReports) * 100 : 0;

    return NextResponse.json({
      reportsSubmitted: totalReports,
      communitiesHelped: uniqueLocations.length,
      responseRate: Math.round(responseRate * 100) / 100,
    });
  } catch (error) {
    console.error('Error in GET /api/users/[userId]/reports:', error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}