"use client";

import { useEffect, useState, useTransition } from "react";
import { useTheme } from "next-themes";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Segmented } from "@/components/caliber/segmented";
import {
  openBillingPortalAction,
  startCheckoutAction,
} from "@/lib/actions/billing";

type DigestKey = "daily" | "weekly" | "off";
type ThemeKey = "light" | "dark" | "system";

const DIGEST_OPTIONS: { value: DigestKey; label: string }[] = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "off", label: "Off" },
];

const THEME_OPTIONS: { value: ThemeKey; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
];

const NOTIFICATIONS = [
  {
    key: "matches",
    title: "New matches",
    sub: "When a job above 80% lands",
    defaultOn: true,
  },
  {
    key: "reminders",
    title: "Application reminders",
    sub: "Nudge after 5 days without status change",
    defaultOn: false,
  },
  {
    key: "weekly",
    title: "Weekly summary",
    sub: "Snapshot of pipeline and outcomes",
    defaultOn: true,
  },
] as const;

const PLAN_LABELS: Record<string, { label: string; description: string }> = {
  free: {
    label: "Free",
    description: "Upgrade to Pro for unlimited tailored resumes.",
  },
  pro: {
    label: "Pro",
    description: "Unlimited tailored resumes and cover letters.",
  },
  pro_plus: {
    label: "Pro+",
    description: "Pro features + priority AI + advanced match insights.",
  },
};

interface SettingsViewProps {
  email: string;
  plan: string;
  subscriptionStatus: string | null;
  hasCustomer: boolean;
  stripeConfigured: boolean;
  billingFlag: string | null;
}

export function SettingsView({
  email,
  plan,
  subscriptionStatus,
  hasCustomer,
  stripeConfigured,
  billingFlag,
}: SettingsViewProps) {
  const { theme, setTheme } = useTheme();
  const [digest, setDigest] = useState<DigestKey>("weekly");
  const [twoFA, setTwoFA] = useState(false);
  const [notifs, setNotifs] = useState<Record<string, boolean>>(
    Object.fromEntries(NOTIFICATIONS.map((n) => [n.key, n.defaultOn])),
  );
  const [billingPending, startBilling] = useTransition();

  // Surface Stripe redirect query params as toasts.
  useEffect(() => {
    if (billingFlag === "success") {
      toast.success("Subscription updated. Welcome aboard.");
    } else if (billingFlag === "cancelled") {
      toast.message("Checkout cancelled.");
    }
  }, [billingFlag]);

  const themeValue: ThemeKey =
    theme === "light" || theme === "dark" ? theme : "system";

  const planInfo = PLAN_LABELS[plan] ?? PLAN_LABELS.free;
  const isPaid = plan !== "free";

  function handleUpgrade(targetPlan: "pro" | "pro_plus") {
    startBilling(async () => {
      const result = await startCheckoutAction(targetPlan);
      if (result && !result.ok) toast.error(result.error);
    });
  }

  function handlePortal() {
    startBilling(async () => {
      const result = await openBillingPortalAction();
      if (result && !result.ok) toast.error(result.error);
    });
  }

  return (
    <div className="mx-auto w-full max-w-[920px] px-4 pb-[60px] pt-7 md:px-8">
      <h1 className="font-display text-[22px] font-semibold leading-[1.15] tracking-[-0.025em] sm:text-[26px]">
        Settings
      </h1>

      <div className="mt-7 flex flex-col gap-5">
        {/* Account */}
        <section className="rounded-lg border border-border bg-background p-[22px]">
          <h2 className="font-display text-[18px] font-semibold tracking-[-0.018em]">
            Account
          </h2>
          <div className="mt-4 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label className="text-[12px] text-text-muted">Email</Label>
              <Input value={email} readOnly className="h-9 text-[13.5px]" />
            </div>
            <div className="flex flex-wrap items-stretch gap-2 sm:items-center">
              <Button variant="outline" size="sm" asChild>
                <a href="/forgot-password">Change password</a>
              </Button>
              <div className="flex flex-1 items-center justify-between gap-3 rounded-md border border-border px-3 py-1.5 sm:flex-initial">
                <div>
                  <div className="text-[13px] font-medium">
                    Two-factor authentication
                  </div>
                  <div className="text-[11.5px] text-text-faint">
                    Adds a step at sign-in
                  </div>
                </div>
                <Switch checked={twoFA} onCheckedChange={setTwoFA} />
              </div>
            </div>
          </div>
        </section>

        {/* Notifications */}
        <section className="rounded-lg border border-border bg-background p-[22px]">
          <h2 className="font-display text-[18px] font-semibold tracking-[-0.018em]">
            Notifications
          </h2>
          <div className="mt-4 flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label className="text-[12px] text-text-muted">Email digest</Label>
              <Segmented
                options={DIGEST_OPTIONS}
                value={digest}
                onChange={setDigest}
              />
            </div>
            <div className="mt-2 flex flex-col">
              {NOTIFICATIONS.map((n, i) => (
                <div
                  key={n.key}
                  className={`flex items-center justify-between gap-3 py-3 ${i > 0 ? "border-t border-border" : ""}`}
                >
                  <div>
                    <div className="text-[13px] font-medium">{n.title}</div>
                    <div className="text-[12px] text-text-faint">{n.sub}</div>
                  </div>
                  <Switch
                    checked={notifs[n.key]}
                    onCheckedChange={(v) =>
                      setNotifs((s) => ({ ...s, [n.key]: v }))
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Subscription */}
        <section className="rounded-lg border border-border bg-background p-[22px]">
          <h2 className="font-display text-[18px] font-semibold tracking-[-0.018em]">
            Subscription
          </h2>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-bg-elev p-3.5">
            <div>
              <div className="flex items-center gap-2">
                <div className="text-[13px] font-medium">{planInfo.label}</div>
                {subscriptionStatus && (
                  <span className="rounded-[4px] border border-border bg-background px-1.5 py-px text-[10.5px] uppercase tracking-[0.04em] text-text-faint">
                    {subscriptionStatus}
                  </span>
                )}
              </div>
              <div className="text-[12px] text-text-faint">
                {planInfo.description}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {!stripeConfigured && (
                <span className="text-[11.5px] text-text-faint">
                  Set <code className="font-mono">STRIPE_SECRET_KEY</code> to enable.
                </span>
              )}
              {isPaid || hasCustomer ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePortal}
                  disabled={!stripeConfigured || billingPending}
                >
                  {billingPending && (
                    <Loader2 size={13} aria-hidden className="animate-spin" />
                  )}
                  Manage billing
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUpgrade("pro")}
                    disabled={!stripeConfigured || billingPending}
                  >
                    {billingPending && (
                      <Loader2 size={13} aria-hidden className="animate-spin" />
                    )}
                    Upgrade to Pro
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleUpgrade("pro_plus")}
                    disabled={!stripeConfigured || billingPending}
                  >
                    Get Pro+
                  </Button>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Theme */}
        <section className="rounded-lg border border-border bg-background p-[22px]">
          <h2 className="font-display text-[18px] font-semibold tracking-[-0.018em]">
            Theme
          </h2>
          <div className="mt-4">
            <Segmented
              options={THEME_OPTIONS}
              value={themeValue}
              onChange={setTheme}
            />
          </div>
        </section>

        {/* Privacy */}
        <section className="rounded-lg border border-border bg-background p-[22px]">
          <h2 className="font-display text-[18px] font-semibold tracking-[-0.018em]">
            Privacy
          </h2>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm">
              Export my data
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-bad/35 bg-bad/10 text-bad hover:bg-bad/15 hover:text-bad"
            >
              Delete account
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
