#!/usr/bin/env npx tsx
/**
 * Inspect ATS API responses vs Caliber DB — run: npm run debug-jobs
 * Writes summary to stdout and optional JSON snapshot under scripts/output/
 */
import fs from "node:fs";
import path from "node:path";
import ws from "ws";
import { CURATED_JOB_SOURCES } from "../lib/jobs/job-sources";
import { MAX_JOB_AGE_DAYS, postedAtCutoffDate } from "../lib/jobs/ingest/config";
import { createAdminClient } from "../lib/supabase/admin";

(globalThis as unknown as { WebSocket: unknown }).WebSocket = ws;

const GH_BASE = "https://boards-api.greenhouse.io/v1/boards";
const LV_BASE = "https://api.lever.co/v0/postings";
const AB_BASE = "https://api.ashbyhq.com/posting-api/job-board";

function daysAgo(iso: string | number | null | undefined): number | null {
  if (iso == null) return null;
  const t = typeof iso === "number" ? iso : new Date(iso).getTime();
  if (Number.isNaN(t)) return null;
  return Math.round((Date.now() - t) / 86_400_000);
}

function bucket(days: number | null): string {
  if (days == null) return "unknown";
  if (days <= 7) return "0-7d";
  if (days <= 14) return "8-14d";
  if (days <= 30) return "15-30d";
  if (days <= 90) return "31-90d";
  return "90d+";
}

function distribution(dates: (number | null)[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const d of dates) {
    const b = bucket(d);
    out[b] = (out[b] ?? 0) + 1;
  }
  return out;
}

async function fetchGreenhouse(token: string) {
  const res = await fetch(`${GH_BASE}/${token}/jobs?content=true`);
  const data = await res.json();
  const jobs = data.jobs ?? [];
  return jobs.map((j: Record<string, unknown>) => ({
    id: j.id,
    title: j.title,
    updated_at: j.updated_at,
    first_published: j.first_published,
    content_len: String(j.content ?? "").length,
    days_updated: daysAgo(j.updated_at as string),
    days_published: daysAgo(j.first_published as string),
  }));
}

async function fetchLever(site: string) {
  const res = await fetch(`${LV_BASE}/${site}?mode=json`);
  const jobs = await res.json();
  if (!Array.isArray(jobs)) return [];
  return jobs.map((j: Record<string, unknown>) => ({
    id: j.id,
    title: j.text,
    createdAt: j.createdAt,
    descriptionPlain_len: String(j.descriptionPlain ?? "").length,
    descriptionBodyPlain_len: String(j.descriptionBodyPlain ?? "").length,
    lists_count: Array.isArray(j.lists) ? j.lists.length : 0,
    days_created: daysAgo(j.createdAt as number),
  }));
}

async function fetchAshby(board: string) {
  const res = await fetch(`${AB_BASE}/${board}?includeCompensation=true`);
  const data = await res.json();
  const jobs = data.jobs ?? [];
  return jobs.map((j: Record<string, unknown>) => ({
    id: j.id,
    title: j.title,
    publishedAt: j.publishedAt,
    descriptionPlain_len: String(j.descriptionPlain ?? "").length,
    days_published: daysAgo(j.publishedAt as string),
  }));
}

async function fetchDbStats() {
  const admin = createAdminClient();

  async function count(
    filters: (
      q: ReturnType<ReturnType<typeof admin.from>["select"]>,
    ) => ReturnType<ReturnType<typeof admin.from>["select"]>,
  ) {
    const q = filters(
      admin.from("jobs").select("id", { count: "exact", head: true }),
    );
    const { count, error } = await q;
    if (error) throw error;
    return count ?? 0;
  }

  const [total, active, ghActive, lvActive, abActive, swActive, swRecent] =
    await Promise.all([
      count((q) => q.not("source", "is", null)),
      count((q) => q.not("source", "is", null).eq("is_active", true)),
      count((q) => q.eq("source", "greenhouse").eq("is_active", true)),
      count((q) => q.eq("source", "lever").eq("is_active", true)),
      count((q) => q.eq("source", "ashby").eq("is_active", true)),
      count((q) => q.eq("field", "software").eq("is_active", true)),
      count((q) =>
        q
          .eq("field", "software")
          .eq("is_active", true)
          .gte("posted_at", postedAtCutoffDate()),
      ),
    ]);

  const cutoff7 = new Date();
  cutoff7.setDate(cutoff7.getDate() - 7);
  const cutoff7Str = cutoff7.toISOString().slice(0, 10);
  const swLast7 = await count((q) =>
    q
      .eq("field", "software")
      .eq("is_active", true)
      .gte("posted_at", cutoff7Str),
  );

  const { data: newest, error: newestError } = await admin
    .from("jobs")
    .select("id, source, company, field, posted_at")
    .not("source", "is", null)
    .eq("is_active", true)
    .order("posted_at", { ascending: false })
    .limit(10);

  if (newestError) throw newestError;

  const { data: fieldRows, error: fieldError } = await admin
    .from("jobs")
    .select("field")
    .not("source", "is", null)
    .eq("is_active", true)
    .limit(5000);
  if (fieldError) throw fieldError;

  const byField = groupCount((fieldRows ?? []) as Record<string, unknown>[], "field");

  const { data: postedRows, error: postedError } = await admin
    .from("jobs")
    .select("posted_at")
    .not("source", "is", null)
    .eq("is_active", true)
    .limit(5000);
  if (postedError) throw postedError;

  return {
    total,
    active,
    inactive: total - active,
    bySource: {
      greenhouse: ghActive,
      lever: lvActive,
      ashby: abActive,
    },
    byField,
    softwareActive: swActive,
    softwarePostedLast7Days: swLast7,
    softwarePostedWithinMaxAge: swRecent,
    postedDistribution: distribution(
      (postedRows ?? []).map((j) => daysAgo(j.posted_at as string)),
    ),
    newest: (newest ?? []).map((j) => ({
      posted_at: j.posted_at,
      days: daysAgo(j.posted_at as string),
      source: j.source,
      field: j.field,
      company: j.company,
      id: j.id,
    })),
  };
}

function groupCount(rows: Record<string, unknown>[], key: string) {
  const out: Record<string, number> = {};
  for (const r of rows) {
    const v = String(r[key] ?? "null");
    out[v] = (out[v] ?? 0) + 1;
  }
  return out;
}

async function main() {
  const report: Record<string, unknown> = {
    generatedAt: new Date().toISOString(),
    maxJobAgeDays: MAX_JOB_AGE_DAYS,
    sources: [] as unknown[],
  };

  console.log("Caliber job catalog debug\n");
  console.log(`MAX_JOB_AGE_DAYS = ${MAX_JOB_AGE_DAYS}\n`);

  for (const src of CURATED_JOB_SOURCES) {
    console.log(`--- ${src.company} (${src.provider} / ${src.boardToken}) ---`);
    let rows: Record<string, unknown>[] = [];
    try {
      if (src.provider === "greenhouse") rows = await fetchGreenhouse(src.boardToken);
      else if (src.provider === "lever") rows = await fetchLever(src.boardToken);
      else rows = await fetchAshby(src.boardToken);

      const dateKey =
        src.provider === "greenhouse"
          ? "days_published"
          : src.provider === "lever"
            ? "days_created"
            : "days_published";
      const days = rows.map((r) => r[dateKey] as number | null);
      const dist = distribution(days);
      const within90 = days.filter((d) => d != null && d <= MAX_JOB_AGE_DAYS).length;

      console.log(`  API count: ${rows.length}`);
      console.log(`  Within ${MAX_JOB_AGE_DAYS}d (ingest keeps): ${within90}`);
      console.log(`  Age buckets:`, dist);
      const sorted = [...rows].sort(
        (a, b) => (a[dateKey] as number) - (b[dateKey] as number),
      );
      const newest = sorted[0];
      if (newest) {
        console.log(
          `  Newest: ${String(newest.title).slice(0, 50)} (${newest[dateKey]}d ago)`,
        );
      }
      if (src.provider === "lever") {
        const emptyDesc = rows.filter(
          (r) =>
            (r.descriptionPlain_len as number) === 0 &&
            (r.descriptionBodyPlain_len as number) === 0 &&
            (r.lists_count as number) > 0,
        ).length;
        console.log(`  Lever list-only content (needs lists merge): ${emptyDesc}`);
      }

      (report.sources as unknown[]).push({
        ...src,
        apiCount: rows.length,
        withinMaxAge: within90,
        ageBuckets: dist,
        sampleNewest: newest,
        sampleOldest: sorted[sorted.length - 1],
      });
    } catch (e) {
      console.log(`  ERROR: ${e instanceof Error ? e.message : e}`);
    }
    console.log("");
  }

  console.log("--- Supabase jobs table ---");
  const db = await fetchDbStats();
  console.log(JSON.stringify(db, null, 2));
  report.database = db;

  const outDir = path.join(process.cwd(), "scripts", "output");
  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(
    outDir,
    `job-catalog-debug-${new Date().toISOString().slice(0, 10)}.json`,
  );
  fs.writeFileSync(outFile, JSON.stringify(report, null, 2));
  console.log(`\nFull snapshot: ${outFile}`);
  console.log("\nSee caliber-2/docs/ATS-API-SCHEMAS.md for field mapping reference.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
