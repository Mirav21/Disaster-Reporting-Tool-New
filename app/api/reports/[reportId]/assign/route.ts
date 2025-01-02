import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function POST(
  request: Request,
  { params }: { params: { reportId: string } }
) {
  try {
    // Get user session
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Extract report ID from params
    const id  = params.reportId;
    if (!id) {
      return NextResponse.json({ error: "Missing report ID" }, { status: 400 });
    }

    // Parse request body
    const { teamId } = await request.json();
    if (!teamId) {
      return NextResponse.json({ error: "Team ID is required" }, { status: 400 });
    }

    // Update report by connecting team
    const updatedReport = await prisma.report.update({
      where: { id },
      data: {
        assignedTeams: {
          connect: { id: teamId },
        },
      },
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

    return NextResponse.json(updatedReport);
  } catch (error) {
    console.error("Error assigning team:", error);
    return NextResponse.json(
      { error: "Failed to assign team" },
      { status: 500 }
    );
  }
}