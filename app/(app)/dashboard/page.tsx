"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Plus } from "lucide-react";
import { Chip } from "@/components/caliber/chip";
import { JobCard } from "@/components/caliber/job-card";
import { Segmented } from "@/components/caliber/segmented";
import { Button } from "@/components/ui/button";
import { JOBS, STATS, USER_PROFILE } from "@/lib/mock-data";

type SortKey = "match" | "date" | "salary";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "match", label: "Match score" },
  { value: "date", label: "Date posted" },
  { value: "salary", label: "Salary" },
];

interface ModeFilters {
  Remote: boolean;
  Hybrid: boolean;
  Onsite: boolean;
}

const STAT_CARDS = [
  {
    label: "Matches this week",
    value: STATS.matchesThisWeek,
    trend: "+8 vs last week",
  },
  {
    label: "Saved jobs",
    value: STATS.savedJobs,
    trend: "2 closing this week",
  },
  {
    label: "Active applications",
    value: STATS.activeApplications,
    trend: "3 in interview",
  },
  {
    label: "Avg match score",
    value: STATS.avgMatchScore,
    suffix: "%",
    trend: "+6 with new prefs",
  },
] as const;

export default function DashboardPage() {
  const [sortBy, setSortBy] = useState<SortKey>("match");
  const [modes, setModes] = useState<ModeFilters>({
    Remote: false,
    Hybrid: false,
    Onsite: false,
  });

  const firstName = USER_PROFILE.name.split(" ")[0];
  const greeting = getGreeting();

  const jobs = useMemo(() => {
    const anyMode = modes.Remote || modes.Hybrid || modes.Onsite;
    const arr = anyMode ? JOBS.filter((j) => modes[j.workMode]) : [...JOBS];

    if (sortBy === "match") {
      arr.sort((a, b) => b.matchScore - a.matchScore);
    } else if (sortBy === "date") {
      arr.sort(
        (a, b) =>
          new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime(),
      );
    } else if (sortBy === "salary") {
      arr.sort((a, b) => b.salaryMin - a.salaryMin);
    }
    return arr;
  }, [sortBy, modes]);

  function toggleMode(mode: keyof ModeFilters) {
    setModes((m) => ({ ...m, [mode]: !m[mode] }));
  }

  return (
    <div className="w-full max-w-[1200px] px-8 pb-[60px] pt-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-[26px] font-semibold leading-[1.15] tracking-[-0.025em]">
            {greeting}, {firstName}
          </h1>
          <p className="mt-1.5 text-[14px] text-text-muted">
            {STATS.matchesThisWeek} new matches since Monday — the top three are
            worth your time.
          </p>
        </div>
        <Button variant="outline" size="sm">
          <Plus size={14} aria-hidden /> Add job manually
        </Button>
      </div>

      {/* Stats */}
      <div className="my-[18px] mb-7 mt-[18px] grid grid-cols-4 gap-3">
        {STAT_CARDS.map((s) => (
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

      {/* Filter bar */}
      <div className="mb-[18px] flex flex-wrap items-center gap-2 border-y border-border py-2.5">
        <span className="mr-1 text-[12px] text-text-faint">Sort</span>
        <Segmented
          options={SORT_OPTIONS}
          value={sortBy}
          onChange={setSortBy}
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
        <Chip>
          Posted within 7d <ChevronDown size={12} />
        </Chip>
        <span className="ml-auto text-[12px] text-text-faint">
          {jobs.length} matches
        </span>
      </div>

      {/* Job list */}
      <div className="flex flex-col gap-3">
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>
    </div>
  );
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}
