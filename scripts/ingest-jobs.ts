/**
 * Local job ingest — run with: npm run ingest-jobs
 * Requires .env.local with Supabase service role + SEED_DEMO_DATA=false for prod-like catalog.
 */
import ws from "ws";
import { runJobIngestion } from "../lib/jobs/ingest/run";

// Supabase realtime client expects WebSocket in Node < 22.
(globalThis as unknown as { WebSocket: unknown }).WebSocket = ws;

async function main() {
  console.log("Starting ATS job ingest…");
  const result = await runJobIngestion();
  console.log(JSON.stringify(result, null, 2));
  if (result.errors.length > 0) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
