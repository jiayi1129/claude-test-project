import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import type { MembershipType, BillingCycle } from "@prisma/client";

// GET /api/plans — list active plans for a studio
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const studioId = searchParams.get("studioId");

  if (!studioId) {
    return NextResponse.json(
      { error: "studioId query parameter is required" },
      { status: 400 }
    );
  }

  try {
    const plans = await prisma.membershipPlan.findMany({
      where: {
        studioId,
        isActive: true,
      },
      orderBy: [{ type: "asc" }, { price: "asc" }],
    });

    return NextResponse.json({ data: plans });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(`GET /api/plans error: ${message}`);
    return NextResponse.json({ error: "Failed to fetch plans" }, { status: 500 });
  }
}

// POST /api/plans — admin: create a membership plan
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  if (session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const {
    studioId,
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

  // Validate required fields
  if (!studioId || typeof studioId !== "string") {
    return NextResponse.json({ error: "studioId is required" }, { status: 400 });
  }
  if (!name || typeof name !== "string") {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }
  if (!type || typeof type !== "string") {
    return NextResponse.json({ error: "type is required" }, { status: 400 });
  }
  if (price === undefined || price === null) {
    return NextResponse.json({ error: "price is required" }, { status: 400 });
  }
  if (!billingCycle || typeof billingCycle !== "string") {
    return NextResponse.json({ error: "billingCycle is required" }, { status: 400 });
  }

  const validTypes: MembershipType[] = ["unlimited", "pack", "drop_in", "intro", "trial"];
  if (!validTypes.includes(type as MembershipType)) {
    return NextResponse.json(
      { error: `type must be one of: ${validTypes.join(", ")}` },
      { status: 400 }
    );
  }

  const validCycles: BillingCycle[] = ["monthly", "weekly", "annual", "once"];
  if (!validCycles.includes(billingCycle as BillingCycle)) {
    return NextResponse.json(
      { error: `billingCycle must be one of: ${validCycles.join(", ")}` },
      { status: 400 }
    );
  }

  const priceNumber = Number(price);
  if (isNaN(priceNumber) || priceNumber < 0) {
    return NextResponse.json({ error: "price must be a non-negative number" }, { status: 400 });
  }

  try {
    // Create Stripe product and price
    const stripeProduct = await stripe.products.create({
      name: name as string,
      description: description as string | undefined,
      metadata: { studioId: studioId as string },
    });

    const isRecurring = (billingCycle as BillingCycle) !== "once";
    const intervalMap: Record<string, Stripe.PriceCreateParams.Recurring.Interval> = {
      monthly: "month",
      weekly: "week",
      annual: "year",
    };

    const stripePrice = await stripe.prices.create({
      product: stripeProduct.id,
      unit_amount: Math.round(priceNumber * 100),
      currency: "usd",
      ...(isRecurring
        ? {
            recurring: {
              interval: intervalMap[billingCycle as string],
            },
          }
        : {}),
    });

    const plan = await prisma.membershipPlan.create({
      data: {
        studioId: studioId as string,
        name: name as string,
        description: description as string | null ?? null,
        type: type as MembershipType,
        price: priceNumber,
        billingCycle: billingCycle as BillingCycle,
        creditCount: creditCount ? Number(creditCount) : null,
        creditExpireDays: creditExpireDays ? Number(creditExpireDays) : null,
        allowedClassTypes: Array.isArray(allowedClassTypes)
          ? (allowedClassTypes as string[])
          : [],
        bookingPriorityDays: bookingPriorityDays ? Number(bookingPriorityDays) : 0,
        isActive: typeof isActive === "boolean" ? isActive : true,
        isIntroOffer: typeof isIntroOffer === "boolean" ? isIntroOffer : false,
        maxPurchasesPerMember: maxPurchasesPerMember
          ? Number(maxPurchasesPerMember)
          : null,
        stripeProductId: stripeProduct.id,
        stripePriceId: stripePrice.id,
      },
    });

    return NextResponse.json({ data: plan }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(`POST /api/plans error: ${message}`);
    return NextResponse.json({ error: "Failed to create plan" }, { status: 500 });
  }
}

// Stripe type import needed
import type Stripe from "stripe";
