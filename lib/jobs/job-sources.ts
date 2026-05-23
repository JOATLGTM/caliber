import type { JobProvider } from "@/lib/jobs/ingest/types";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export interface CuratedJobSource {
  company: string;
  provider: JobProvider;
  boardToken: string;
}

/** Curated ATS boards for v1 (verified public JSON endpoints). */
export const CURATED_JOB_SOURCES: CuratedJobSource[] = [
  { company: "Stripe", provider: "greenhouse", boardToken: "stripe" },
  { company: "Figma", provider: "greenhouse", boardToken: "figma" },
  { company: "Airbnb", provider: "greenhouse", boardToken: "airbnb" },
  { company: "Discord", provider: "greenhouse", boardToken: "discord" },
  { company: "Datadog", provider: "greenhouse", boardToken: "datadog" },
  { company: "Cloudflare", provider: "greenhouse", boardToken: "cloudflare" },
  { company: "Spotify", provider: "lever", boardToken: "spotify" },
  { company: "Palantir", provider: "lever", boardToken: "palantir" },
  { company: "Linear", provider: "ashby", boardToken: "linear" },
  { company: "OpenAI", provider: "ashby", boardToken: "openai" },
  { company: "Ramp", provider: "ashby", boardToken: "ramp" },
];

let sourcesSeeded = false;

/** Upsert curated job_sources rows (idempotent). */
export async function ensureJobSourcesCatalog() {
  if (!isSupabaseConfigured() || sourcesSeeded) return;

  const admin = createAdminClient();
  const rows = CURATED_JOB_SOURCES.map((s) => ({
    company: s.company,
    provider: s.provider,
    board_token: s.boardToken,
    enabled: true,
  }));

  const { error } = await admin
    .from("job_sources")
    .upsert(rows, { onConflict: "provider,board_token" });

  if (error) throw error;
  sourcesSeeded = true;
}
