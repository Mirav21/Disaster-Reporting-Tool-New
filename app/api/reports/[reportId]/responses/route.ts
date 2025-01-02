import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

// Handle POST request to create a moderator response
export async function POST(
  request: Request,
  { params }: { params: { reportId: string } }
) {
  try {
    // Get session to verify user authentication
    const session = await getServerSession(authOptions);
    console.log(session)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const reportId = params.reportId;

    // Parse the request body to get the message
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Create a new moderator response
    const response = await prisma.moderatorResponse.create({
      data: {
        message,
        report: { connect: { reportId } },
        moderator: { connect: { id: Number(session.user.id) } },
      },
      include: {
        moderator: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("Error creating moderator response:", error);
    return NextResponse.json(
      { error: "Failed to create moderator response" },
      { status: 500 }
    );
  }
}

// Handle unsupported HTTP methods
export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

