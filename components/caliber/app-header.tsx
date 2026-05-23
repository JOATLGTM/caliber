"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Bell, LogOut, Search, Settings, User } from "lucide-react";
import { signOut } from "@/lib/auth/actions";
import { USER_PROFILE } from "@/lib/mock-data";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CommandPalette,
  useCommandPaletteShortcut,
} from "./command-palette";
import { MobileSidebar } from "./mobile-sidebar";
import { ThemeToggle } from "./theme-toggle";

interface AppHeaderProps {
  applicationsCount?: number;
}

export function AppHeader({ applicationsCount }: AppHeaderProps) {
  const [displayName, setDisplayName] = useState(USER_PROFILE.name);
  const [displayEmail, setDisplayEmail] = useState(USER_PROFILE.email);
  const [paletteOpen, setPaletteOpen] = useState(false);
  useCommandPaletteShortcut(setPaletteOpen);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    const supabase = createClient();
    void supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      const metaName =
        (user.user_metadata?.full_name as string | undefined) ??
        (user.user_metadata?.name as string | undefined);
      if (metaName) setDisplayName(metaName);
      if (user.email) setDisplayEmail(user.email);
    });
  }, []);

  const initials = displayName
    .split(" ")
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-10 flex items-center gap-2 border-b border-border bg-background/85 px-4 py-3.5 backdrop-blur md:gap-3 md:px-8">
      <MobileSidebar applicationsCount={applicationsCount} />

      {/* Mobile: compact icon-only search trigger */}
      <Button
        variant="outline"
        size="icon"
        aria-label="Search"
        className="h-8 w-8 sm:hidden"
        onClick={() => setPaletteOpen(true)}
      >
        <Search size={15} />
      </Button>

      {/* sm+: full search button */}
      <button
        type="button"
        onClick={() => setPaletteOpen(true)}
        className="hidden h-8 max-w-[480px] flex-1 items-center gap-2 rounded-md border border-border bg-bg-elev px-3 text-left text-[13px] text-text-faint transition-colors hover:border-border-strong sm:flex"
        aria-label="Search"
      >
        <Search size={14} />
        <span className="flex-1 truncate">
          Search jobs, companies, applications…
        </span>
        <span className="rounded-[4px] border border-border bg-background px-1.5 py-px font-mono text-[10.5px] text-text-faint">
          ⌘K
        </span>
      </button>

      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />

      <div className="ml-auto flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          aria-label="Notifications"
          className="h-8 w-8"
        >
          <Bell size={15} />
        </Button>
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              aria-label="Account menu"
              className="grid h-8 w-8 place-items-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground"
            >
              {initials}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[200px]">
            <DropdownMenuLabel>
              <div className="text-[13px] font-medium">{displayName}</div>
              <div className="text-[11.5px] font-normal text-text-faint">
                {displayEmail}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile">
                <User size={14} /> Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings">
                <Settings size={14} /> Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <form action={signOut}>
                <button
                  type="submit"
                  className="flex w-full cursor-pointer items-center gap-2"
                >
                  <LogOut size={14} /> Sign out
                </button>
              </form>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
