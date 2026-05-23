"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { GoogleButton } from "@/components/caliber/google-button";
import {
  AuthErrorBanner,
  authErrorMessage,
  formatAuthApiError,
} from "@/components/caliber/auth-error";
import { getAuthCallbackUrl } from "@/lib/auth/oauth";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/dashboard";
  const queryError = authErrorMessage(searchParams.get("error"));

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(queryError);
  const [loading, setLoading] = useState(false);

  async function handleEmailSignIn(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        const msg = signInError.message.toLowerCase();
        if (msg.includes("email not confirmed")) {
          setError(
            "Email not confirmed yet. Use the link from your inbox, or turn off Confirm email in Supabase for dev.",
          );
        } else {
          setError(formatAuthApiError(signInError.message));
        }
        return;
      }

      router.push(next);
      router.refresh();
    } catch {
      setError(authErrorMessage("config"));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: getAuthCallbackUrl(next),
        },
      });

      if (oauthError) {
        setError(oauthError.message);
        setLoading(false);
      }
    } catch {
      setError(authErrorMessage("config"));
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
          Welcome back.
        </h1>
        <p className="mt-1 text-[13.5px] text-text-muted">
          Sign in to get back to your matches.
        </p>
      </div>

      <AuthErrorBanner message={error} />

      <GoogleButton onClick={handleGoogleSignIn} disabled={loading}>
        Continue with Google
      </GoogleButton>

      <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.05em] text-text-faint">
        <div className="h-px flex-1 bg-border" />
        <span>or</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={handleEmailSignIn} className="flex flex-col gap-4">
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

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password" className="text-[12.5px] font-medium">
            Password
          </Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <Button type="submit" size="lg" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <div className="flex items-center justify-between text-[13px]">
        <Link
          href="/forgot-password"
          className="text-text-muted hover:text-text"
        >
          Forgot password?
        </Link>
        <Link href="/signup" className="text-text hover:underline">
          Create account →
        </Link>
      </div>
    </div>
  );
}
