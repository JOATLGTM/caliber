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
  { company: "Notion", provider: "ashby", boardToken: "notion" },
  { company: "Vercel", provider: "greenhouse", boardToken: "vercel" },
  { company: "Databricks", provider: "greenhouse", boardToken: "databricks" },
  { company: "GitLab", provider: "greenhouse", boardToken: "gitlab" },
  { company: "Robinhood", provider: "greenhouse", boardToken: "robinhood" },
  { company: "MongoDB", provider: "greenhouse", boardToken: "mongodb" },
  { company: "Netflix", provider: "lever", boardToken: "netflix" },
  { company: "Block", provider: "greenhouse", boardToken: "block" },
  { company: "Brex", provider: "greenhouse", boardToken: "brex" },
  { company: "Instacart", provider: "greenhouse", boardToken: "instacart" },
  { company: "Asana", provider: "greenhouse", boardToken: "asana" },
  { company: "HubSpot", provider: "greenhouse", boardToken: "hubspot" },
  { company: "Twilio", provider: "greenhouse", boardToken: "twilio" },
  { company: "Scale AI", provider: "greenhouse", boardToken: "scaleai" },
];

/** Upsert curated job_sources rows (idempotent). */
export async function ensureJobSourcesCatalog() {
  if (!isSupabaseConfigured()) return;

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
}
