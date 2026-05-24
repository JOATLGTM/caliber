import { randomUUID } from "crypto";
import type { JobField, Seniority, WorkMode } from "@/lib/mock-data";
import { computeMatch } from "@/lib/ai/scoring";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireUser } from "./auth";
import { getProfile, getResumeText } from "./profile";

export interface ManualJobInput {
  company: string;
  title: string;
  location: string;
  workMode: WorkMode;
  applyUrl?: string;
  description?: string;
  salary?: string;
  salaryMin?: number;
  seniority?: Seniority;
  field?: JobField;
}

export async function createManualJob(input: ManualJobInput): Promise<string> {
  const { supabase, user } = await requireUser();
  const [profile, resumeText] = await Promise.all([
    getProfile(),
    getResumeText(),
  ]);

  const id = `manual:${randomUUID()}`;
  const today = new Date().toISOString().slice(0, 10);
  const description = (input.description ?? "").trim();
  const salary = (input.salary ?? "").trim() || "Not listed";
  const salaryMin = input.salaryMin ?? 0;

  const company = input.company.trim();
  const title = input.title.trim();
  const location = input.location.trim() || "Remote";

  const jobRow: Record<string, unknown> = {
    id,
    company,
    title,
    location,
    work_mode: input.workMode,
    salary,
    salary_min: salaryMin,
    match_score: 0,
    posted_at: today,
    seniority: input.seniority ?? "Mid",
    field: input.field ?? "software",
    skills: [] as string[],
    nice_to_haves: [] as string[],
    why_match: [] as string[],
    description,
    source: "manual",
    external_id: id,
    apply_url: input.applyUrl?.trim() || null,
    is_active: true,
    raw_payload: { owner_user_id: user.id },
    synced_at: new Date().toISOString(),
  };

  const admin = createAdminClient();
  const { error: jobError } = await admin.from("jobs").insert(jobRow);
  if (jobError) throw jobError;

  const sig = computeMatch(
    profile,
    {
      id,
      company,
      title,
      location,
      workMode: input.workMode,
      salary,
      salaryMin,
      matchScore: 0,
      postedAt: today,
      seniority: jobRow.seniority as Seniority,
      field: jobRow.field as JobField,
      skills: [],
      niceToHaves: [],
      whyMatch: [],
      description,
      applyUrl: input.applyUrl,
      saved: true,
      dismissed: false,
    },
    { resumeText },
  );

  const { error: ujError } = await supabase.from("user_jobs").upsert(
    {
      user_id: user.id,
      job_id: id,
      saved: true,
      dismissed: false,
      match_score: sig.score,
      why_match: sig.whyMatch,
      scored_at: new Date().toISOString(),
    },
    { onConflict: "user_id,job_id" },
  );
  if (ujError) throw ujError;

  return id;
}
