import type {
  Application,
  ApplicationStatus,
  Job,
  Seniority,
  UserProfile,
  WorkMode,
} from "@/lib/mock-data";

export interface ProfileRow {
  id: string;
  full_name: string;
  phone: string;
  location: string;
  target_roles: string[];
  preferred_locations: string[];
  work_modes: { remote: boolean; hybrid: boolean; onsite: boolean };
  salary_min: number;
  salary_target: number;
  experience_level: string;
  skills: string[];
}

export interface JobRow {
  id: string;
  company: string;
  title: string;
  location: string;
  work_mode: string;
  salary: string;
  salary_min: number;
  match_score: number;
  posted_at: string;
  seniority: string;
  field: string;
  skills: string[];
  nice_to_haves: string[];
  why_match: string[];
  description: string;
  apply_url?: string | null;
  is_active?: boolean | null;
}

/** Subset of JobRow returned by lightweight list queries (no description blob). */
export type JobListRow = Omit<JobRow, "description" | "apply_url"> & {
  description?: string;
  apply_url?: string | null;
};

export interface UserJobRow {
  saved: boolean;
  dismissed: boolean;
  match_score: number | null;
  why_match?: string[] | null;
}

export interface ApplicationRow {
  id: string;
  job_id?: string | null;
  company: string;
  title: string;
  status: string;
  outcome: string | null;
  match_score: number;
  applied_at: string | null;
  salary: string;
}

export function rowToProfile(
  row: ProfileRow,
  email: string,
): UserProfile {
  return {
    name: row.full_name,
    email,
    phone: row.phone,
    location: row.location,
    targetRoles: row.target_roles,
    locations: row.preferred_locations,
    workModes: row.work_modes,
    salaryMin: row.salary_min,
    salaryTarget: row.salary_target,
    experienceLevel: row.experience_level as Seniority,
    skills: row.skills,
  };
}

export function profileToRow(
  userId: string,
  profile: Omit<UserProfile, "email">,
): ProfileRow {
  return {
    id: userId,
    full_name: profile.name,
    phone: profile.phone,
    location: profile.location,
    target_roles: profile.targetRoles,
    preferred_locations: profile.locations,
    work_modes: profile.workModes,
    salary_min: profile.salaryMin,
    salary_target: profile.salaryTarget,
    experience_level: profile.experienceLevel,
    skills: profile.skills,
  };
}

export function rowToJob(row: JobRow | JobListRow, userJob?: UserJobRow | null): Job {
  const cachedWhy = userJob?.why_match;
  return {
    id: row.id,
    company: row.company,
    title: row.title,
    location: row.location,
    workMode: row.work_mode as WorkMode,
    salary: row.salary,
    salaryMin: row.salary_min,
    matchScore: userJob?.match_score ?? row.match_score,
    postedAt: row.posted_at,
    seniority: row.seniority as Job["seniority"],
    field: row.field as Job["field"],
    skills: row.skills,
    niceToHaves: row.nice_to_haves,
    whyMatch:
      cachedWhy && cachedWhy.length > 0 ? cachedWhy : row.why_match,
    description: row.description ?? "",
    applyUrl: row.apply_url ?? undefined,
    saved: userJob?.saved ?? false,
    dismissed: userJob?.dismissed ?? false,
  };
}

export function rowToApplication(row: ApplicationRow): Application {
  return {
    id: row.id,
    jobId: row.job_id ?? null,
    company: row.company,
    title: row.title,
    status: row.status as ApplicationStatus,
    outcome:
      row.outcome === "Won" || row.outcome === "Lost" ? row.outcome : null,
    matchScore: row.match_score,
    appliedAt: row.applied_at ?? "—",
    salary: row.salary,
  };
}

export function jobToRow(job: Job): JobRow {
  return {
    id: job.id,
    company: job.company,
    title: job.title,
    location: job.location,
    work_mode: job.workMode,
    salary: job.salary,
    salary_min: job.salaryMin,
    match_score: job.matchScore,
    posted_at: job.postedAt,
    seniority: job.seniority,
    field: job.field,
    skills: job.skills,
    nice_to_haves: job.niceToHaves,
    why_match: job.whyMatch,
    description: job.description,
  };
}

/** Parse "$200k" or "200000" into integer dollars. */
export function parseSalaryInput(value: string): number {
  const cleaned = value.replace(/[$,\s]/g, "").toLowerCase();
  if (!cleaned) return 0;
  if (cleaned.endsWith("k")) {
    return Math.round(parseFloat(cleaned.slice(0, -1)) * 1000);
  }
  const n = parseInt(cleaned, 10);
  return Number.isFinite(n) ? n : 0;
}

export function formatSalaryK(amount: number): string {
  if (amount <= 0) return "";
  return `$${Math.round(amount / 1000)}k`;
}
