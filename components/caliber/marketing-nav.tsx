import Link from "next/link";
import { Button } from "@/components/ui/button";

export function MarketingNav() {
  return (
    <nav className="flex items-center justify-between border-b border-border px-8 py-[18px]">
      <Link
        href="/"
        className="font-display text-[18px] font-semibold tracking-[-0.025em]"
      >
        Caliber
      </Link>
      <div className="flex items-center gap-6">
        <Link
          href="/pricing"
          className="text-[13.5px] text-text-muted transition-colors hover:text-text"
        >
          Pricing
        </Link>
        <Link
          href="/login"
          className="text-[13.5px] text-text-muted transition-colors hover:text-text"
        >
          Login
        </Link>
        <Button asChild size="sm">
          <Link href="/signup">Get started</Link>
        </Button>
      </div>
    </nav>
  );
}
