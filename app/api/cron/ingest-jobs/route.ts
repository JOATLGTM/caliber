import { NextResponse } from "next/server";
import { runJobIngestion } from "@/lib/jobs/ingest/run";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const runtime = "nodejs";
export const maxDuration = 300;

function authorizeCron(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret || secret === "your-cron-secret") return false;

  const auth = request.headers.get("authorization");
  if (auth === `Bearer ${secret}`) return true;

  const header = request.headers.get("x-cron-secret");
  return header === secret;
}

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase not configured" },
      { status: 500 },
    );
  }

  if (!authorizeCron(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runJobIngestion();
    return NextResponse.json({
      ok: true,
      ...result,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Ingest failed";
    console.error("[ingest-jobs]", e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/** Allow GET for manual browser/curl checks in dev (same auth). */
export async function GET(request: Request) {
  return POST(request);
}
