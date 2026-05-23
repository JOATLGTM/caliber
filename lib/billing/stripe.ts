import Stripe from "stripe";

let cached: Stripe | null = null;

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function getStripe(): Stripe {
  if (!isStripeConfigured()) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  if (!cached) {
    cached = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
      apiVersion: "2026-04-22.dahlia",
      typescript: true,
    });
  }
  return cached;
}

export type Plan = "free" | "pro" | "pro_plus";

export interface PlanInfo {
  id: Plan;
  label: string;
  priceId: string | undefined;
  description: string;
}

export const PLAN_PRICE_IDS: Record<Exclude<Plan, "free">, string | undefined> = {
  pro: process.env.STRIPE_PRICE_ID_PRO,
  pro_plus: process.env.STRIPE_PRICE_ID_PRO_PLUS,
};

export function getSiteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
  ).replace(/\/$/, "");
}

export function planFromPriceId(priceId: string | null | undefined): Plan {
  if (!priceId) return "free";
  if (priceId === PLAN_PRICE_IDS.pro_plus) return "pro_plus";
  if (priceId === PLAN_PRICE_IDS.pro) return "pro";
  return "free";
}
