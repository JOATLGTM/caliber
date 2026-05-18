import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "px-5 py-[60px] text-center text-text-muted",
        className,
      )}
    >
      {Icon && (
        <div className="mx-auto mb-3.5 grid h-10 w-10 place-items-center rounded-md bg-bg-elev text-text-faint">
          <Icon size={18} aria-hidden />
        </div>
      )}
      <h3 className="mb-1.5 font-display text-[15px] font-semibold tracking-[-0.01em] text-text">
        {title}
      </h3>
      {description && (
        <p className="mx-auto mb-3.5 max-w-[360px] text-[13px]">{description}</p>
      )}
      {action}
    </div>
  );
}
