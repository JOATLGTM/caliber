"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/db/auth";
import { getBillingProfile, setStripeCustomerId } from "@/lib/db/billing";
import {
  getSiteUrl,
  getStripe,
  isStripeConfigured,
  PLAN_PRICE_IDS,
  type Plan,
} from "@/lib/billing/stripe";

async function ensureCustomer(): Promise<string> {
  const { user } = await requireUser();
  const billing = await getBillingProfile();
  if (billing.stripeCustomerId) return billing.stripeCustomerId;

  const stripe = getStripe();
  const customer = await stripe.customers.create({
    email: user.email ?? undefined,
    metadata: { user_id: user.id },
  });
  await setStripeCustomerId(user.id, customer.id);
  return customer.id;
}

export async function startCheckoutAction(plan: Plan): Promise<{ ok: false; error: string } | void> {
  if (!isStripeConfigured()) {
    return { ok: false, error: "Billing is not configured. Add STRIPE_SECRET_KEY to .env.local." };
  }
  if (plan === "free") {
    return { ok: false, error: "Free plan needs no checkout." };
  }

  const priceId = PLAN_PRICE_IDS[plan];
  if (!priceId) {
    return {
      ok: false,
      error: `Missing STRIPE_PRICE_ID_${plan.toUpperCase()} env var.`,
    };
  }

  const customerId = await ensureCustomer();
  const stripe = getStripe();

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${getSiteUrl()}/settings?billing=success`,
    cancel_url: `${getSiteUrl()}/settings?billing=cancelled`,
    allow_promotion_codes: true,
  });

  if (!session.url) {
    return { ok: false, error: "Stripe did not return a checkout URL." };
  }

  redirect(session.url);
}

export async function openBillingPortalAction(): Promise<{ ok: false; error: string } | void> {
  if (!isStripeConfigured()) {
    return { ok: false, error: "Billing is not configured. Add STRIPE_SECRET_KEY to .env.local." };
  }

  const billing = await getBillingProfile();
  if (!billing.stripeCustomerId) {
    return {
      ok: false,
      error: "No billing account yet. Upgrade to a paid plan first.",
    };
  }

  const stripe = getStripe();
  const session = await stripe.billingPortal.sessions.create({
    customer: billing.stripeCustomerId,
    return_url: `${getSiteUrl()}/settings`,
  });

  redirect(session.url);
}
