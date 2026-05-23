import { NextResponse } from "next/server";
import type Stripe from "stripe";
import {
  getStripe,
  isStripeConfigured,
  planFromPriceId,
} from "@/lib/billing/stripe";
import { setSubscriptionFromWebhook } from "@/lib/db/billing";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: "Stripe not configured" },
      { status: 500 },
    );
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json(
      { error: "STRIPE_WEBHOOK_SECRET missing" },
      { status: 500 },
    );
  }

  const stripe = getStripe();
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const body = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        let customerId: string | null = null;
        let subscriptionId: string | null = null;
        let priceId: string | null = null;
        let status: string | null = null;

        if (event.type === "checkout.session.completed") {
          const session = event.data.object as Stripe.Checkout.Session;
          customerId =
            typeof session.customer === "string" ? session.customer : null;
          subscriptionId =
            typeof session.subscription === "string"
              ? session.subscription
              : null;
          if (subscriptionId) {
            const sub = await stripe.subscriptions.retrieve(subscriptionId);
            priceId = sub.items.data[0]?.price?.id ?? null;
            status = sub.status;
          }
        } else {
          const sub = event.data.object as Stripe.Subscription;
          customerId =
            typeof sub.customer === "string" ? sub.customer : null;
          subscriptionId = sub.id;
          priceId = sub.items.data[0]?.price?.id ?? null;
          status = sub.status;
        }

        if (customerId) {
          await setSubscriptionFromWebhook({
            customerId,
            subscriptionId,
            plan: planFromPriceId(priceId),
            status,
          });
        }
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId =
          typeof sub.customer === "string" ? sub.customer : null;
        if (customerId) {
          await setSubscriptionFromWebhook({
            customerId,
            subscriptionId: null,
            plan: "free",
            status: "canceled",
          });
        }
        break;
      }
      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Webhook handler failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
