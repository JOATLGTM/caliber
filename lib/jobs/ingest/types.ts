import type { JobField, Seniority, WorkMode } from "@/lib/mock-data";

export type JobProvider = "greenhouse" | "lever" | "ashby";

/** Normalized job before DB upsert (aligned with jobs table + Job UI type). */
export interface CanonicalIngestJob {
  id: string;
  source: JobProvider;
  externalId: string;
  applyUrl: string;
  company: string;
  title: string;
  location: string;
  workMode: WorkMode;
  salary: string;
  salaryMin: number;
  seniority: Seniority;
  field: JobField;
  skills: string[];
  niceToHaves: string[];
  description: string;
  postedAt: string;
  rawPayload: Record<string, unknown>;
}

export interface JobSourceRow {
  id: string;
  company: string;
  provider: JobProvider;
  board_token: string;
  enabled: boolean;
}

export interface IngestRunResult {
  runId: string;
  sourcesProcessed: number;
  jobsUpserted: number;
  jobsDeactivated: number;
  errors: { company: string; provider: string; message: string }[];
}
