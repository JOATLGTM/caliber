"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  AuthErrorBanner,
  AuthInfoBanner,
  formatAuthApiError,
} from "@/components/caliber/auth-error";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ResetPasswordForm() {
  const router = useRouter();
  const [hasSession, setHasSession] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    void supabase.auth.getSession().then(({ data }) => {
      setHasSession(Boolean(data.session));
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) {
        setHasSession(true);
      }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });
      if (updateError) {
        setError(formatAuthApiError(updateError.message));
        return;
      }
      setInfo("Password updated. Redirecting…");
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 800);
    } catch {
      setError("Could not update password. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex w-full max-w-[380px] flex-col gap-4">
      <Link
        href="/"
        className="text-center font-display text-[22px] font-semibold tracking-[-0.025em]"
      >
        Caliber
      </Link>
      <div className="text-center">
        <h1 className="font-display text-[22px] font-semibold leading-tight tracking-[-0.025em]">
          Set a new password
        </h1>
        <p className="mt-1 text-[13.5px] text-text-muted">
          Pick something you&apos;ll actually remember.
        </p>
      </div>

      {hasSession === false && (
        <AuthErrorBanner message="This reset link is invalid or expired. Request a new one." />
      )}
      <AuthErrorBanner message={error} />
      <AuthInfoBanner message={info} />

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password" className="text-[12.5px] font-medium">
            New password
          </Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading || hasSession === false}
            minLength={8}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="confirm" className="text-[12.5px] font-medium">
            Confirm new password
          </Label>
          <Input
            id="confirm"
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            disabled={loading || hasSession === false}
            minLength={8}
          />
        </div>
        <Button
          type="submit"
          size="lg"
          disabled={loading || hasSession === false}
        >
          {loading ? "Saving…" : "Set new password"}
        </Button>
      </form>

      <div className="text-center text-[13px]">
        <Link href="/login" className="text-text-muted hover:text-text">
          ← Back to sign in
        </Link>
      </div>
    </div>
  );
}
