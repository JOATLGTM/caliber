"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { GoogleButton } from "@/components/caliber/google-button";
import {
  AuthErrorBanner,
  AuthInfoBanner,
  authErrorMessage,
  formatAuthApiError,
} from "@/components/caliber/auth-error";
import { getAuthCallbackUrl } from "@/lib/auth/oauth";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SignupForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleEmailSignUp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name },
          emailRedirectTo: getAuthCallbackUrl("/onboarding"),
        },
      });

      if (signUpError) {
        setError(formatAuthApiError(signUpError.message));
        return;
      }

      if (data.session) {
        router.push("/onboarding");
        router.refresh();
        return;
      }

      // Email confirmation required — no session until the user clicks the link.
      const identities = data.user?.identities ?? [];
      if (identities.length === 0) {
        setError(authErrorMessage("existing"));
        return;
      }

      setInfo(authErrorMessage("confirm"));
    } catch {
      setError(authErrorMessage("config"));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignUp() {
    setError(null);
    setInfo(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: getAuthCallbackUrl("/onboarding"),
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
          Create your account.
        </h1>
        <p className="mt-1 text-[13.5px] text-text-muted">
          Free to start. About 90 seconds to your first matches.
        </p>
      </div>

      <AuthErrorBanner message={error} />
      <AuthInfoBanner message={info} />

      <GoogleButton onClick={handleGoogleSignUp} disabled={loading}>
        Continue with Google
      </GoogleButton>

      <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.05em] text-text-faint">
        <div className="h-px flex-1 bg-border" />
        <span>or</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={handleEmailSignUp} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name" className="text-[12.5px] font-medium">
            Name
          </Label>
          <Input
            id="name"
            autoComplete="name"
            placeholder="Alex Morgan"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email" className="text-[12.5px] font-medium">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
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
            autoComplete="new-password"
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
            disabled={loading}
          />
        </div>

        <Button type="submit" size="lg" disabled={loading}>
          {loading ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <p className="text-center text-[11.5px] text-text-faint">
        By signing up you agree to our{" "}
        <Link
          href="/terms"
          className="underline decoration-border-strong hover:text-text"
        >
          Terms
        </Link>{" "}
        and{" "}
        <Link
          href="/privacy"
          className="underline decoration-border-strong hover:text-text"
        >
          Privacy Policy
        </Link>
        .
      </p>

      <div className="text-center text-[13px] text-text-muted">
        Already have one?{" "}
        <Link href="/login" className="text-text hover:underline">
          Sign in
        </Link>
      </div>
    </div>
  );
}
