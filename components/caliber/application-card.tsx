import type { Application } from "@/lib/mock-data";
import { shortDate } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

interface ApplicationCardProps {
  application: Application;
  className?: string;
}

export function ApplicationCard({
  application: app,
  className,
}: ApplicationCardProps) {
  return (
    <div
      className={cn(
        "cursor-grab rounded-md border border-border bg-background p-3 transition-all duration-150",
        "hover:-translate-y-px hover:border-border-strong hover:shadow-[var(--shadow-token-sm)]",
        "active:cursor-grabbing",
        className,
      )}
    >
      <div className="text-[12px] text-text-faint">{app.company}</div>
      <div className="mt-0.5 mb-2 text-[13px] font-medium leading-tight">
        {app.title}
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-text-faint">
          {app.appliedAt === "—"
            ? "Not applied"
            : `Applied ${shortDate(app.appliedAt)}`}
        </span>
        <span className="rounded-[4px] border border-border bg-bg-elev px-1.5 py-px font-mono text-[11px] text-text">
          {app.matchScore}%
        </span>
      </div>
      {app.outcome && (
        <div className="mt-2">
          <span
            className={cn(
              "inline-flex h-[22px] items-center rounded-[4px] border px-2 text-[11.5px] font-medium",
              app.outcome === "Won"
                ? "border-good/35 bg-good/10 text-good"
                : "border-bad/35 bg-bad/10 text-bad",
            )}
          >
            {app.outcome === "Won" ? "Offer accepted" : "Closed lost"}
          </span>
        </div>
      )}
    </div>
  );
}
