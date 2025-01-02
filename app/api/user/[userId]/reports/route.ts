import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(
    request: Request,
    { params }: { params: { userId: string } }
  ) {
    try {
      const userId = parseInt(params.userId);
      const { searchParams } = new URL(request.url);
      const limit = parseInt(searchParams.get('limit') ?? '5');
  
      const reports = await prisma.report.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: {
          id: true,
          reportType: true,
          location: true,
          createdAt: true,
          status: true,
          type: true,
        },
      });
  
      return NextResponse.json(reports);
    } catch (error) {
      console.error(error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }