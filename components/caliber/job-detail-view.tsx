"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  Bookmark,
  Check,
  ChevronRight,
  ExternalLink,
  Download,
  Loader2,
  MapPin,
  Sparkles,
} from "lucide-react";
import type { Job, ResumeDiff, ResumeDiffBreakdown } from "@/lib/mock-data";
import { daysAgo } from "@/lib/mock-data";
import { formatJobSalaryDisplay } from "@/lib/jobs/salary-display";
import { saveJobAction, markJobAppliedAction, removeFromPipelineAction } from "@/lib/actions/jobs";
import type { ApplicationStatus } from "@/lib/mock-data";
import {
  regenerateCoverLetterAction,
  regenerateResumeAction,
  saveCoverLetterDraftAction,
} from "@/lib/actions/ai";
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
  aiEnabled: boolean;
  applicationStatus?: ApplicationStatus | null;
}

const breakdownTone: Record<ResumeDiffBreakdown["state"], string> = {
  good: "text-good",
  ok: "text-warn",
  warn: "text-warn",
  bad: "text-bad",
};

function downloadTextFile(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function JobDetailView({
  job,
  resumeDiff,
  coverLetterDraft,
  aiEnabled,
  applicationStatus = null,
}: JobDetailViewProps) {
  const [diff, setDiff] = useState(resumeDiff);
  const [coverDraft, setCoverDraft] = useState(coverLetterDraft);
  const [savedDraft, setSavedDraft] = useState(coverLetterDraft);
  const [saved, setSaved] = useState(job.saved);
  const [pipelineStatus, setPipelineStatus] = useState(applicationStatus);

  const [savePending, startSaveTransition] = useTransition();
  const [applyPending, startApplyTransition] = useTransition();
  const [removePending, startRemoveTransition] = useTransition();
  const [resumePending, startResumeTransition] = useTransition();
  const [coverPending, startCoverTransition] = useTransition();
  const [draftSavePending, startDraftSave] = useTransition();

  const salary = formatJobSalaryDisplay(job.salary, job.salaryMin);

  const changedCount = diff.bullets.filter((b) => b.changed).length;
  const hasResume = diff.bullets.length > 0;
  const dirtyDraft = coverDraft !== savedDraft;
  const hasPipeline = pipelineStatus != null;
  const hasApplied =
    pipelineStatus != null && pipelineStatus !== "Saved";

  function handleToggleSave() {
    const next = !saved;
    setSaved(next);
    startSaveTransition(async () => {
      const result = await saveJobAction(job.id, next);
      if (!result.ok) {
        setSaved(!next);
        toast.error(result.error ?? "Couldn't update saved status");
        return;
      }
      if (next) {
        setPipelineStatus("Saved");
        toast.success("Saved — added to Applications (Saved column)");
      } else if (result.removedFromPipeline) {
        setPipelineStatus(null);
        toast.success("Removed from saved and Applications board");
      } else if (result.pipelineKept) {
        toast.success(
          "Removed from saved jobs — still on your Applications board",
        );
      } else {
        setPipelineStatus(null);
        toast.success("Removed from saved");
      }
    });
  }

  function handleRemoveFromPipeline() {
    startRemoveTransition(async () => {
      const result = await removeFromPipelineAction(job.id);
      if (!result.ok) {
        toast.error(result.error ?? "Couldn't remove from pipeline");
      } else {
        setSaved(false);
        setPipelineStatus(null);
        toast.success("Removed from Applications board");
      }
    });
  }

  function handleMarkApplied() {
    startApplyTransition(async () => {
      const result = await markJobAppliedAction(job.id);
      if (!result.ok) {
        toast.error(result.error ?? "Couldn't mark as applied");
      } else {
        setSaved(true);
        setPipelineStatus("Applied");
        toast.success("Marked as applied — see your Applications board");
      }
    });
  }

  function handleRegenerateResume() {
    startResumeTransition(async () => {
      const result = await regenerateResumeAction(job.id);
      if (result.ok) {
        setDiff(result.diff);
        toast.success("Tailored resume ready");
      } else {
        toast.error(result.error);
      }
    });
  }

  function handleRegenerateCover() {
    startCoverTransition(async () => {
      const result = await regenerateCoverLetterAction(job.id);
      if (result.ok) {
        setCoverDraft(result.body);
        setSavedDraft(result.body);
        toast.success("Cover letter generated");
      } else {
        toast.error(result.error);
      }
    });
  }

  function handleSaveDraft() {
    startDraftSave(async () => {
      const result = await saveCoverLetterDraftAction(job.id, coverDraft);
      if (result.ok) {
        setSavedDraft(coverDraft);
        toast.success("Cover letter saved");
      } else {
        toast.error(result.error);
      }
    });
  }

  // Auto-save cover letter draft 1.5s after typing stops.
  const autoSaveRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!dirtyDraft) return;
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    autoSaveRef.current = setTimeout(() => {
      void saveCoverLetterDraftAction(job.id, coverDraft).then((res) => {
        if (res.ok) setSavedDraft(coverDraft);
      });
    }, 1500);
    return () => {
      if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    };
  }, [coverDraft, dirtyDraft, job.id]);

  return (
    <div className="w-full max-w-[1280px] px-4 pb-[60px] pt-7 md:px-8">
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
      <div className="flex flex-col items-start gap-4 lg:flex-row lg:justify-between">
        <div className="min-w-0">
          <div className="mb-1.5 flex items-center gap-3">
            <div className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-md border border-border bg-bg-elev-2 font-display text-[16px] font-semibold tracking-[-0.01em] text-text">
              {job.company.slice(0, 1)}
            </div>
            <div className="min-w-0">
              <div className="text-[13px] text-text-muted">{job.company}</div>
              <h1 className="font-display text-[22px] font-semibold leading-[1.15] tracking-[-0.025em] sm:text-[24px]">
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
            <span
              className={cn(
                salary.isKnown ? "tabular-nums" : "text-text-faint",
              )}
            >
              {salary.text}
            </span>
            <span className="text-text-faint">·</span>
            <span>{daysAgo(job.postedAt)}</span>
            <span className="text-text-faint">·</span>
            <span>{job.seniority}</span>
            {job.matchScore != null && (
              <>
                <span className="text-text-faint">·</span>
                <span className="tabular-nums">{job.matchScore}% match</span>
              </>
            )}
          </div>
        </div>
        <div className="flex flex-shrink-0 flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleSave}
            disabled={savePending}
          >
            <Bookmark size={13} aria-hidden /> {saved ? "Saved" : "Save"}
          </Button>
          {job.applyUrl ? (
            <Button variant="outline" size="sm" asChild>
              <a href={job.applyUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink size={13} aria-hidden /> Apply on company site
              </a>
            </Button>
          ) : null}
          {hasApplied ? (
            <Button variant="secondary" size="sm" asChild>
              <Link href="/applications">
                <Check size={13} aria-hidden /> Tracking in Applications
              </Link>
            </Button>
          ) : (
            <Button
              variant="default"
              size="sm"
              onClick={handleMarkApplied}
              disabled={applyPending}
            >
              {applyPending ? (
                <Loader2 size={13} aria-hidden className="animate-spin" />
              ) : (
                <Check size={13} aria-hidden />
              )}
              {applyPending ? "Saving…" : "Mark as applied"}
            </Button>
          )}
          {hasPipeline ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemoveFromPipeline}
              disabled={removePending}
              className="text-text-muted"
            >
              {removePending ? "Removing…" : "Remove from pipeline"}
            </Button>
          ) : null}
        </div>
      </div>

      {/* Two columns */}
      <div className="mt-7 grid grid-cols-1 gap-6 lg:grid-cols-2">
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
            {job.skills.length > 0 ? (
              <div className="mt-2.5 flex flex-wrap gap-2">
                {job.skills.map((s) => (
                  <Chip key={s} accent>
                    {s}
                  </Chip>
                ))}
              </div>
            ) : (
              <p className="mt-2.5 text-[13px] text-text-faint">
                No structured skills extracted — see About the role for requirements.
              </p>
            )}
            <h3 className="mt-[18px] font-display text-[15px] font-semibold tracking-[-0.018em]">
              Nice to have
            </h3>
            {job.niceToHaves.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {job.niceToHaves.map((s) => (
                  <Chip key={s}>{s}</Chip>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-[13px] text-text-faint">None listed.</p>
            )}
          </section>

          {/* About the role */}
          <section className="rounded-lg border border-border bg-background p-[22px]">
            <h2 className="font-display text-[18px] font-semibold tracking-[-0.018em]">
              About the role
            </h2>
            {job.description.trim() ? (
              <div className="mt-2.5 whitespace-pre-line text-[13.5px] leading-[1.65] text-text-muted">
                {job.description}
              </div>
            ) : (
              <p className="mt-2.5 text-[13px] text-text-faint">
                Full description not available from the job board API. Use{" "}
                {job.applyUrl ? (
                  <a
                    href={job.applyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-text underline underline-offset-2"
                  >
                    Apply on company site
                  </a>
                ) : (
                  "the company career page"
                )}{" "}
                for details.
              </p>
            )}
          </section>
        </div>

        {/* RIGHT */}
        <div className="flex flex-col gap-4">
          <section className="rounded-lg border border-border bg-background p-[22px]">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-[18px] font-semibold tracking-[-0.018em]">
                Tailored materials
              </h2>
              {hasResume && (
                <span className="inline-flex h-[22px] items-center rounded-[4px] border border-good/35 bg-good/10 px-2 text-[11.5px] font-medium text-good">
                  Quality {diff.qualityScore}%
                </span>
              )}
            </div>
            {!aiEnabled && (
              <p className="mt-2 text-[12px] text-text-faint">
                Demo mode — set <code className="font-mono">OPENAI_API_KEY</code>{" "}
                to enable real AI generation.
              </p>
            )}

            <Tabs defaultValue="resume" className="mt-4">
              <TabsList
                variant="line"
                className="w-full justify-start border-b border-border"
              >
                <TabsTrigger value="resume">Resume</TabsTrigger>
                <TabsTrigger value="cover">Cover letter</TabsTrigger>
              </TabsList>

              <TabsContent value="resume" className="mt-4">
                {hasResume ? (
                  <>
                    <div className="mb-3.5 rounded-lg border border-border bg-bg-elev p-3.5">
                      <div className="flex items-center justify-between">
                        <div className="text-[13px] font-medium">
                          Application quality score
                        </div>
                        <div className="font-display text-[22px] font-semibold leading-none tracking-[-0.02em] tabular-nums">
                          {diff.qualityScore}
                          <span className="text-[13px] text-text-faint">%</span>
                        </div>
                      </div>
                      <div className="mt-2.5 h-1.5 overflow-hidden rounded-[3px] bg-bg-elev-2">
                        <div
                          className="h-full rounded-[3px] bg-text"
                          style={{ width: `${diff.qualityScore}%` }}
                        />
                      </div>
                      <div className="mt-3.5 grid grid-cols-2 gap-2">
                        {diff.breakdown.map((b) => (
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

                    <div className="mb-3.5 flex flex-wrap items-center gap-2">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={handleRegenerateResume}
                        disabled={resumePending}
                      >
                        {resumePending ? (
                          <Loader2 size={13} aria-hidden className="animate-spin" />
                        ) : (
                          <Sparkles size={13} aria-hidden />
                        )}
                        {resumePending ? "Tailoring…" : "Regenerate"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          downloadTextFile(
                            `${job.company}-${job.title}-resume.txt`,
                            diff.bullets
                              .map((b) => `• ${b.tailored}`)
                              .join("\n"),
                          )
                        }
                      >
                        <Download size={13} aria-hidden /> Download
                      </Button>
                      <span className="text-[12px] text-text-faint sm:ml-auto">
                        {changedCount} of {diff.bullets.length} bullets changed
                      </span>
                    </div>

                    <div className="flex flex-col gap-2.5">
                      {diff.bullets.map((b, i) => (
                        <div
                          key={i}
                          className="overflow-hidden rounded-md border border-border"
                        >
                          <div className="grid grid-cols-1 gap-px bg-border sm:grid-cols-2">
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
                  </>
                ) : (
                  <EmptyTab
                    title="No tailored resume yet"
                    description="Generate a version of your base resume tuned to this job."
                    action={
                      <Button
                        variant="default"
                        size="sm"
                        onClick={handleRegenerateResume}
                        disabled={resumePending}
                      >
                        {resumePending ? (
                          <Loader2 size={13} aria-hidden className="animate-spin" />
                        ) : (
                          <Sparkles size={13} aria-hidden />
                        )}
                        {resumePending ? "Tailoring…" : "Generate tailored resume"}
                      </Button>
                    }
                  />
                )}
              </TabsContent>

              <TabsContent value="cover" className="mt-4">
                {coverDraft.length === 0 ? (
                  <EmptyTab
                    title="No cover letter yet"
                    description="Draft one based on your profile and the job description."
                    action={
                      <Button
                        variant="default"
                        size="sm"
                        onClick={handleRegenerateCover}
                        disabled={coverPending}
                      >
                        {coverPending ? (
                          <Loader2 size={13} aria-hidden className="animate-spin" />
                        ) : (
                          <Sparkles size={13} aria-hidden />
                        )}
                        {coverPending ? "Drafting…" : "Generate cover letter"}
                      </Button>
                    }
                  />
                ) : (
                  <>
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={handleRegenerateCover}
                        disabled={coverPending}
                      >
                        {coverPending ? (
                          <Loader2 size={13} aria-hidden className="animate-spin" />
                        ) : (
                          <Sparkles size={13} aria-hidden />
                        )}
                        {coverPending ? "Drafting…" : "Regenerate"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSaveDraft}
                        disabled={!dirtyDraft || draftSavePending}
                      >
                        {draftSavePending ? (
                          <Loader2 size={13} aria-hidden className="animate-spin" />
                        ) : (
                          <Check size={13} aria-hidden />
                        )}
                        {dirtyDraft ? "Save edits" : "Saved"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          downloadTextFile(
                            `${job.company}-${job.title}-cover.txt`,
                            coverDraft,
                          )
                        }
                      >
                        <Download size={13} aria-hidden /> Download
                      </Button>
                      <span className="text-[12px] text-text-faint tabular-nums sm:ml-auto">
                        {coverDraft.length} chars
                      </span>
                    </div>
                    <Textarea
                      value={coverDraft}
                      onChange={(e) => setCoverDraft(e.target.value)}
                      className="min-h-[540px] resize-y bg-background p-[18px] text-[13.5px] leading-[1.65]"
                    />
                  </>
                )}
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

function EmptyTab({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-md border border-dashed border-border bg-bg-elev/40 px-4 py-10 text-center">
      <Sparkles size={20} aria-hidden className="text-text-faint" />
      <div>
        <div className="font-display text-[15px] font-semibold tracking-[-0.018em]">
          {title}
        </div>
        <p className="mt-1 max-w-[420px] text-[12.5px] text-text-muted">
          {description}
        </p>
      </div>
      {action}
    </div>
  );
}
