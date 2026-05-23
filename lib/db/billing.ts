import { createAdminClient } from "@/lib/supabase/admin";
import { requireUser } from "./auth";

export interface BillingProfile {
  email: string;
  plan: string;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  subscriptionStatus: string | null;
}

export async function getBillingProfile(): Promise<BillingProfile> {
  const { supabase, user } = await requireUser();

  const { data, error } = await supabase
    .from("profiles")
    .select(
      "plan, stripe_customer_id, stripe_subscription_id, subscription_status",
    )
    .eq("id", user.id)
    .maybeSingle();

  if (error) throw error;

  return {
    email: user.email ?? "",
    plan: (data?.plan as string | null) ?? "free",
    stripeCustomerId: (data?.stripe_customer_id as string | null) ?? null,
    stripeSubscriptionId: (data?.stripe_subscription_id as string | null) ?? null,
    subscriptionStatus:
      (data?.subscription_status as string | null) ?? null,
  };
}

export async function setStripeCustomerId(
  userId: string,
  customerId: string,
): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin
    .from("profiles")
    .update({ stripe_customer_id: customerId })
    .eq("id", userId);
  if (error) throw error;
}

export async function setSubscriptionFromWebhook(input: {
  customerId: string;
  subscriptionId: string | null;
  plan: string;
  status: string | null;
}): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin
    .from("profiles")
    .update({
      plan: input.plan,
      stripe_subscription_id: input.subscriptionId,
      subscription_status: input.status,
    })
    .eq("stripe_customer_id", input.customerId);
  if (error) throw error;
}
