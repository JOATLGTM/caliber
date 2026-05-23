const MESSAGES: Record<string, string> = {
  auth: "Sign-in failed. Please try again.",
  auth_callback:
    "That confirmation link didn't finish signing you in. Try signing in with your email and password below — your email may already be confirmed.",
  config: "Auth is not configured. Add Supabase keys to .env.local (see .env.example).",
  confirm:
    "We sent a confirmation link to your email. Open it to finish signing up, then sign in.",
  existing:
    "An account with this email already exists. Sign in instead, or use Forgot password.",
};

/** Map Supabase Auth API errors to clearer copy. */
export function formatAuthApiError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("rate limit") || lower.includes("too many")) {
    return "Too many emails sent from this project. Wait about an hour, use Google sign-in, or turn off Confirm email in Supabase (Providers → Email) and try again.";
  }
  if (lower.includes("already registered") || lower.includes("already been registered")) {
    return "This email is already registered. Sign in instead.";
  }
  return message;
}

export function authErrorMessage(code: string | null | undefined): string | null {
  if (!code) return null;
  return MESSAGES[code] ?? "Something went wrong. Please try again.";
}

export function AuthErrorBanner({ message }: { message: string | null }) {
  if (!message) return null;

  return (
    <p
      role="alert"
      className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-[13px] text-destructive"
    >
      {message}
    </p>
  );
}

export function AuthInfoBanner({ message }: { message: string | null }) {
  if (!message) return null;

  return (
    <p
      role="status"
      className="rounded-md border border-border bg-bg-elev px-3 py-2 text-[13px] text-text-muted"
    >
      {message}
    </p>
  );
}
