#!/usr/bin/env npx tsx
/**
 * Score distribution for dashboard matching — run: npm run debug-match
 */
import ws from "ws";
import { computeMatch } from "../lib/ai/scoring";
import { mergeProfileSkills } from "../lib/ai/profile-skills";
import { inferProfileFields, jobRelevantToProfile, profileHasMatchingSignal } from "../lib/ai/field-match";
import { MIN_DISPLAY_MATCH_SCORE } from "../lib/ai/match-config";
import { postedAtCutoffDate } from "../lib/jobs/ingest/config";
import { rowToJob, type JobRow, type ProfileRow } from "../lib/db/mappers";
import { createAdminClient } from "../lib/supabase/admin";

(globalThis as unknown as { WebSocket: unknown }).WebSocket = ws;

const JOB_SELECT =
  "id, company, title, location, work_mode, salary, salary_min, posted_at, seniority, field, skills, nice_to_haves, description, match_score, why_match";

function formatFetchError(error: unknown): string {
  if (!error || typeof error !== "object") return String(error);

  const message = "message" in error ? String(error.message) : String(error);
  if (message.includes("<!DOCTYPE html>") || message.includes("522")) {
    return [
      "Supabase is unreachable (Cloudflare 522 — connection timed out).",
      "",
      "Common fixes:",
      "  1. Open https://supabase.com/dashboard — check if the project is Paused and click Restore",
      "  2. Wait 1–2 minutes after restore, then retry",
      "  3. Stop heavy jobs (ingest cron, debug scripts) if the DB is under load",
      "",
      "The dashboard will also fail until Supabase responds again.",
    ].join("\n");
  }

  if (message.includes("57014") || message.toLowerCase().includes("timeout")) {
    return [
      "Supabase query timed out (statement timeout).",
      "",
      "Try again in a minute, or run during idle time. Ingest + large selects can overload free-tier projects.",
    ].join("\n");
  }

  return message;
}

function histogram(scores: number[]): Record<string, number> {
  const buckets = ["0-39", "40-49", "50-59", "60-64", "65-74", "75-84", "85-100"];
  const out: Record<string, number> = Object.fromEntries(
    buckets.map((b) => [b, 0]),
  );
  for (const s of scores) {
    if (s < 40) out["0-39"]++;
    else if (s < 50) out["40-49"]++;
    else if (s < 60) out["50-59"]++;
    else if (s < 65) out["60-64"]++;
    else if (s < 75) out["65-74"]++;
    else if (s < 85) out["75-84"]++;
    else out["85-100"]++;
  }
  return out;
}

async function main() {
  const admin = createAdminClient();
  const cutoff = postedAtCutoffDate();

  const { data: jobs, error: jobsError } = await admin
    .from("jobs")
    .select(JOB_SELECT)
    .eq("is_active", true)
    .not("source", "is", null)
    .gte("posted_at", cutoff)
    .order("posted_at", { ascending: false })
    .limit(500);

  if (jobsError) throw new Error(formatFetchError(jobsError));

  const { data: profiles, error: profileError } = await admin
    .from("profiles")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(5);

  if (profileError) throw new Error(formatFetchError(profileError));

  console.log("\n=== Catalog ===");
  console.log(`Active ingested jobs (90d, limit 800): ${jobs?.length ?? 0}`);
  console.log(`Cutoff date: ${cutoff}`);
  console.log(`Display threshold: ${MIN_DISPLAY_MATCH_SCORE}%`);

  if (!profiles?.length) {
    console.log("\nNo profiles in DB — cannot score per-user.");
    return;
  }

  for (const row of profiles as ProfileRow[]) {
    const email = row.id.slice(0, 8) + "…";
    const profile = {
      name: row.full_name,
      email,
      phone: row.phone,
      location: row.location,
      targetRoles: row.target_roles,
      locations: row.preferred_locations,
      workModes: row.work_modes,
      salaryMin: row.salary_min,
      salaryTarget: row.salary_target,
      experienceLevel: row.experience_level as "Entry" | "Mid" | "Senior" | "Staff+",
      skills: row.skills,
    };

    const { data: resumeRow } = await admin
      .from("profiles")
      .select("resume_text")
      .eq("id", row.id)
      .maybeSingle();

    const resumeText = (resumeRow?.resume_text as string | null) ?? null;
    const effectiveSkills = mergeProfileSkills(profile.skills, resumeText);
    const fields = inferProfileFields({ ...profile, skills: effectiveSkills });
    const hasSignal = profileHasMatchingSignal(profile);

    const scores: {
      score: number;
      company: string;
      title: string;
      field: string;
    }[] = [];

    for (const jobRow of (jobs ?? []) as JobRow[]) {
      const job = rowToJob(jobRow, null);
      const sig = computeMatch(profile, job, { resumeText });
      scores.push({
        score: sig.score,
        company: job.company,
        title: job.title,
        field: job.field,
      });
    }

    const passing = scores.filter((s) => {
      const job = { title: s.title, field: s.field as import("../lib/mock-data").JobField };
      const relevant = jobRelevantToProfile(profile, job, effectiveSkills);
      return relevant && s.score >= MIN_DISPLAY_MATCH_SCORE;
    });
    const hist = histogram(scores.map((s) => s.score));
    const byCompany = groupCount(passing, "company");
    const zeroSalary = (jobs ?? []).filter(
      (j) => (j as JobRow).salary_min === 0,
    ).length;
    const engTitles = scores.filter((s) =>
      /\b(engineer|developer|software)\b/i.test(s.title),
    );
    const engPass = engTitles.filter(
      (s) => s.score >= MIN_DISPLAY_MATCH_SCORE,
    ).length;
    const nearMiss = scores
      .filter((s) => s.score >= 55 && s.score < MIN_DISPLAY_MATCH_SCORE)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);

    console.log(`\n=== Profile ${row.full_name || email} ===`);
    console.log(`Has matching signal: ${hasSignal}`);
    console.log(`Target roles: ${profile.targetRoles.join(", ") || "(none)"}`);
    console.log(`Skills (${profile.skills.length} manual, ${effectiveSkills.length} effective): ${effectiveSkills.slice(0, 8).join(", ")}${effectiveSkills.length > 8 ? "…" : ""}`);
    console.log(`Resume text: ${resumeText ? `${resumeText.length} chars` : "none"}`);
    console.log(`Inferred fields: ${fields.join(", ") || "(none)"}`);
    console.log(`Salary min: ${profile.salaryMin || "none"}`);
    console.log(`Work modes: ${JSON.stringify(profile.workModes)}`);
    console.log(`Passing ≥${MIN_DISPLAY_MATCH_SCORE}%: ${passing.length} / ${scores.length}`);
    console.log(`Jobs with salary_min=0: ${zeroSalary} / ${scores.length}`);
    console.log(
      `Engineer/developer titles: ${engTitles.length}, passing: ${engPass}`,
    );
    console.log("Score histogram:", hist);
    console.log("Passing by company:", byCompany);
    if (nearMiss.length) {
      console.log("Near misses (55–64%):");
      for (const m of nearMiss) {
        console.log(`  ${m.score}% — ${m.company}: ${m.title}`);
      }
    }
    const topPass = passing.sort((a, b) => b.score - a.score).slice(0, 5);
    if (topPass.length) {
      console.log("Top matches:");
      for (const m of topPass) {
        console.log(`  ${m.score}% — ${m.company}: ${m.title}`);
      }
    }
  }
}

function groupCount<T extends Record<string, unknown>>(
  rows: T[],
  key: keyof T,
): Record<string, number> {
  const out: Record<string, number> = {};
  for (const r of rows) {
    const k = String(r[key] ?? "unknown");
    out[k] = (out[k] ?? 0) + 1;
  }
  return out;
}

main().catch((e) => {
  console.error(formatFetchError(e));
  process.exit(1);
});
