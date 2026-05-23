import Link from "next/link";
import { GripVertical } from "lucide-react";
import type { Application } from "@/lib/mock-data";
import { shortDate } from "@/lib/mock-data";
import { jobDetailPath } from "@/lib/jobs/paths";
import { cn } from "@/lib/utils";

interface ApplicationCardProps {
  application: Application;
  className?: string;
  dragHandleProps?: React.ComponentProps<"button">;
}

function CardBody({ app }: { app: Application }) {
  return (
    <>
      <div className="text-[12px] text-text-faint">{app.company}</div>
      <div className="mt-0.5 mb-2 text-[13px] font-medium leading-tight text-text">
        {app.title}
      </div>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] text-text-faint">
          {app.appliedAt === "—"
            ? "Not applied"
            : `Applied ${shortDate(app.appliedAt)}`}
        </span>
        <span className="rounded-[4px] border border-border bg-bg-elev px-1.5 py-px font-mono text-[11px] text-text">
          {app.matchScore}%
        </span>
      </div>
      {app.outcome ? (
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
      ) : null}
    </>
  );
}

export function ApplicationCard({
  application: app,
  className,
  dragHandleProps,
}: ApplicationCardProps) {
  const href = app.jobId ? jobDetailPath(app.jobId) : null;

  const shellClass = cn(
    "flex items-stretch overflow-hidden rounded-md border border-border bg-background transition-all duration-150",
    href &&
      "hover:-translate-y-px hover:border-border-strong hover:shadow-[var(--shadow-token-sm)]",
    className,
  );

  const dragHandle = dragHandleProps ? (
    <button
      type="button"
      data-drag-handle
      aria-label="Drag to move column"
      className={cn(
        "flex shrink-0 cursor-grab touch-none items-center border-l border-border px-1.5 text-text-faint",
        "hover:bg-bg-elev-2 hover:text-text active:cursor-grabbing",
      )}
      {...dragHandleProps}
    >
      <GripVertical size={14} aria-hidden />
    </button>
  ) : null;

  if (href) {
    return (
      <article className={shellClass}>
        <Link
          href={href}
          className="min-w-0 flex-1 p-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/50"
        >
          <CardBody app={app} />
        </Link>
        {dragHandle}
      </article>
    );
  }

  return (
    <article className={shellClass}>
      <div className="min-w-0 flex-1 p-3">
        <CardBody app={app} />
      </div>
      {dragHandle}
    </article>
  );
}
