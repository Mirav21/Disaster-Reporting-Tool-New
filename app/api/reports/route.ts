import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { ReportStatus, ReportType, Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

// Mark route as dynamic
export const dynamic = 'force-dynamic';

// Helper function to validate enum values
function isValidReportType(type: string): type is ReportType {
  return Object.values(ReportType).includes(type as ReportType);
}

function isValidReportStatus(status: string): status is ReportStatus {
  return Object.values(ReportStatus).includes(status as ReportStatus);
}

export async function GET(request: Request) {
  try {
    // Get session
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get query parameters from URL
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');

    // Initialize where clause with proper Prisma type
    const where: Prisma.ReportWhereInput = {};

    // Only add status to where clause if it's a valid enum value
    if (status && isValidReportStatus(status)) {
      where.status = status;
    }

    // Only add type to where clause if it's a valid enum value
    if (type && isValidReportType(type)) {
      where.type = type;
    }

    const reports = await prisma.report.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        reportId: true,
        type: true,
        title: true,
        description: true,
        location: true,
        latitude: true,
        longitude: true,
        image: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        userId: true,
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        assignedTeams: true,
        moderatorResponses: {
          include: {
            moderator: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(reports);
  } catch (error) {
    console.error("Error fetching reports:", error);
    return NextResponse.json(
      { error: "Failed to fetch reports" },
      { status: 500 }
    );
  }
}