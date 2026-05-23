import type { DashboardStats } from "@/lib/mock-data";
import { MIN_DISPLAY_MATCH_SCORE } from "@/lib/ai/match-config";
import { profileHasMatchingSignal } from "@/lib/ai/field-match";
import { listApplications } from "./applications";
import { ingestedCatalogOnly } from "./catalog";
import { buildVisibleJobList } from "./jobs";
import { getProfile } from "./profile";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/env";

const ACTIVE_STATUSES = new Set([
  "Saved",
  "Applied",
  "Phone Screen",
  "Interview",
  "Offer",
]);

export async function getDashboardStats(): Promise<DashboardStats> {
  const [jobs, applications] = await Promise.all([
    buildVisibleJobList("date"),
    listApplications(),
  ]);

  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const matchesThisWeek = jobs.filter((j) => {
    const posted = new Date(j.postedAt).getTime();
    return posted >= weekAgo && j.matchScore >= MIN_DISPLAY_MATCH_SCORE;
  }).length;

  const savedJobs = jobs.filter((j) => j.saved).length;

  const activeApplications = applications.filter((a) =>
    ACTIVE_STATUSES.has(a.status),
  ).length;

  const avgMatchScore =
    jobs.length === 0
      ? 0
      : Math.round(
          jobs.reduce((sum, j) => sum + j.matchScore, 0) / jobs.length,
        );

  return {
    matchesThisWeek,
    savedJobs,
    activeApplications,
    avgMatchScore,
  };
}

async function countIngestedJobs(): Promise<number> {
  if (!isSupabaseConfigured()) return 0;
  const admin = createAdminClient();
  const { count, error } = await admin
    .from("jobs")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true)
    .not("source", "is", null);
  if (error) return 0;
  return count ?? 0;
}

/** Contextual empty-state copy for the dashboard job list. */
export async function getDashboardEmptyHint(): Promise<string | null> {
  if (!isSupabaseConfigured()) return null;

  const profile = await getProfile();
  const jobs = await buildVisibleJobList("date");

  if (jobs.length > 0) return null;

  if (ingestedCatalogOnly()) {
    const catalogCount = await countIngestedJobs();
    if (catalogCount === 0) {
      return "No jobs in the catalog yet. Run npm run ingest-jobs (or POST /api/cron/ingest-jobs) to load ATS listings.";
    }
  }

  if (!profileHasMatchingSignal(profile)) {
    return "Add target roles and skills on your profile — we'll filter thousands of postings down to roles that fit you.";
  }

  return `No roles scored above ${MIN_DISPLAY_MATCH_SCORE}% yet. Broaden target roles, add skills, or click Recompute matches after updating your profile.`;
}

/** @deprecated use getDashboardEmptyHint */
export async function getCatalogEmptyHint(): Promise<string | null> {
  return getDashboardEmptyHint();
}
