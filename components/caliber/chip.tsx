import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ChipProps {
  children: ReactNode;
  on?: boolean;
  accent?: boolean;
  onClick?: () => void;
  className?: string;
}

export function Chip({ children, on, accent, onClick, className }: ChipProps) {
  const tinted = on || accent;
  const base =
    "inline-flex h-[26px] items-center gap-1.5 rounded-full border px-2.5 text-[12px] transition-colors";
  const tone = tinted
    ? "border-border-strong bg-accent-soft text-text"
    : "border-border bg-background text-text-muted";

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(
          base,
          tone,
          "cursor-pointer hover:border-border-strong hover:text-text",
          className,
        )}
      >
        {children}
      </button>
    );
  }

  return <span className={cn(base, tone, className)}>{children}</span>;
}
