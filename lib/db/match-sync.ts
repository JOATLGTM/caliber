import { computeMatch } from "@/lib/ai/scoring";
import { postedAtCutoffDate } from "@/lib/jobs/ingest/config";
import { ingestedCatalogOnly } from "@/lib/db/catalog";
import { requireUser } from "@/lib/db/auth";
import { getProfile, getResumeText } from "@/lib/db/profile";
import { rowToJob, type JobListRow } from "@/lib/db/mappers";

const JOB_SCORING_SELECT =
  "id, company, title, location, work_mode, salary, salary_min, match_score, posted_at, seniority, field, skills, nice_to_haves, why_match";

/**
 * Recompute and persist match scores for all visible jobs for the current user.
 * Uses the same lightweight job select as the dashboard list scorer.
 */
export async function recomputeMatchesForUser(): Promise<{ updated: number }> {
  const [profile, resumeText] = await Promise.all([
    getProfile(),
    getResumeText(),
  ]);
  const { supabase, user } = await requireUser();

  let jobsQuery = supabase
    .from("jobs")
    .select(JOB_SCORING_SELECT)
    .eq("is_active", true);

  if (ingestedCatalogOnly()) {
    jobsQuery = jobsQuery.not("source", "is", null);
  }

  jobsQuery = jobsQuery.gte("posted_at", postedAtCutoffDate());
  const { data: jobs, error } = await jobsQuery;
  if (error) throw error;

  let updated = 0;
  for (const row of (jobs ?? []) as JobListRow[]) {
    const job = rowToJob(row, null);
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

  return { updated };
}
