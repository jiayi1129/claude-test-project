import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: { id: string };
}

// GET /api/classes/[id]
export async function GET(request: NextRequest, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const template = await prisma.classTemplate.findUnique({
      where: { id: params.id },
      include: {
        instructor: {
          select: { id: true, name: true, email: true, image: true },
        },
        waitlistConfig: true,
        classSessions: {
          where: { startAt: { gte: new Date() } },
          orderBy: { startAt: "asc" },
          take: 10,
          include: {
            instructor: {
              select: { id: true, name: true, email: true, image: true },
            },
            _count: { select: { bookings: true } },
          },
        },
      },
    });

    if (!template) {
      return NextResponse.json({ error: "Class template not found" }, { status: 404 });
    }

    return NextResponse.json({ data: template });
  } catch (error) {
    console.error("[GET /api/classes/[id]]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/classes/[id]
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = session.user.role;
  if (role !== "admin" && role !== "front_desk") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const existing = await prisma.classTemplate.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Class template not found" }, { status: 404 });
    }

    const body = await request.json();
    const {
      name,
      description,
      classType,
      instructorId,
      roomId,
      durationMinutes,
      capacity,
      onlineCapacity,
      recurrenceRule,
      bookingWindowDays,
      cancelWindowHours,
      lateCancelFee,
      noShowFee,
      virtualLink,
      isVirtual,
      isActive,
    } = body;

    // Validate provided fields
    if (name !== undefined && (typeof name !== "string" || name.trim() === "")) {
      return NextResponse.json({ error: "name must be a non-empty string" }, { status: 400 });
    }
    if (durationMinutes !== undefined && (typeof durationMinutes !== "number" || durationMinutes <= 0)) {
      return NextResponse.json({ error: "durationMinutes must be a positive number" }, { status: 400 });
    }
    if (capacity !== undefined && (typeof capacity !== "number" || capacity <= 0)) {
      return NextResponse.json({ error: "capacity must be a positive number" }, { status: 400 });
    }

    const updated = await prisma.classTemplate.update({
      where: { id: params.id },
      data: {
        ...(name !== undefined ? { name: name.trim() } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(classType !== undefined ? { classType } : {}),
        ...(instructorId !== undefined ? { instructorId } : {}),
        ...(roomId !== undefined ? { roomId } : {}),
        ...(durationMinutes !== undefined ? { durationMinutes } : {}),
        ...(capacity !== undefined ? { capacity } : {}),
        ...(onlineCapacity !== undefined ? { onlineCapacity } : {}),
        ...(recurrenceRule !== undefined ? { recurrenceRule } : {}),
        ...(bookingWindowDays !== undefined ? { bookingWindowDays } : {}),
        ...(cancelWindowHours !== undefined ? { cancelWindowHours } : {}),
        ...(lateCancelFee !== undefined ? { lateCancelFee } : {}),
        ...(noShowFee !== undefined ? { noShowFee } : {}),
        ...(virtualLink !== undefined ? { virtualLink } : {}),
        ...(isVirtual !== undefined ? { isVirtual } : {}),
        ...(isActive !== undefined ? { isActive } : {}),
      },
      include: {
        instructor: {
          select: { id: true, name: true, email: true, image: true },
        },
        waitlistConfig: true,
      },
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("[PATCH /api/classes/[id]]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/classes/[id]
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = session.user.role;
  if (role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const existing = await prisma.classTemplate.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Class template not found" }, { status: 404 });
    }

    // Soft-delete by marking inactive rather than hard delete
    // to preserve historical session data
    await prisma.classTemplate.update({
      where: { id: params.id },
      data: { isActive: false },
    });

    return NextResponse.json({ message: "Class template deactivated" });
  } catch (error) {
    console.error("[DELETE /api/classes/[id]]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
