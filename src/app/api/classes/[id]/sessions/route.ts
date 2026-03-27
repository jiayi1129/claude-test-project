import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: { id: string };
}

// GET /api/classes/[id]/sessions — list sessions for a class template
export async function GET(request: NextRequest, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const upcoming = searchParams.get("upcoming"); // "true" to only get upcoming
  const limit = parseInt(searchParams.get("limit") ?? "20", 10);
  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const skip = (page - 1) * limit;

  try {
    const template = await prisma.classTemplate.findUnique({
      where: { id: params.id },
      select: { id: true },
    });

    if (!template) {
      return NextResponse.json({ error: "Class template not found" }, { status: 404 });
    }

    const where = {
      templateId: params.id,
      ...(upcoming === "true" ? { startAt: { gte: new Date() } } : {}),
    };

    const [sessions, total] = await Promise.all([
      prisma.classSession.findMany({
        where,
        include: {
          instructor: {
            select: { id: true, name: true, email: true, image: true },
          },
          _count: {
            select: {
              bookings: {
                where: { status: { in: ["booked", "checked_in"] } },
              },
            },
          },
        },
        orderBy: { startAt: "asc" },
        skip,
        take: limit,
      }),
      prisma.classSession.count({ where }),
    ]);

    return NextResponse.json({
      data: sessions,
      total,
      page,
      pageSize: limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("[GET /api/classes/[id]/sessions]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
