"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Segmented } from "@/components/caliber/segmented";
import { USER_PROFILE } from "@/lib/mock-data";

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

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [digest, setDigest] = useState<DigestKey>("weekly");
  const [twoFA, setTwoFA] = useState(false);
  const [notifs, setNotifs] = useState<Record<string, boolean>>(
    Object.fromEntries(NOTIFICATIONS.map((n) => [n.key, n.defaultOn])),
  );

  const themeValue: ThemeKey =
    theme === "light" || theme === "dark" ? theme : "system";

  return (
    <div className="mx-auto w-full max-w-[920px] px-8 pb-[60px] pt-7">
      <h1 className="font-display text-[26px] font-semibold leading-[1.15] tracking-[-0.025em]">
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
              <Input
                defaultValue={USER_PROFILE.email}
                readOnly
                className="h-9 text-[13.5px]"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm">
                Change password
              </Button>
              <div className="flex items-center gap-3 rounded-md border border-border px-3 py-1.5">
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
          <div className="mt-4 flex items-center justify-between gap-4 rounded-md border border-border bg-bg-elev p-3.5">
            <div>
              <div className="text-[13px] font-medium">Pro</div>
              <div className="text-[12px] text-text-faint">
                $19/month · renews May 24, 2026
              </div>
            </div>
            <Button variant="outline" size="sm">
              Manage billing
            </Button>
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
