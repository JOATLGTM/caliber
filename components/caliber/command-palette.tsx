"use client";

import {
  Briefcase,
  FileText,
  KanbanSquare,
  LayoutDashboard,
  Mail,
  Settings,
  Sparkles,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  listSearchableEntitiesAction,
  type SearchEntity,
} from "@/lib/actions/search";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface NavAction {
  label: string;
  href: string;
  icon: React.ComponentType<{ size?: number; "aria-hidden"?: boolean }>;
}

const NAV_ACTIONS: NavAction[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Applications", href: "/applications", icon: KanbanSquare },
  { label: "Resumes", href: "/resumes", icon: FileText },
  { label: "Cover letters", href: "/cover-letters", icon: Mail },
  { label: "Profile", href: "/profile", icon: User },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();
  const [entities, setEntities] = useState<SearchEntity[]>([]);
  const [loading, startLoading] = useTransition();
  const fetched = entities.length > 0;

  // Lazy-load the searchable list when palette first opens.
  useEffect(() => {
    if (!open || fetched) return;
    let cancelled = false;
    startLoading(() => {
      void listSearchableEntitiesAction().then((data) => {
        if (!cancelled) setEntities(data);
      });
    });
    return () => {
      cancelled = true;
    };
  }, [open, fetched]);

  function go(href: string) {
    onOpenChange(false);
    router.push(href);
  }

  const jobs = entities.filter((e) => e.kind === "job");
  const apps = entities.filter((e) => e.kind === "application");

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      className="max-w-[640px]"
      title="Caliber command palette"
      description="Search jobs, applications, and navigate the app"
    >
      <CommandInput placeholder="Search jobs, applications, or run an action…" />
      <CommandList>
        <CommandEmpty>
          {loading ? "Loading…" : "No results."}
        </CommandEmpty>

        <CommandGroup heading="Navigate">
          {NAV_ACTIONS.map((a) => {
            const Icon = a.icon;
            return (
              <CommandItem
                key={a.href}
                value={`nav ${a.label}`}
                onSelect={() => go(a.href)}
              >
                <Icon size={14} aria-hidden />
                <span>{a.label}</span>
              </CommandItem>
            );
          })}
        </CommandGroup>

        {jobs.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Jobs">
              {jobs.map((j) => (
                <CommandItem
                  key={j.id}
                  value={`job ${j.title} ${j.subtitle}`}
                  onSelect={() => go(j.href)}
                >
                  <Briefcase size={14} aria-hidden />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-[13px]">{j.title}</span>
                    <span className="truncate text-[11.5px] text-text-muted">
                      {j.subtitle}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {apps.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Applications">
              {apps.map((a) => (
                <CommandItem
                  key={a.id}
                  value={`app ${a.title} ${a.subtitle}`}
                  onSelect={() => go(a.href)}
                >
                  <Sparkles size={14} aria-hidden />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-[13px]">{a.title}</span>
                    <span className="truncate text-[11.5px] text-text-muted">
                      {a.subtitle}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}

/** Hook that toggles the palette via Cmd+K / Ctrl+K and "/" focus. */
export function useCommandPaletteShortcut(setOpen: (v: boolean) => void) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const isToggle =
        (e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "K");
      if (isToggle) {
        e.preventDefault();
        setOpen(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setOpen]);
}
