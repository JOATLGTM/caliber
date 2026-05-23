"use server";

import { revalidatePath } from "next/cache";
import { jobDetailPath } from "@/lib/jobs/paths";
import {
  generateCoverLetter,
  generateTailoredResume,
  generateWhyMatch,
} from "@/lib/ai/tailor";
import { computeMatch } from "@/lib/ai/scoring";
import { isAiConfigured } from "@/lib/ai/provider";
import { requireUser } from "@/lib/db/auth";
import { recomputeMatchesForUser } from "@/lib/db/match-sync";
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
    const { updated } = await recomputeMatchesForUser();
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
