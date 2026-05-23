import { ensureJobSourcesCatalog } from "@/lib/jobs/job-sources";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { deactivateLegacyMockJobs } from "./catalog";
import { ensureJobsCatalog, ensureUserSeedData } from "./seed";

/** Run once per authenticated app session — seeds catalog + demo user rows. */
export async function bootstrapUserData() {
  if (!isSupabaseConfigured()) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  try {
    await ensureJobSourcesCatalog();
    await deactivateLegacyMockJobs();
    await ensureJobsCatalog();
    await ensureUserSeedData(user.id);
  } catch (e) {
    console.error("[bootstrapUserData]", e);
  }
}
