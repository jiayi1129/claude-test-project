import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/memberships — current member's active memberships
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  // Admins can query by memberId; members always get their own
  const targetMemberId =
    session.user.role === "admin"
      ? (searchParams.get("memberId") ?? session.user.id)
      : session.user.id;

  try {
    const memberships = await prisma.memberMembership.findMany({
      where: {
        memberId: targetMemberId,
        status: { in: ["active", "paused"] },
      },
      include: {
        plan: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: memberships });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(`GET /api/memberships error: ${message}`);
    return NextResponse.json(
      { error: "Failed to fetch memberships" },
      { status: 500 }
    );
  }
}
