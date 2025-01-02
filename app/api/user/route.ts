import { NextResponse } from "next/server";
// import { getServerSession } from "next-auth";
import { PrismaClient, Prisma } from "@prisma/client";
// import { authOptions } from "@/lib/auth";
import { Role } from "@prisma/client";

const prisma = new PrismaClient();

// export async function GET(req: Request) {
//   try {
//     const session = await getServerSession(authOptions);
//     console.log("Session:", session);

//     if (!session || session.user.role !== "ADMIN") {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const { searchParams } = new URL(req.url);
//     const search = searchParams.get("search") || "";
//     const role = searchParams.get("role");

//     const whereCondition: Prisma.UserWhereInput = {};
//     if (search) {
//       whereCondition.OR = [
//         { name: { contains: search, mode: "insensitive" } },
//         { email: { contains: search, mode: "insensitive" } },
//       ];
//     }
//     if (role) {
//       whereCondition.role = role as Prisma.UserRole;
//     }

//     const users = await prisma.user.findMany({
//       where: whereCondition,
//       select: {
//         id: true,
//         name: true,
//         email: true,
//         role: true,
//         _count: {
//           select: { reports: true },
//         },
//       },
//     });

//     console.log("Fetched users:", users);
//     return NextResponse.json(users);
//   } catch (error) {
//     console.error("Failed to fetch users:", error);

//     if (error instanceof Prisma.PrismaClientKnownRequestError) {
//       if (error.code === "P1001") {
//         return NextResponse.json(
//           { error: "Cannot connect to the database. Please try again later." },
//           { status: 503 }
//         );
//       }

//       if (error.code === "P2024") {
//         return NextResponse.json(
//           { error: "Database connection timeout. Please try again." },
//           { status: 504 }
//         );
//       }
//     }

//     return NextResponse.json(
//       { error: "Failed to fetch users" },
//       { status: 500 }
//     );
//   } finally {
//     // Disconnect Prisma for serverless environments
//     if (process.env.VERCEL) {
//       await prisma.$disconnect();
//     }
//   }
// }

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const role = searchParams.get("role");
  const limit = searchParams.get("limit");

  try {
    const whereCondition: Prisma.UserWhereInput = {};
    if (role) {
      whereCondition.role = role as Role;
    }

    const users = await prisma.user.findMany({
      where: whereCondition,
      ...(limit && { take: parseInt(limit) }),
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

// export async function PATCH(req: Request) {
//   try {
//     const session = await getServerSession(authOptions);
//     if (!session || session.user.role !== "ADMIN") {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const body = await req.json();
//     const { id, role } = body;

//     if (!id || !role) {
//       return NextResponse.json({ error: "User ID and role are required" }, { status: 400 });
//     }

//     const updatedUser = await prisma.user.update({
//       where: { id },
//       data: { role: role as UserRole },
//       select: {
//         id: true,
//         name: true,
//         email: true,
//         role: true,
//       },
//     });

//     return NextResponse.json(updatedUser);
//   } catch (error) {
//     console.error("Failed to update user:", error);
//     return NextResponse.json(
//       { error: "Failed to update user" },
//       { status: 500 }
//     );
//   }
// }

// export async function DELETE(req: Request) {
//   try {
//     const session = await getServerSession(authOptions);
//     if (!session || session.user.role !== "ADMIN") {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const { searchParams } = new URL(req.url);
//     const id = searchParams.get("id");

//     if (!id) {
//       return NextResponse.json({ error: "User ID is required" }, { status: 400 });
//     }

//     await prisma.user.delete({
//       where: { id },
//     });

//     return NextResponse.json({ message: "User deleted successfully" });
//   } catch (error) {
//     console.error("Failed to delete user:", error);
//     return NextResponse.json(
//       { error: "Failed to delete user" },
//       { status: 500 }
//     );
//   } finally {
//     // Disconnect Prisma for serverless environments
//     if (process.env.VERCEL) {
//       await prisma.$disconnect();
//     }
//   }
// }

