"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Bookmark,
  Check,
  ChevronRight,
  Download,
  MapPin,
  Sparkles,
} from "lucide-react";
import type { Job, ResumeDiff, ResumeDiffBreakdown } from "@/lib/mock-data";
import { daysAgo } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Chip } from "@/components/caliber/chip";

interface JobDetailViewProps {
  job: Job;
  resumeDiff: ResumeDiff;
  coverLetterDraft: string;
}

const breakdownTone: Record<ResumeDiffBreakdown["state"], string> = {
  good: "text-good",
  ok: "text-warn",
  warn: "text-warn",
  bad: "text-bad",
};

export function JobDetailView({
  job,
  resumeDiff,
  coverLetterDraft,
}: JobDetailViewProps) {
  const [coverDraft, setCoverDraft] = useState(coverLetterDraft);
  const changedCount = resumeDiff.bullets.filter((b) => b.changed).length;

  return (
    <div className="w-full max-w-[1280px] px-8 pb-[60px] pt-7">
      {/* Breadcrumb */}
      <div className="mb-2 flex items-center gap-1.5 text-[12.5px] text-text-faint">
        <Link
          href="/dashboard"
          className="text-text-muted transition-colors hover:text-text"
        >
          Dashboard
        </Link>
        <ChevronRight size={12} aria-hidden />
        <span className="text-text">{job.title}</span>
      </div>

      {/* Title row */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="mb-1.5 flex items-center gap-3">
            <div className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-md border border-border bg-bg-elev-2 font-display text-[16px] font-semibold tracking-[-0.01em] text-text">
              {job.company.slice(0, 1)}
            </div>
            <div className="min-w-0">
              <div className="text-[13px] text-text-muted">{job.company}</div>
              <h1 className="font-display text-[24px] font-semibold leading-[1.15] tracking-[-0.025em]">
                {job.title}
              </h1>
            </div>
          </div>
          <div className="mt-2.5 flex flex-wrap items-center gap-x-[14px] gap-y-1 text-[12.5px] text-text-muted">
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
            <span className="text-text-faint">·</span>
            <span>{job.seniority}</span>
          </div>
        </div>
        <div className="flex flex-shrink-0 items-center gap-2">
          <Button variant="outline" size="sm">
            <Bookmark size={13} aria-hidden /> Save
          </Button>
          <Button variant="outline" size="sm">
            View on company site
          </Button>
          <Button variant="default" size="sm">
            <Check size={13} aria-hidden /> Mark as applied
          </Button>
        </div>
      </div>

      {/* Two columns */}
      <div className="mt-7 grid grid-cols-2 gap-6">
        {/* LEFT */}
        <div className="flex flex-col gap-4">
          {/* Why this match */}
          <section className="rounded-lg border border-border bg-background p-[22px]">
            <h2 className="font-display text-[18px] font-semibold tracking-[-0.018em]">
              Why this match
            </h2>
            <ul className="mt-3 flex flex-col gap-1.5 text-[13.5px] text-text-muted">
              {job.whyMatch.map((w, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="flex-shrink-0 text-text-faint">—</span>
                  <span>{w}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 grid grid-cols-3 gap-3 border-t border-border pt-4">
              <Stat
                label="Skills"
                value={`${job.skills.length}/${job.skills.length + 2}`}
              />
              <Stat label="Salary fit" value="Above floor" />
              <Stat label="Location" value={job.workMode} />
            </div>
          </section>

          {/* Skills */}
          <section className="rounded-lg border border-border bg-background p-[22px]">
            <h2 className="font-display text-[18px] font-semibold tracking-[-0.018em]">
              Required skills
            </h2>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {job.skills.map((s) => (
                <Chip key={s} accent>
                  {s}
                </Chip>
              ))}
            </div>
            <h3 className="mt-[18px] font-display text-[15px] font-semibold tracking-[-0.018em]">
              Nice to have
            </h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {job.niceToHaves.map((s) => (
                <Chip key={s}>{s}</Chip>
              ))}
            </div>
          </section>

          {/* About the role */}
          <section className="rounded-lg border border-border bg-background p-[22px]">
            <h2 className="font-display text-[18px] font-semibold tracking-[-0.018em]">
              About the role
            </h2>
            <div className="mt-2.5 whitespace-pre-line text-[13.5px] leading-[1.65] text-text-muted">
              {job.description}
            </div>
          </section>
        </div>

        {/* RIGHT */}
        <div className="flex flex-col gap-4">
          <section className="rounded-lg border border-border bg-background p-[22px]">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-[18px] font-semibold tracking-[-0.018em]">
                Tailored materials
              </h2>
              <span className="inline-flex h-[22px] items-center rounded-[4px] border border-good/35 bg-good/10 px-2 text-[11.5px] font-medium text-good">
                Quality {resumeDiff.qualityScore}%
              </span>
            </div>

            <Tabs defaultValue="resume" className="mt-4">
              <TabsList
                variant="line"
                className="w-full justify-start border-b border-border"
              >
                <TabsTrigger value="resume">Resume</TabsTrigger>
                <TabsTrigger value="cover">Cover letter</TabsTrigger>
              </TabsList>

              <TabsContent value="resume" className="mt-4">
                {/* Quality breakdown */}
                <div className="mb-3.5 rounded-lg border border-border bg-bg-elev p-3.5">
                  <div className="flex items-center justify-between">
                    <div className="text-[13px] font-medium">
                      Application quality score
                    </div>
                    <div className="font-display text-[22px] font-semibold leading-none tracking-[-0.02em] tabular-nums">
                      {resumeDiff.qualityScore}
                      <span className="text-[13px] text-text-faint">%</span>
                    </div>
                  </div>
                  <div className="mt-2.5 h-1.5 overflow-hidden rounded-[3px] bg-bg-elev-2">
                    <div
                      className="h-full rounded-[3px] bg-text"
                      style={{ width: `${resumeDiff.qualityScore}%` }}
                    />
                  </div>
                  <div className="mt-3.5 grid grid-cols-2 gap-2">
                    {resumeDiff.breakdown.map((b) => (
                      <div
                        key={b.label}
                        className="flex items-center justify-between text-[12px]"
                      >
                        <span className="text-text-muted">{b.label}</span>
                        <span
                          className={cn(
                            "font-mono tabular-nums",
                            breakdownTone[b.state],
                          )}
                        >
                          {b.score}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-3.5 flex items-center gap-2">
                  <Button variant="default" size="sm">
                    <Sparkles size={13} aria-hidden /> Regenerate
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download size={13} aria-hidden /> Download DOCX
                  </Button>
                  <span className="ml-auto text-[12px] text-text-faint">
                    {changedCount} of {resumeDiff.bullets.length} bullets
                    changed
                  </span>
                </div>

                <div className="flex flex-col gap-2.5">
                  {resumeDiff.bullets.map((b, i) => (
                    <div
                      key={i}
                      className="overflow-hidden rounded-md border border-border"
                    >
                      <div className="grid grid-cols-2 gap-px bg-border">
                        <div
                          className={cn(
                            "bg-background px-3.5 py-3 text-[13px] leading-[1.5]",
                            b.changed &&
                              "text-text-faint line-through decoration-text-faint/50",
                          )}
                        >
                          <div className="mb-1.5 text-[10.5px] font-medium uppercase tracking-[0.05em] text-text-faint no-underline">
                            Original
                          </div>
                          <div>{b.original}</div>
                        </div>
                        <div
                          className={cn(
                            "px-3.5 py-3 text-[13px] leading-[1.5]",
                            b.changed ? "bg-good/[0.05]" : "bg-background",
                          )}
                        >
                          <div
                            className={cn(
                              "mb-1.5 text-[10.5px] font-medium uppercase tracking-[0.05em]",
                              b.changed ? "text-good" : "text-text-faint",
                            )}
                          >
                            {b.changed ? "Tailored" : "Unchanged"}
                          </div>
                          <div>{b.tailored}</div>
                        </div>
                      </div>
                      {b.changed && b.reason && (
                        <div className="border-t border-border bg-bg-elev px-3.5 py-2 text-[11.5px] text-text-muted">
                          ↳ {b.reason}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="cover" className="mt-4">
                <div className="mb-3 flex items-center gap-2">
                  <Button variant="default" size="sm">
                    <Sparkles size={13} aria-hidden /> Regenerate
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download size={13} aria-hidden /> Download
                  </Button>
                  <span className="ml-auto text-[12px] text-text-faint tabular-nums">
                    {coverDraft.length} chars
                  </span>
                </div>
                <Textarea
                  value={coverDraft}
                  onChange={(e) => setCoverDraft(e.target.value)}
                  className="min-h-[540px] resize-y bg-background p-[18px] text-[13.5px] leading-[1.65]"
                />
              </TabsContent>
            </Tabs>
          </section>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-[0.04em] text-text-faint">
        {label}
      </div>
      <div className="mt-1 text-[14px] font-semibold">{value}</div>
    </div>
  );
}
