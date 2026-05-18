"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Briefcase,
  FileText,
  LayoutDashboard,
  Mail,
  Settings,
  User,
  type LucideIcon,
} from "lucide-react";
import { USER_PROFILE } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  count?: number;
}

interface AppSidebarProps {
  applicationsCount?: number;
}

export function AppSidebar({ applicationsCount }: AppSidebarProps) {
  const pathname = usePathname();

  const workspace: NavItem[] = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    {
      href: "/applications",
      label: "Applications",
      icon: Briefcase,
      count: applicationsCount,
    },
    { href: "/resumes", label: "Resumes", icon: FileText },
    { href: "/cover-letters", label: "Cover Letters", icon: Mail },
  ];

  const account: NavItem[] = [
    { href: "/profile", label: "Profile", icon: User },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  const initials = USER_PROFILE.name
    .split(" ")
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <aside className="sticky top-0 flex h-screen w-[240px] flex-col gap-[18px] border-r border-border bg-background px-3.5 py-[18px]">
      <Link
        href="/dashboard"
        className="px-2 py-1 font-display text-[18px] font-semibold tracking-[-0.025em]"
      >
        Caliber
      </Link>

      <NavSection label="Workspace" items={workspace} pathname={pathname} />
      <NavSection label="Account" items={account} pathname={pathname} />

      <div className="mt-auto flex items-center gap-2.5 rounded-md border border-border p-2.5">
        <div className="grid h-7 w-7 flex-shrink-0 place-items-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
          {initials}
        </div>
        <div className="min-w-0">
          <div className="text-[13px] font-medium leading-tight">
            {USER_PROFILE.name}
          </div>
          <div className="truncate text-[11px] text-text-faint">
            {USER_PROFILE.email}
          </div>
        </div>
      </div>
    </aside>
  );
}

function NavSection({
  label,
  items,
  pathname,
}: {
  label: string;
  items: NavItem[];
  pathname: string;
}) {
  return (
    <div className="flex flex-col gap-px">
      <div className="px-2 pb-1.5 pt-2 text-[11px] font-medium uppercase tracking-[0.04em] text-text-faint">
        {label}
      </div>
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + "/");
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2.5 rounded-sm px-2 py-1.5 text-[13.5px] transition-colors",
              active
                ? "bg-bg-elev text-text"
                : "text-text-muted hover:bg-bg-elev hover:text-text",
            )}
          >
            <Icon size={16} className="opacity-85" aria-hidden />
            <span>{item.label}</span>
            {item.count != null && (
              <span className="ml-auto text-[11px] tabular-nums text-text-faint">
                {item.count}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}
