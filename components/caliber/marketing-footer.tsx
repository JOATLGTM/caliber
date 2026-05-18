import Link from "next/link";

export function MarketingFooter() {
  return (
    <footer className="flex items-center justify-between border-t border-border px-8 py-8 text-[12.5px] text-text-muted">
      <div className="font-display text-[18px] font-semibold tracking-[-0.025em] text-text">
        Caliber
      </div>
      <div className="flex gap-[18px]">
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
