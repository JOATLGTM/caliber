import Link from "next/link";
import { GoogleButton } from "@/components/caliber/google-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
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

      <GoogleButton>Continue with Google</GoogleButton>

      <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.05em] text-text-faint">
        <div className="h-px flex-1 bg-border" />
        <span>or</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email" className="text-[12.5px] font-medium">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          defaultValue="alex.morgan@gmail.com"
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
          defaultValue="placeholder"
        />
      </div>

      <Button asChild size="lg">
        <Link href="/dashboard">Sign in</Link>
      </Button>

      <div className="flex items-center justify-between text-[13px]">
        <Link href="#" className="text-text-muted hover:text-text">
          Forgot password?
        </Link>
        <Link href="/signup" className="text-text hover:underline">
          Create account →
        </Link>
      </div>
    </div>
  );
}
