import Link from "next/link";

export function MarketingFooter() {
  return (
    <footer className="flex flex-col items-start gap-4 border-t border-border px-4 py-8 text-[12.5px] text-text-muted md:flex-row md:items-center md:justify-between md:px-8">
      <div className="font-display text-[18px] font-semibold tracking-[-0.025em] text-text">
        Caliber
      </div>
      <div className="flex flex-wrap gap-x-[18px] gap-y-1.5">
        <Link href="/pricing" className="hover:text-text">
          Pricing
        </Link>
        <Link href="/login" className="hover:text-text">
          Login
        </Link>
        <Link href="#" className="hover:text-text">
          Privacy
        </Link>
        <Link href="#" className="hover:text-text">
          Terms
        </Link>
        <Link href="#" className="hover:text-text">
          Contact
        </Link>
      </div>
      <div>© 2026 Caliber, Inc.</div>
    </footer>
  );
}
