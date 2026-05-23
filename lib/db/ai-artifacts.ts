/**
 * Reads/writes for tailored resumes and cover letters keyed by (user, job).
 */

import type { Job, ResumeDiff } from "@/lib/mock-data";
import { requireUser } from "./auth";

interface TailoredRow {
  id: string;
  job_id: string | null;
  title: string;
  job_title: string | null;
  company: string | null;
  match_score_at_time: number | null;
  diff: ResumeDiff | null;
  quality_score: number | null;
  updated_at: string;
}

interface CoverLetterRow {
  id: string;
  job_id: string | null;
  company: string;
  job_title: string;
  body: string;
  updated_at: string;
}

export async function getTailoredResumeForJob(
  jobId: string,
): Promise<TailoredRow | null> {
  const { supabase, user } = await requireUser();
  const { data, error } = await supabase
    .from("resumes")
    .select(
      "id, job_id, title, job_title, company, match_score_at_time, diff, quality_score, updated_at",
    )
    .eq("user_id", user.id)
    .eq("job_id", jobId)
    .eq("is_base", false)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data as TailoredRow | null;
}

export async function upsertTailoredResume(input: {
  job: Job;
  diff: ResumeDiff;
  matchScore: number;
}): Promise<{ id: string }> {
  const { supabase, user } = await requireUser();

  const existing = await getTailoredResumeForJob(input.job.id);

  const payload = {
    user_id: user.id,
    job_id: input.job.id,
    title: `${input.job.company} — ${input.job.title}`,
    is_base: false,
    job_title: input.job.title,
    company: input.job.company,
    match_score_at_time: input.matchScore,
    diff: input.diff,
    quality_score: input.diff.qualityScore,
    quality_breakdown: input.diff.breakdown,
    updated_at: new Date().toISOString(),
  };

  if (existing) {
    const { data, error } = await supabase
      .from("resumes")
      .update(payload)
      .eq("id", existing.id)
      .eq("user_id", user.id)
      .select("id")
      .single();
    if (error) throw error;
    return { id: data.id as string };
  }

  const { data, error } = await supabase
    .from("resumes")
    .insert(payload)
    .select("id")
    .single();
  if (error) throw error;
  return { id: data.id as string };
}

export async function getCoverLetterForJob(
  jobId: string,
): Promise<CoverLetterRow | null> {
  const { supabase, user } = await requireUser();

  const { data, error } = await supabase
    .from("cover_letters")
    .select("id, job_id, company, job_title, body, updated_at")
    .eq("user_id", user.id)
    .eq("job_id", jobId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data as CoverLetterRow | null;
}

export async function upsertCoverLetter(input: {
  job: Job;
  body: string;
}): Promise<{ id: string }> {
  const { supabase, user } = await requireUser();
  const existing = await getCoverLetterForJob(input.job.id);

  const payload = {
    user_id: user.id,
    job_id: input.job.id,
    company: input.job.company,
    job_title: input.job.title,
    body: input.body,
    updated_at: new Date().toISOString(),
  };

  if (existing) {
    const { data, error } = await supabase
      .from("cover_letters")
      .update(payload)
      .eq("id", existing.id)
      .eq("user_id", user.id)
      .select("id")
      .single();
    if (error) throw error;
    return { id: data.id as string };
  }

  const { data, error } = await supabase
    .from("cover_letters")
    .insert(payload)
    .select("id")
    .single();
  if (error) throw error;
  return { id: data.id as string };
}

export async function setUserJobMatch(input: {
  jobId: string;
  matchScore: number;
  whyMatch: string[];
}): Promise<void> {
  const { supabase, user } = await requireUser();
  const { error } = await supabase.from("user_jobs").upsert(
    {
      user_id: user.id,
      job_id: input.jobId,
      match_score: input.matchScore,
      why_match: input.whyMatch,
      scored_at: new Date().toISOString(),
    },
    { onConflict: "user_id,job_id" },
  );
  if (error) throw error;
}
