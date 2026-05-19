import Link from "next/link";
import { GoogleButton } from "@/components/caliber/google-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignupPage() {
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

      <GoogleButton>Continue with Google</GoogleButton>

      <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.05em] text-text-faint">
        <div className="h-px flex-1 bg-border" />
        <span>or</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name" className="text-[12.5px] font-medium">
          Name
        </Label>
        <Input id="name" autoComplete="name" placeholder="Alex Morgan" />
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
        />
      </div>

      <Button asChild size="lg">
        <Link href="/onboarding">Create account</Link>
      </Button>

      <p className="text-center text-[11.5px] text-text-faint">
        By signing up you agree to our{" "}
        <Link
          href="#"
          className="underline decoration-border-strong hover:text-text"
        >
          Terms
        </Link>{" "}
        and{" "}
        <Link
          href="#"
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
