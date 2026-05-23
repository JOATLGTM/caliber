import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/env";

/** When false, the app uses ATS-ingested jobs only (no mock catalog). */
export function ingestedCatalogOnly(): boolean {
  return process.env.SEED_DEMO_DATA === "false";
}

/**
 * Hide legacy mock rows seeded before job ingestion (ids like j-stripe-be, source null).
 * Safe to call on every bootstrap when SEED_DEMO_DATA=false.
 */
export async function deactivateLegacyMockJobs(): Promise<void> {
  if (!isSupabaseConfigured() || !ingestedCatalogOnly()) return;

  const admin = createAdminClient();
  const { error } = await admin
    .from("jobs")
    .update({ is_active: false })
    .is("source", null);

  if (error) throw error;
}
