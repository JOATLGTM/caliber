"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronLeft, ChevronRight, Loader2, Plus, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Chip } from "@/components/caliber/chip";
import { JobCard } from "@/components/caliber/job-card";
import { Segmented } from "@/components/caliber/segmented";
import { Button } from "@/components/ui/button";
import { dismissJobAction, saveJobAction } from "@/lib/actions/jobs";
import { recomputeAllMatchScoresAction } from "@/lib/actions/ai";
import type { JobSortKey } from "@/lib/db/jobs";
import type { DashboardStats, Job } from "@/lib/mock-data";

const SORT_OPTIONS: { value: JobSortKey; label: string }[] = [
  { value: "date", label: "Date posted" },
  { value: "match", label: "Match score" },
  { value: "salary", label: "Salary" },
];

interface ModeFilters {
  Remote: boolean;
  Hybrid: boolean;
  Onsite: boolean;
}

interface DashboardPagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

interface DashboardViewProps {
  initialJobs: Job[];
  firstName: string;
  stats: DashboardStats;
  emptyHint?: string | null;
  pagination: DashboardPagination;
  sortBy: JobSortKey;
}

function dashboardHref(page: number, sort: JobSortKey): string {
  const params = new URLSearchParams();
  if (page > 1) params.set("page", String(page));
  if (sort !== "date") params.set("sort", sort);
  const q = params.toString();
  return q ? `/dashboard?${q}` : "/dashboard";
}

export function DashboardView({
  initialJobs,
  firstName,
  stats,
  emptyHint,
  pagination,
  sortBy,
}: DashboardViewProps) {
  const statCards = [
    {
      label: "Matches this week",
      value: stats.matchesThisWeek,
      trend: "Posted in the last 7 days",
    },
    {
      label: "Saved jobs",
      value: stats.savedJobs,
      trend: "From your saved list",
    },
    {
      label: "Active applications",
      value: stats.activeApplications,
      trend: "Saved through offer stage",
    },
    {
      label: "Avg match score",
      value: stats.avgMatchScore,
      suffix: "%",
      trend: "Across visible matches (experimental)",
    },
  ] as const;

  const router = useRouter();
  const [postedWithin7d, setPostedWithin7d] = useState(false);
  const [modes, setModes] = useState<ModeFilters>({
    Remote: false,
    Hybrid: false,
    Onsite: false,
  });
  const [jobList, setJobList] = useState<Job[]>(initialJobs);
  const [recomputePending, startRecompute] = useTransition();

  const postedCutoff7d = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().slice(0, 10);
  }, []);

  const greeting = getGreeting();

  function handleSortChange(next: JobSortKey) {
    router.push(dashboardHref(1, next));
  }

  function handleRecompute() {
    startRecompute(async () => {
      const result = await recomputeAllMatchScoresAction();
      if (result.ok) {
        toast.success(`Updated ${result.updated} match scores`);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  const jobs = useMemo(() => {
    const anyMode = modes.Remote || modes.Hybrid || modes.Onsite;
    let arr = anyMode
      ? jobList.filter((j) => modes[j.workMode])
      : [...jobList];

    if (postedWithin7d) {
      arr = arr.filter((j) => j.postedAt >= postedCutoff7d);
    }

    return arr;
  }, [modes, jobList, postedWithin7d, postedCutoff7d]);

  const companiesOnPage = useMemo(
    () => [...new Set(jobs.map((j) => j.company))].sort(),
    [jobs],
  );

  const rangeStart =
    pagination.total === 0
      ? 0
      : (pagination.page - 1) * pagination.pageSize + 1;
  const rangeEnd = Math.min(
    pagination.page * pagination.pageSize,
    pagination.total,
  );

  function toggleMode(mode: keyof ModeFilters) {
    setModes((m) => ({ ...m, [mode]: !m[mode] }));
  }

  function handleSave(job: Job) {
    const nextSaved = !job.saved;
    setJobList((prev) =>
      prev.map((j) => (j.id === job.id ? { ...j, saved: nextSaved } : j)),
    );
    void saveJobAction(job.id, nextSaved).then((res) => {
      if (!res.ok) {
        toast.error("Couldn't update saved status");
        setJobList((prev) =>
          prev.map((j) => (j.id === job.id ? { ...j, saved: !nextSaved } : j)),
        );
      } else if (nextSaved) {
        toast.success("Saved — added to Applications (Saved column)");
      } else if (res.removedFromPipeline) {
        toast.success("Removed from saved and Applications board");
      } else if (res.pipelineKept) {
        toast.success(
          "Removed from saved jobs — still on your Applications board",
        );
      } else {
        toast.success("Removed from saved");
      }
    });
  }

  function handleDismiss(job: Job) {
    setJobList((prev) => prev.filter((j) => j.id !== job.id));
    void dismissJobAction(job.id).then((res) => {
      if (!res.ok) toast.error("Couldn't dismiss job");
      else toast.message("Job dismissed");
    });
  }

  return (
    <div className="w-full max-w-[1200px] px-4 pb-[60px] pt-7 md:px-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-display text-[22px] font-semibold leading-[1.15] tracking-[-0.025em] sm:text-[26px]">
            {greeting}, {firstName}
          </h1>
          <p className="mt-1.5 text-[14px] text-text-muted">
            {pagination.total > 0
              ? `${pagination.total} matching roles · sorted by ${sortBy === "date" ? "date posted" : sortBy === "match" ? "fit score" : "salary"} · up to ${pagination.pageSize} per page`
              : "Set your profile skills and target roles, then browse the catalog."}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRecompute}
            disabled={recomputePending}
          >
            {recomputePending ? (
              <Loader2 size={13} aria-hidden className="animate-spin" />
            ) : (
              <Sparkles size={13} aria-hidden />
            )}
            {recomputePending ? "Recomputing…" : "Recompute matches"}
          </Button>
          <Button variant="outline" size="sm">
            <Plus size={14} aria-hidden /> Add job manually
          </Button>
        </div>
      </div>

      <div className="my-[18px] mb-7 mt-[18px] grid grid-cols-2 gap-3 md:grid-cols-4">
        {statCards.map((s) => (
          <div
            key={s.label}
            className="rounded-lg border border-border bg-background p-[18px]"
          >
            <div className="text-[12px] text-text-faint">{s.label}</div>
            <div className="mt-2 font-display text-[28px] font-semibold leading-none tracking-[-0.025em] tabular-nums text-text">
              {s.value}
              {"suffix" in s && s.suffix && (
                <span className="text-[18px] text-text-faint">{s.suffix}</span>
              )}
            </div>
            <div className="mt-1.5 text-[11.5px] text-text-faint">{s.trend}</div>
          </div>
        ))}
      </div>

      <div className="mb-[18px] flex flex-wrap items-center gap-2 border-y border-border py-2.5">
        <span className="mr-1 text-[12px] text-text-faint">Sort</span>
        <Segmented
          options={SORT_OPTIONS}
          value={sortBy}
          onChange={handleSortChange}
        />
        <div className="mx-1.5 h-[18px] w-px bg-border" />
        <span className="mr-1 text-[12px] text-text-faint">Filters</span>
        {(["Remote", "Hybrid", "Onsite"] as const).map((mode) => (
          <Chip
            key={mode}
            on={modes[mode]}
            onClick={() => toggleMode(mode)}
          >
            {mode}
          </Chip>
        ))}
        <Chip>
          Senior <ChevronDown size={12} />
        </Chip>
        <Chip on={postedWithin7d} onClick={() => setPostedWithin7d((v) => !v)}>
          Posted within 7d
        </Chip>
        <span className="w-full text-[12px] text-text-faint sm:ml-auto sm:w-auto">
          {jobs.length} on this page
          {companiesOnPage.length > 0
            ? ` · ${companiesOnPage.slice(0, 4).join(", ")}${companiesOnPage.length > 4 ? "…" : ""}`
            : ""}
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {emptyHint && jobs.length === 0 ? (
          <p className="rounded-lg border border-border bg-background px-4 py-6 text-[14px] text-text-muted">
            {emptyHint}
          </p>
        ) : null}
        {jobs.map((job) => (
          <JobCard
            key={job.id}
            job={job}
            onSave={handleSave}
            onDismiss={handleDismiss}
          />
        ))}
      </div>

      {pagination.totalPages > 1 ? (
        <nav
          className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6"
          aria-label="Job results pagination"
        >
          <p className="text-[13px] text-text-muted">
            Showing {rangeStart}–{rangeEnd} of {pagination.total} matches
          </p>
          <div className="flex items-center gap-2">
            {pagination.page <= 1 ? (
              <Button variant="outline" size="sm" disabled>
                <ChevronLeft size={14} aria-hidden /> Previous
              </Button>
            ) : (
              <Button variant="outline" size="sm" asChild>
                <Link href={dashboardHref(pagination.page - 1, sortBy)}>
                  <ChevronLeft size={14} aria-hidden /> Previous
                </Link>
              </Button>
            )}
            <span className="px-2 text-[13px] tabular-nums text-text-muted">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            {pagination.page >= pagination.totalPages ? (
              <Button variant="outline" size="sm" disabled>
                Next <ChevronRight size={14} aria-hidden />
              </Button>
            ) : (
              <Button variant="outline" size="sm" asChild>
                <Link href={dashboardHref(pagination.page + 1, sortBy)}>
                  Next <ChevronRight size={14} aria-hidden />
                </Link>
              </Button>
            )}
          </div>
        </nav>
      ) : pagination.total > 0 ? (
        <p className="mt-6 border-t border-border pt-6 text-[13px] text-text-muted">
          Showing all {pagination.total} matches
        </p>
      ) : null}
    </div>
  );
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}
