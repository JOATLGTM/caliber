import type { Job, UserProfile } from "@/lib/mock-data";
import { computeMatch } from "@/lib/ai/scoring";
import { mergeProfileSkills } from "@/lib/ai/profile-skills";
import {
  jobRelevantToProfile,
  profileHasMatchingSignal,
} from "@/lib/ai/field-match";
import {
  DASHBOARD_PAGE_SIZE,
  MAX_DASHBOARD_JOBS,
  MIN_DISPLAY_MATCH_SCORE,
  type JobSortKey,
} from "@/lib/ai/match-config";
import { postedAtCutoffDate } from "@/lib/jobs/ingest/config";
import { ingestedCatalogOnly } from "./catalog";
import { requireUser } from "./auth";
import { getProfile, getResumeText } from "./profile";
import { rowToJob, type JobListRow, type JobRow, type UserJobRow } from "./mappers";

export type { JobSortKey };

export interface ListJobsOptions {
  page?: number;
  pageSize?: number;
  sortBy?: JobSortKey;
}

export interface ListJobsResult {
  jobs: Job[];
  /** Total visible matches after filters, capped at MAX_DASHBOARD_JOBS. */
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/** Columns needed for list scoring — omits description/apply_url to keep queries fast. */
const JOB_LIST_SCORING_SELECT =
  "id, company, title, location, work_mode, salary, salary_min, match_score, posted_at, seniority, field, skills, nice_to_haves, why_match";

async function fetchActiveJobCandidates(
  supabase: Awaited<ReturnType<typeof requireUser>>["supabase"],
  sortBy: JobSortKey,
): Promise<JobListRow[]> {
  let q = supabase
    .from("jobs")
    .select(JOB_LIST_SCORING_SELECT)
    .eq("is_active", true);

  if (ingestedCatalogOnly()) {
    q = q.not("source", "is", null);
  }

  q = q.gte("posted_at", postedAtCutoffDate());

  if (sortBy === "date") {
    q = q.order("posted_at", { ascending: false });
  } else if (sortBy === "salary") {
    q = q.order("salary_min", { ascending: false });
  } else {
    q = q.order("posted_at", { ascending: false });
  }

  const { data, error } = await q.limit(MAX_DASHBOARD_JOBS * 4);
  if (error) throw error;
  return (data ?? []) as JobListRow[];
}

function scoreJob(
  row: JobListRow,
  userJob: UserJobRow | undefined,
  profile: UserProfile,
  hasProfile: boolean,
  resumeText?: string | null,
): Job {
  const baseJob = rowToJob(row, userJob ?? null);

  if (!hasProfile) return baseJob;

  const sig = computeMatch(profile, baseJob, { resumeText });
  return {
    ...baseJob,
    matchScore: sig.score,
    whyMatch: sig.whyMatch.length > 0 ? sig.whyMatch : baseJob.whyMatch,
  };
}

function sortJobs(jobs: Job[], sortBy: JobSortKey): Job[] {
  const arr = [...jobs];
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
}

/** Score, filter, sort, and cap the full visible job list (up to MAX_DASHBOARD_JOBS). */
export async function buildVisibleJobList(
  sortBy: JobSortKey = "date",
): Promise<Job[]> {
  const { supabase, user } = await requireUser();
  const [profile, resumeText] = await Promise.all([
    getProfile(),
    getResumeText(),
  ]);
  const hasProfile = profileHasMatchingSignal(profile);
  const effectiveSkills = mergeProfileSkills(profile.skills, resumeText);

  const [jobRows, { data: userJobs, error: ujError }] = await Promise.all([
    fetchActiveJobCandidates(supabase, sortBy),
    supabase
      .from("user_jobs")
      .select("job_id, saved, dismissed, match_score, why_match")
      .eq("user_id", user.id),
  ]);

  if (ujError) throw ujError;

  const byJobId = new Map(
    (userJobs ?? []).map((uj) => [
      uj.job_id as string,
      {
        saved: uj.saved as boolean,
        dismissed: uj.dismissed as boolean,
        match_score: uj.match_score as number | null,
        why_match: (uj.why_match as string[] | null) ?? null,
      } satisfies UserJobRow,
    ]),
  );

  const scored = jobRows
    .map((row) =>
      scoreJob(row, byJobId.get(row.id), profile, hasProfile, resumeText),
    )
    .filter((j) => !j.dismissed);

  if (!hasProfile) {
    return sortJobs(scored, sortBy).slice(0, MAX_DASHBOARD_JOBS);
  }

  const relevant = scored.filter(
    (j) =>
      j.saved ||
      jobRelevantToProfile(profile, j, effectiveSkills),
  );

  const visible = relevant.filter(
    (j) => j.saved || j.matchScore >= MIN_DISPLAY_MATCH_SCORE,
  );

  return sortJobs(visible, sortBy).slice(0, MAX_DASHBOARD_JOBS);
}

export async function listJobsForUser(
  options: ListJobsOptions = {},
): Promise<ListJobsResult> {
  const pageSize = options.pageSize ?? DASHBOARD_PAGE_SIZE;
  const page = Math.max(1, options.page ?? 1);
  const sortBy = options.sortBy ?? "date";

  const allVisible = await buildVisibleJobList(sortBy);
  const total = allVisible.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;

  return {
    jobs: allVisible.slice(start, start + pageSize),
    total,
    page: safePage,
    pageSize,
    totalPages,
  };
}

export async function getJobForUser(jobId: string): Promise<Job | null> {
  const { supabase, user } = await requireUser();

  const { data: job, error: jobError } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", jobId)
    .maybeSingle();

  if (jobError) throw jobError;
  if (!job) return null;

  const { data: userJob, error: ujError } = await supabase
    .from("user_jobs")
    .select("saved, dismissed, match_score, why_match")
    .eq("user_id", user.id)
    .eq("job_id", jobId)
    .maybeSingle();

  if (ujError) throw ujError;

  return rowToJob(job as JobRow, userJob as UserJobRow | null);
}

export async function setJobSaved(jobId: string, saved: boolean): Promise<void> {
  const { supabase, user } = await requireUser();

  const { error } = await supabase.from("user_jobs").upsert(
    {
      user_id: user.id,
      job_id: jobId,
      saved,
      dismissed: false,
    },
    { onConflict: "user_id,job_id" },
  );

  if (error) throw error;
}

export async function setJobDismissed(
  jobId: string,
  dismissed: boolean,
): Promise<void> {
  const { supabase, user } = await requireUser();

  const { error } = await supabase.from("user_jobs").upsert(
    {
      user_id: user.id,
      job_id: jobId,
      dismissed,
      saved: false,
    },
    { onConflict: "user_id,job_id" },
  );

  if (error) throw error;
}
