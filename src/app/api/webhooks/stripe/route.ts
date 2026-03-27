import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(`Webhook signature verification failed: ${message}`);
    return NextResponse.json(
      { error: `Webhook Error: ${message}` },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "invoice.paid": {
        const invoice = event.data.object;
        await handleInvoicePaid(invoice);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object;
        await handleInvoicePaymentFailed(invoice);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(`Error processing webhook: ${message}`);
    return NextResponse.json(
      { error: `Webhook handler failed: ${message}` },
      { status: 500 }
    );
  }
}

// Helper to safely extract a string ID from a Stripe expandable field
function extractId(
  field: string | { id: string } | null | undefined
): string | null {
  if (!field) return null;
  if (typeof field === "string") return field;
  return field.id;
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const invoiceAny = invoice as any;
  // Handle both old API (invoice.subscription) and new API (invoice.parent.subscription_details.subscription)
  const subscriptionId: string | null =
    extractId(invoiceAny.subscription) ??
    extractId(invoiceAny.parent?.subscription_details?.subscription) ??
    null;

  if (!subscriptionId) return;

  const membership = await prisma.memberMembership.findFirst({
    where: { stripeSubscriptionId: subscriptionId },
    include: { plan: true },
  });

  if (!membership) return;

  const amountPaid = (invoiceAny.amount_paid ?? invoiceAny.total ?? 0) / 100;
  const paymentIntentId = extractId(invoiceAny.payment_intent);

  // Record the payment
  await prisma.payment.create({
    data: {
      memberId: membership.memberId,
      amount: amountPaid,
      currency: invoice.currency ?? "usd",
      type: "membership",
      status: "paid",
      stripeInvoiceId: invoice.id,
      stripePaymentIntentId: paymentIntentId,
      description: `Membership: ${membership.plan.name}`,
    },
  });

  // Renew credits for pack-based memberships
  if (membership.plan.creditCount && membership.plan.creditCount > 0) {
    await prisma.memberMembership.update({
      where: { id: membership.id },
      data: {
        creditsRemaining: membership.plan.creditCount,
        creditsTotal: membership.plan.creditCount,
        status: "active",
      },
    });

    await prisma.creditLedger.create({
      data: {
        memberId: membership.memberId,
        delta: membership.plan.creditCount,
        reason: "purchase",
      },
    });
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const invoiceAny = invoice as any;
  const subscriptionId: string | null =
    extractId(invoiceAny.subscription) ??
    extractId(invoiceAny.parent?.subscription_details?.subscription) ??
    null;

  if (!subscriptionId) return;

  const membership = await prisma.memberMembership.findFirst({
    where: { stripeSubscriptionId: subscriptionId },
  });

  if (!membership) return;

  const amountDue = (invoiceAny.amount_due ?? invoiceAny.total ?? 0) / 100;

  // Record failed payment
  await prisma.payment.create({
    data: {
      memberId: membership.memberId,
      amount: amountDue,
      currency: invoice.currency ?? "usd",
      type: "membership",
      status: "failed",
      stripeInvoiceId: invoice.id,
      description: "Membership payment failed",
    },
  });
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  await prisma.memberMembership.updateMany({
    where: { stripeSubscriptionId: subscription.id },
    data: { status: "cancelled" },
  });
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const statusMap: Record<string, string> = {
    active: "active",
    paused: "paused",
    canceled: "cancelled",
    cancelled: "cancelled",
  };

  const newStatus = statusMap[subscription.status];
  if (!newStatus) return;

  await prisma.memberMembership.updateMany({
    where: { stripeSubscriptionId: subscription.id },
    data: { status: newStatus as "active" | "paused" | "cancelled" },
  });
}
