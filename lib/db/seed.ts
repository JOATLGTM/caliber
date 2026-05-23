import {
  APPLICATIONS,
  COVER_LETTERS,
  JOBS,
  RESUMES,
} from "@/lib/mock-data";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { jobToRow } from "./mappers";

let catalogSeeded = false;

function shouldSeedDemoData(): boolean {
  return process.env.SEED_DEMO_DATA !== "false";
}

/** Upsert mock job catalog (dev only — set SEED_DEMO_DATA=false in production). */
export async function ensureJobsCatalog() {
  if (!isSupabaseConfigured() || catalogSeeded || !shouldSeedDemoData()) return;

  const admin = createAdminClient();
  const rows = JOBS.map(jobToRow);

  const { error } = await admin.from("jobs").upsert(rows, { onConflict: "id" });
  if (error) throw error;

  catalogSeeded = true;
}

/** Seed demo applications / resumes / cover letters for a new user. */
export async function ensureUserSeedData(userId: string) {
  if (!isSupabaseConfigured() || !shouldSeedDemoData()) return;

  await ensureJobsCatalog();

  const admin = createAdminClient();

  const { count, error: countError } = await admin
    .from("applications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  if (countError) throw countError;
  if ((count ?? 0) > 0) return;

  const applicationRows = APPLICATIONS.map((a) => ({
    user_id: userId,
    company: a.company,
    title: a.title,
    status: a.status,
    outcome: a.outcome,
    match_score: a.matchScore,
    applied_at: a.appliedAt === "—" ? null : a.appliedAt,
    salary: a.salary,
  }));

  const { error: appsError } = await admin
    .from("applications")
    .insert(applicationRows);
  if (appsError) throw appsError;

  const savedJobIds = JOBS.filter((j) => j.saved).map((j) => j.id);
  if (savedJobIds.length > 0) {
    const { error: ujError } = await admin.from("user_jobs").upsert(
      savedJobIds.map((job_id) => ({
        user_id: userId,
        job_id,
        saved: true,
        dismissed: false,
      })),
      { onConflict: "user_id,job_id" },
    );
    if (ujError) throw ujError;
  }

  const resumeRows = RESUMES.map((r) => ({
    user_id: userId,
    title: r.title,
    is_base: r.isBase,
    job_title: r.jobTitle ?? null,
    company: r.company ?? null,
    match_score_at_time: r.matchScoreAtTime ?? null,
    updated_at: `${r.updatedAt}T12:00:00Z`,
  }));

  const { error: resumesError } = await admin.from("resumes").insert(resumeRows);
  if (resumesError) throw resumesError;

  const coverRows = COVER_LETTERS.map((c) => ({
    user_id: userId,
    company: c.company,
    job_title: c.jobTitle,
    body: c.preview,
    created_at: `${c.createdAt}T12:00:00Z`,
  }));

  const { error: clError } = await admin.from("cover_letters").insert(coverRows);
  if (clError) throw clError;

  // Profile rows are auto-created blank by the on_auth_user_created trigger.
  // We deliberately do NOT seed Alex Morgan's preferences; new users start blank.
}
