import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/classes — list all class templates for the studio
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const isActive = searchParams.get("isActive");
  const classType = searchParams.get("classType");

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { studioId: true, role: true },
    });

    if (!user?.studioId) {
      return NextResponse.json({ error: "No studio associated" }, { status: 400 });
    }

    const templates = await prisma.classTemplate.findMany({
      where: {
        studioId: user.studioId,
        ...(isActive !== null ? { isActive: isActive === "true" } : {}),
        ...(classType ? { classType } : {}),
      },
      include: {
        instructor: {
          select: { id: true, name: true, email: true, image: true },
        },
        waitlistConfig: true,
        _count: {
          select: { classSessions: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: templates });
  } catch (error) {
    console.error("[GET /api/classes]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/classes — create a new class template
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = session.user.role;
  if (role !== "admin" && role !== "front_desk") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { studioId: true },
    });

    if (!user?.studioId) {
      return NextResponse.json({ error: "No studio associated" }, { status: 400 });
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
      waitlistEnabled,
      waitlistMode,
      maxWaitlistSize,
      cutoffMinutesBeforeClass,
    } = body;

    // Basic validation
    if (!name || typeof name !== "string" || name.trim() === "") {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }
    if (!classType || typeof classType !== "string") {
      return NextResponse.json({ error: "classType is required" }, { status: 400 });
    }
    if (!durationMinutes || typeof durationMinutes !== "number" || durationMinutes <= 0) {
      return NextResponse.json({ error: "durationMinutes must be a positive number" }, { status: 400 });
    }
    if (!capacity || typeof capacity !== "number" || capacity <= 0) {
      return NextResponse.json({ error: "capacity must be a positive number" }, { status: 400 });
    }
    if (onlineCapacity === undefined || typeof onlineCapacity !== "number" || onlineCapacity < 0) {
      return NextResponse.json({ error: "onlineCapacity must be a non-negative number" }, { status: 400 });
    }

    const template = await prisma.classTemplate.create({
      data: {
        studioId: user.studioId,
        name: name.trim(),
        description: description ?? null,
        classType,
        instructorId: instructorId ?? null,
        roomId: roomId ?? null,
        durationMinutes,
        capacity,
        onlineCapacity,
        recurrenceRule: recurrenceRule ?? null,
        bookingWindowDays: bookingWindowDays ?? 7,
        cancelWindowHours: cancelWindowHours ?? 2,
        lateCancelFee: lateCancelFee ?? null,
        noShowFee: noShowFee ?? null,
        virtualLink: virtualLink ?? null,
        isVirtual: isVirtual ?? false,
        waitlistConfig:
          waitlistEnabled !== undefined
            ? {
                create: {
                  enabled: waitlistEnabled,
                  mode: waitlistMode ?? "auto_add",
                  maxWaitlistSize: maxWaitlistSize ?? 10,
                  cutoffMinutesBeforeClass: cutoffMinutesBeforeClass ?? 30,
                },
              }
            : undefined,
      },
      include: {
        instructor: {
          select: { id: true, name: true, email: true, image: true },
        },
        waitlistConfig: true,
      },
    });

    return NextResponse.json({ data: template }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/classes]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
