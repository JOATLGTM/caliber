"use server";

import { revalidatePath } from "next/cache";
import { jobDetailPath } from "@/lib/jobs/paths";
import {
  generateCoverLetter,
  generateTailoredResume,
  generateWhyMatch,
} from "@/lib/ai/tailor";
import { computeMatch } from "@/lib/ai/scoring";
import { postedAtCutoffDate } from "@/lib/jobs/ingest/config";
import { isAiConfigured } from "@/lib/ai/provider";
import { requireUser } from "@/lib/db/auth";
import {
  setUserJobMatch,
  upsertCoverLetter,
  upsertTailoredResume,
} from "@/lib/db/ai-artifacts";
import { getJobForUser } from "@/lib/db/jobs";
import { getProfile, getResumeText } from "@/lib/db/profile";
import type { ResumeDiff } from "@/lib/mock-data";

const FALLBACK_BULLETS = [
  { original: "Built and maintained backend services for a production product." },
  { original: "Worked on database performance improvements." },
  { original: "Mentored junior engineers and led code reviews." },
  { original: "Collaborated with product and design partners on roadmap." },
  { original: "Built internal tools." },
  { original: "Helped with hiring." },
];

async function getBaseBullets(): Promise<{ original: string }[]> {
  const { supabase, user } = await requireUser();
  const { data } = await supabase
    .from("resumes")
    .select("diff")
    .eq("user_id", user.id)
    .eq("is_base", true)
    .maybeSingle();

  const diff = data?.diff as ResumeDiff | null | undefined;
  if (diff && Array.isArray(diff.bullets) && diff.bullets.length > 0) {
    return diff.bullets.map((b) => ({ original: b.original }));
  }
  return FALLBACK_BULLETS;
}


export async function regenerateResumeAction(
  jobId: string,
): Promise<{ ok: true; diff: ResumeDiff } | { ok: false; error: string }> {
  try {
    const job = await getJobForUser(jobId);
    if (!job) return { ok: false, error: "Job not found" };

    const profile = await getProfile();
    const baseBullets = await getBaseBullets();
    const resumeText = await getResumeText();

    const diff = await generateTailoredResume({
      profile,
      job,
      baseBullets,
      resumeText,
    });

    const signal = computeMatch(profile, job, { resumeText });
    const why =
      job.whyMatch.length > 0
        ? job.whyMatch
        : await generateWhyMatch({ profile, job, baseSignal: signal.whyMatch });

    await Promise.all([
      upsertTailoredResume({ job, diff, matchScore: signal.score }),
      setUserJobMatch({
        jobId: job.id,
        matchScore: signal.score,
        whyMatch: why,
      }),
    ]);

    revalidatePath(jobDetailPath(job.id));
    revalidatePath("/resumes");
    revalidatePath("/dashboard");
    return { ok: true, diff };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Failed to tailor resume",
    };
  }
}

export async function regenerateCoverLetterAction(
  jobId: string,
): Promise<{ ok: true; body: string } | { ok: false; error: string }> {
  try {
    const job = await getJobForUser(jobId);
    if (!job) return { ok: false, error: "Job not found" };

    const profile = await getProfile();
    const resumeText = await getResumeText();

    const body = await generateCoverLetter({ profile, job, resumeText });
    await upsertCoverLetter({ job, body });

    revalidatePath(jobDetailPath(job.id));
    revalidatePath("/cover-letters");
    return { ok: true, body };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Failed to generate cover letter",
    };
  }
}

export async function saveCoverLetterDraftAction(
  jobId: string,
  body: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const job = await getJobForUser(jobId);
    if (!job) return { ok: false, error: "Job not found" };
    await upsertCoverLetter({ job, body });
    revalidatePath(jobDetailPath(jobId));
    revalidatePath("/cover-letters");
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Failed to save",
    };
  }
}

/**
 * Recompute match scores for all visible jobs based on the current profile.
 * Stores per-user match score + whyMatch on `user_jobs`.
 */
export async function recomputeAllMatchScoresAction(): Promise<
  { ok: true; updated: number } | { ok: false; error: string }
> {
  try {
    const [profile, resumeText] = await Promise.all([
      getProfile(),
      getResumeText(),
    ]);
    const { supabase, user } = await requireUser();

    let jobsQuery = supabase.from("jobs").select("*").eq("is_active", true);
    if (process.env.SEED_DEMO_DATA === "false") {
      jobsQuery = jobsQuery.not("source", "is", null);
    }
    jobsQuery = jobsQuery.gte("posted_at", postedAtCutoffDate());
    const { data: jobs, error } = await jobsQuery;
    if (error) throw error;

    let updated = 0;
    for (const row of jobs ?? []) {
      const job = {
        id: row.id as string,
        company: row.company as string,
        title: row.title as string,
        location: row.location as string,
        workMode: row.work_mode as "Remote" | "Hybrid" | "Onsite",
        salary: row.salary as string,
        salaryMin: row.salary_min as number,
        matchScore: row.match_score as number,
        postedAt: row.posted_at as string,
        seniority: row.seniority as "Entry" | "Mid" | "Senior" | "Staff+",
        field: row.field as
          | "software"
          | "design"
          | "pm"
          | "marketing"
          | "healthcare"
          | "finance"
          | "cs",
        skills: row.skills as string[],
        niceToHaves: row.nice_to_haves as string[],
        whyMatch: row.why_match as string[],
        description: row.description as string,
        saved: false,
        dismissed: false,
      };

      const sig = computeMatch(profile, job, { resumeText });
      const { error: upError } = await supabase.from("user_jobs").upsert(
        {
          user_id: user.id,
          job_id: job.id,
          match_score: sig.score,
          why_match: sig.whyMatch,
          scored_at: new Date().toISOString(),
        },
        { onConflict: "user_id,job_id" },
      );
      if (!upError) updated++;
    }

    revalidatePath("/dashboard");
    return { ok: true, updated };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Failed to recompute matches",
    };
  }
}

export { isAiConfigured };
