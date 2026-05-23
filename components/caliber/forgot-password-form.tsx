"use client";

import Link from "next/link";
import { useState } from "react";
import {
  AuthErrorBanner,
  AuthInfoBanner,
  formatAuthApiError,
} from "@/components/caliber/auth-error";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function getResetRedirectUrl(): string {
  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return `${origin}/reset-password`;
}

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email,
        { redirectTo: getResetRedirectUrl() },
      );

      if (resetError) {
        setError(formatAuthApiError(resetError.message));
      } else {
        setInfo(
          "If that email is on file we just sent a reset link. Check your inbox.",
        );
      }
    } catch {
      setError("Could not start password reset. Try again later.");
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
          Forgot your password?
        </h1>
        <p className="mt-1 text-[13.5px] text-text-muted">
          We&apos;ll email you a link to set a new one.
        </p>
      </div>

      <AuthErrorBanner message={error} />
      <AuthInfoBanner message={info} />

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email" className="text-[12.5px] font-medium">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        <Button type="submit" size="lg" disabled={loading}>
          {loading ? "Sending…" : "Send reset link"}
        </Button>
      </form>

      <div className="flex items-center justify-between text-[13px]">
        <Link href="/login" className="text-text-muted hover:text-text">
          ← Back to sign in
        </Link>
        <Link href="/signup" className="text-text hover:underline">
          Create account →
        </Link>
      </div>
    </div>
  );
}
