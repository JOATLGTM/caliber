import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { ensureJobSourcesCatalog } from "@/lib/jobs/job-sources";
import { fetchAshbyJobs } from "./ashby";
import { fetchGreenhouseJobs } from "./greenhouse";
import { fetchLeverJobs } from "./lever";
import { canonicalToIngestRow } from "./normalize";
import type {
  CanonicalIngestJob,
  IngestRunResult,
  JobSourceRow,
} from "./types";

const BATCH_UPSERT = 100;
const SOURCE_DELAY_MS = 400;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchForSource(
  source: JobSourceRow,
): Promise<CanonicalIngestJob[]> {
  const token = source.board_token;
  switch (source.provider) {
    case "greenhouse":
      return fetchGreenhouseJobs(token, source.company);
    case "lever":
      return fetchLeverJobs(token, source.company);
    case "ashby":
      return fetchAshbyJobs(token, source.company);
    default:
      throw new Error(`Unknown provider: ${source.provider}`);
  }
}

async function upsertJobBatch(
  admin: ReturnType<typeof createAdminClient>,
  rows: ReturnType<typeof canonicalToIngestRow>[],
) {
  for (let i = 0; i < rows.length; i += BATCH_UPSERT) {
    const chunk = rows.slice(i, i + BATCH_UPSERT);
    const { error } = await admin.from("jobs").upsert(chunk, { onConflict: "id" });
    if (error) throw error;
  }
}

async function deactivateStaleForSource(
  admin: ReturnType<typeof createAdminClient>,
  jobSourceId: string,
  runStartedAt: string,
): Promise<number> {
  const { data, error } = await admin
    .from("jobs")
    .update({ is_active: false })
    .eq("job_source_id", jobSourceId)
    .eq("is_active", true)
    .lt("synced_at", runStartedAt)
    .select("id");

  if (error) throw error;
  return data?.length ?? 0;
}

export async function runJobIngestion(): Promise<IngestRunResult> {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured");
  }

  await ensureJobSourcesCatalog();

  const admin = createAdminClient();
  const runStarted = new Date().toISOString();

  const { data: runRow, error: runInsertError } = await admin
    .from("job_ingestion_runs")
    .insert({ started_at: runStarted })
    .select("id")
    .single();

  if (runInsertError) throw runInsertError;
  const runId = runRow.id as string;

  const { data: sources, error: sourcesError } = await admin
    .from("job_sources")
    .select("id, company, provider, board_token, enabled")
    .eq("enabled", true)
    .order("company");

  if (sourcesError) throw sourcesError;

  let sourcesProcessed = 0;
  let jobsUpserted = 0;
  let jobsDeactivated = 0;
  const errors: IngestRunResult["errors"] = [];

  for (const source of (sources ?? []) as JobSourceRow[]) {
    const runStartedAt = new Date().toISOString();
    try {
      const jobs = await fetchForSource(source);
      const rows = jobs.map((j) =>
        canonicalToIngestRow(j, source.id, runStartedAt),
      );

      if (rows.length > 0) {
        await upsertJobBatch(admin, rows);
        jobsUpserted += rows.length;
      }

      const deactivated = await deactivateStaleForSource(
        admin,
        source.id,
        runStartedAt,
      );
      jobsDeactivated += deactivated;

      await admin
        .from("job_sources")
        .update({ last_synced_at: runStartedAt, last_error: null })
        .eq("id", source.id);

      sourcesProcessed++;
    } catch (e) {
      const message =
        e instanceof Error
          ? e.message
          : typeof e === "object" &&
              e !== null &&
              "message" in e &&
              typeof (e as { message: unknown }).message === "string"
            ? (e as { message: string }).message
            : JSON.stringify(e);
      errors.push({
        company: source.company,
        provider: source.provider,
        message,
      });
      await admin
        .from("job_sources")
        .update({ last_error: message })
        .eq("id", source.id);
    }

    await sleep(SOURCE_DELAY_MS);
  }

  const finishedAt = new Date().toISOString();
  const errorPayload =
    errors.length > 0 ? { sources: errors } : null;

  await admin
    .from("job_ingestion_runs")
    .update({
      finished_at: finishedAt,
      sources_processed: sourcesProcessed,
      jobs_upserted: jobsUpserted,
      jobs_deactivated: jobsDeactivated,
      error: errorPayload,
    })
    .eq("id", runId);

  return {
    runId,
    sourcesProcessed,
    jobsUpserted,
    jobsDeactivated,
    errors,
  };
}
