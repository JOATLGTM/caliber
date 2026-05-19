"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const LINKS = [
  { href: "/pricing", label: "Pricing" },
  { href: "/login", label: "Login" },
];

export function MarketingNav() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="flex items-center justify-between border-b border-border px-4 py-[18px] md:px-8">
      <Link
        href="/"
        className="font-display text-[18px] font-semibold tracking-[-0.025em]"
      >
        Caliber
      </Link>

      {/* Desktop links */}
      <div className="hidden items-center gap-6 md:flex">
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="text-[13.5px] text-text-muted transition-colors hover:text-text"
          >
            {l.label}
          </Link>
        ))}
        <Button asChild size="sm">
          <Link href="/signup">Get started</Link>
        </Button>
      </div>

      {/* Mobile cluster */}
      <div className="flex items-center gap-2 md:hidden">
        <Button asChild size="sm">
          <Link href="/signup">Get started</Link>
        </Button>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              aria-label="Open menu"
              className="h-8 w-8"
            >
              <Menu size={15} />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="w-[260px] p-0 sm:max-w-[260px]"
          >
            <SheetTitle className="sr-only">Menu</SheetTitle>
            <div className="flex h-full flex-col gap-1 p-5">
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className="mb-3 px-2 font-display text-[18px] font-semibold tracking-[-0.025em]"
              >
                Caliber
              </Link>
              {LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="rounded-sm px-2 py-2 text-[14px] text-text-muted transition-colors hover:bg-bg-elev hover:text-text"
                >
                  {l.label}
                </Link>
              ))}
              <Button asChild className="mt-3">
                <Link href="/signup" onClick={() => setOpen(false)}>
                  Get started
                </Link>
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
