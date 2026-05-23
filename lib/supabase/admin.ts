import { createClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "./env";

/** Server-only client with service role — bypasses RLS for seeding. */
export function createAdminClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey || serviceKey === "your-service-role-key") {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is required for seeding. Set it in .env.local.",
    );
  }

  const { url } = getSupabaseEnv();
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
