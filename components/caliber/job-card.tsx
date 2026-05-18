"use client";

import Link from "next/link";
import { Bookmark, MapPin } from "lucide-react";
import type { Job } from "@/lib/mock-data";
import { daysAgo } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { MatchScoreBadge } from "./match-score-badge";

type Density = "spacious" | "balanced" | "dense";

interface JobCardProps {
  job: Job;
  density?: Density;
  scoreTreatment?: "big" | "badge" | "quiet";
  onSave?: (job: Job) => void;
  onDismiss?: (job: Job) => void;
}

const padding: Record<Density, string> = {
  spacious: "px-6 py-[22px]",
  balanced: "px-[22px] py-[18px]",
  dense: "px-[18px] py-[14px]",
};

const titleSize: Record<Density, string> = {
  spacious: "text-[18px]",
  balanced: "text-[16px]",
  dense: "text-[15px]",
};

export function JobCard({
  job,
  density = "spacious",
  scoreTreatment = "big",
  onSave,
  onDismiss,
}: JobCardProps) {
  const showWhy = density !== "dense";

  return (
    <Link
      href={`/jobs/${job.id}`}
      className={cn(
        "group relative grid grid-cols-[1fr_auto] gap-6 rounded-lg border border-border bg-background transition-colors duration-150",
        "hover:border-border-strong hover:bg-bg-elev",
        padding[density],
      )}
    >
      <div className="min-w-0">
        <div className="mb-1 flex items-center gap-3">
          <div className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-md border border-border bg-bg-elev-2 font-display text-sm font-semibold tracking-[-0.01em] text-text">
            {job.company.slice(0, 1)}
          </div>
          <div className="min-w-0">
            <div className="text-[13px] text-text-muted">{job.company}</div>
            <h3
              className={cn(
                "mt-0.5 font-display font-semibold tracking-[-0.018em] text-text",
                titleSize[density],
              )}
            >
              {job.title}
            </h3>
          </div>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-x-[14px] gap-y-1 text-[12.5px] text-text-muted">
          <span className="inline-flex items-center gap-1.5">
            <MapPin size={12} aria-hidden /> {job.location}
          </span>
          <span className="inline-flex h-[22px] items-center rounded-[4px] border border-border bg-bg-elev-2 px-2 text-[11.5px] font-medium">
            {job.workMode}
          </span>
          <span className="text-text-faint">·</span>
          <span className="tabular-nums">{job.salary}</span>
          <span className="text-text-faint">·</span>
          <span>{daysAgo(job.postedAt)}</span>
        </div>

        {showWhy && (
          <ul className="mt-3.5 flex flex-col gap-1.5 text-[13px] text-text-muted">
            {job.whyMatch.map((w, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="flex-shrink-0 text-text-faint">—</span>
                <span>{w}</span>
              </li>
            ))}
          </ul>
        )}

        <div
          className="mt-3.5 flex gap-1.5"
          onClick={(e) => e.stopPropagation()}
        >
          <Button asChild size="sm" variant="default">
            <Link href={`/jobs/${job.id}`}>View &amp; tailor</Link>
          </Button>
          <Button
            size="sm"
            variant="outline"
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onSave?.(job);
            }}
          >
            <Bookmark size={13} aria-hidden />
            {job.saved ? "Saved" : "Save"}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onDismiss?.(job);
            }}
          >
            Dismiss
          </Button>
        </div>
      </div>

      <MatchScoreBadge score={job.matchScore} treatment={scoreTreatment} />
    </Link>
  );
}
