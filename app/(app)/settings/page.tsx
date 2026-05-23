import { getBillingProfile } from "@/lib/db/billing";
import { isStripeConfigured } from "@/lib/billing/stripe";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { USER_PROFILE } from "@/lib/mock-data";
import { SettingsView } from "./settings-view";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ billing?: string }>;
}) {
  const { billing: billingFlag } = await searchParams;

  let email = USER_PROFILE.email;
  let plan = "free";
  let subscriptionStatus: string | null = null;
  let hasCustomer = false;

  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user?.email) email = user.email;

    if (user) {
      try {
        const billing = await getBillingProfile();
        plan = billing.plan;
        subscriptionStatus = billing.subscriptionStatus;
        hasCustomer = Boolean(billing.stripeCustomerId);
      } catch {
        // profile row may not exist yet — leave defaults.
      }
    }
  }

  return (
    <SettingsView
      email={email}
      plan={plan}
      subscriptionStatus={subscriptionStatus}
      hasCustomer={hasCustomer}
      stripeConfigured={isStripeConfigured()}
      billingFlag={billingFlag ?? null}
    />
  );
}
