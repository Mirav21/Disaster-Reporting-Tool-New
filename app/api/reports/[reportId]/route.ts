import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

export async function PATCH(
  request: Request,
  { params }: { params: { reportId: string } }
) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { status } = await request.json();
    const report = await prisma.report.update({
      where: { id: params.reportId },
      data: { status },
    });

    return NextResponse.json(report);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error updating report" },
      { status: 500 }
    );
  }
}


export async function GET() {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const reports = await prisma.report.findMany({
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
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(reports)
  } catch (error) {
    console.error('Failed to fetch reports:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


