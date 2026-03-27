import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import type { MembershipType, BillingCycle } from "@prisma/client";

interface RouteContext {
  params: { id: string };
}

// GET /api/plans/[id]
export async function GET(req: NextRequest, { params }: RouteContext) {
  const { id } = params;

  try {
    const plan = await prisma.membershipPlan.findUnique({
      where: { id },
    });

    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    return NextResponse.json({ data: plan });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(`GET /api/plans/${id} error: ${message}`);
    return NextResponse.json({ error: "Failed to fetch plan" }, { status: 500 });
  }
}

// PATCH /api/plans/[id] — admin only
export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  if (session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const existing = await prisma.membershipPlan.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Plan not found" }, { status: 404 });
  }

  const {
    name,
    description,
    type,
    price,
    billingCycle,
    creditCount,
    creditExpireDays,
    allowedClassTypes,
    bookingPriorityDays,
    isActive,
    isIntroOffer,
    maxPurchasesPerMember,
  } = body as Record<string, unknown>;

  // Validate type if provided
  if (type !== undefined) {
    const validTypes: MembershipType[] = ["unlimited", "pack", "drop_in", "intro", "trial"];
    if (!validTypes.includes(type as MembershipType)) {
      return NextResponse.json(
        { error: `type must be one of: ${validTypes.join(", ")}` },
        { status: 400 }
      );
    }
  }

  // Validate billingCycle if provided
  if (billingCycle !== undefined) {
    const validCycles: BillingCycle[] = ["monthly", "weekly", "annual", "once"];
    if (!validCycles.includes(billingCycle as BillingCycle)) {
      return NextResponse.json(
        { error: `billingCycle must be one of: ${validCycles.join(", ")}` },
        { status: 400 }
      );
    }
  }

  if (price !== undefined) {
    const priceNumber = Number(price);
    if (isNaN(priceNumber) || priceNumber < 0) {
      return NextResponse.json(
        { error: "price must be a non-negative number" },
        { status: 400 }
      );
    }
  }

  try {
    // If name changed and a Stripe product exists, update it
    if (name && existing.stripeProductId && name !== existing.name) {
      await stripe.products.update(existing.stripeProductId, {
        name: name as string,
        ...(description !== undefined
          ? { description: (description as string) || undefined }
          : {}),
      });
    }

    const updated = await prisma.membershipPlan.update({
      where: { id },
      data: {
        ...(name !== undefined ? { name: name as string } : {}),
        ...(description !== undefined ? { description: description as string | null } : {}),
        ...(type !== undefined ? { type: type as MembershipType } : {}),
        ...(price !== undefined ? { price: Number(price) } : {}),
        ...(billingCycle !== undefined ? { billingCycle: billingCycle as BillingCycle } : {}),
        ...(creditCount !== undefined
          ? { creditCount: creditCount === null ? null : Number(creditCount) }
          : {}),
        ...(creditExpireDays !== undefined
          ? { creditExpireDays: creditExpireDays === null ? null : Number(creditExpireDays) }
          : {}),
        ...(allowedClassTypes !== undefined
          ? { allowedClassTypes: Array.isArray(allowedClassTypes) ? (allowedClassTypes as string[]) : [] }
          : {}),
        ...(bookingPriorityDays !== undefined
          ? { bookingPriorityDays: Number(bookingPriorityDays) }
          : {}),
        ...(isActive !== undefined ? { isActive: Boolean(isActive) } : {}),
        ...(isIntroOffer !== undefined ? { isIntroOffer: Boolean(isIntroOffer) } : {}),
        ...(maxPurchasesPerMember !== undefined
          ? { maxPurchasesPerMember: maxPurchasesPerMember === null ? null : Number(maxPurchasesPerMember) }
          : {}),
      },
    });

    return NextResponse.json({ data: updated });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(`PATCH /api/plans/${id} error: ${message}`);
    return NextResponse.json({ error: "Failed to update plan" }, { status: 500 });
  }
}

// DELETE /api/plans/[id] — admin only (soft-delete: set isActive = false)
export async function DELETE(req: NextRequest, { params }: RouteContext) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  if (session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = params;

  try {
    const existing = await prisma.membershipPlan.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    // Archive in Stripe if a product exists
    if (existing.stripeProductId) {
      await stripe.products.update(existing.stripeProductId, { active: false });
    }

    // Soft-delete: mark as inactive rather than hard-delete to preserve history
    const archived = await prisma.membershipPlan.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({ data: archived });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(`DELETE /api/plans/${id} error: ${message}`);
    return NextResponse.json({ error: "Failed to archive plan" }, { status: 500 });
  }
}
