import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: { reportId: string } }
) {
  try {
    // Get user session
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Extract reportId and validate
    const { reportId } = params;
    if (!reportId) {
      return NextResponse.json({ error: "Missing reportId" }, { status: 400 });
    }

    // Parse request body
    const { status } = await request.json();
    if (!status) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 });
    }

    // Update report in database
    const updatedReport = await prisma.report.update({
      where: { id: reportId },
      data: { status },
      include: {
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

    // Respond with updated report
    return NextResponse.json(updatedReport);
  } catch (error) {
    console.error("Error updating report:", error);
    return NextResponse.json(
      { error: "Failed to update report status" },
      { status: 500 }
    );
  }
}
