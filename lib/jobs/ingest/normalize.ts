import type { CanonicalIngestJob } from "./types";

export interface IngestJobRow {
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
  source: string;
  external_id: string;
  apply_url: string;
  is_active: boolean;
  raw_payload: Record<string, unknown>;
  synced_at: string;
  job_source_id: string;
}

const MAX_SALARY_MIN = 2_000_000;

export function canonicalToIngestRow(
  job: CanonicalIngestJob,
  jobSourceId: string,
  syncedAt: string,
): IngestJobRow {
  return {
    id: job.id,
    company: job.company,
    title: job.title,
    location: job.location,
    work_mode: job.workMode,
    salary: job.salary,
    salary_min: Math.min(Math.max(0, job.salaryMin), MAX_SALARY_MIN),
    match_score: 0,
    posted_at: job.postedAt,
    seniority: job.seniority,
    field: job.field,
    skills: job.skills,
    nice_to_haves: job.niceToHaves,
    why_match: [],
    description: job.description,
    source: job.source,
    external_id: job.externalId,
    apply_url: job.applyUrl,
    is_active: true,
    raw_payload: job.rawPayload,
    synced_at: syncedAt,
    job_source_id: jobSourceId,
  };
}
