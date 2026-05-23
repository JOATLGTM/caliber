"use server";

import { jobDetailPath } from "@/lib/jobs/paths";
import { listApplications } from "@/lib/db/applications";
import { buildVisibleJobList } from "@/lib/db/jobs";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { JOBS, APPLICATIONS } from "@/lib/mock-data";

export interface SearchEntity {
  kind: "job" | "application";
  id: string;
  title: string;
  subtitle: string;
  href: string;
}

/** Returns up to ~80 entities for the command palette. */
export async function listSearchableEntitiesAction(): Promise<SearchEntity[]> {
  if (!isSupabaseConfigured()) {
    return [
      ...JOBS.map((j) => ({
        kind: "job" as const,
        id: j.id,
        title: j.title,
        subtitle: `${j.company} · ${j.location}`,
        href: jobDetailPath(j.id),
      })),
      ...APPLICATIONS.map((a) => ({
        kind: "application" as const,
        id: a.id,
        title: a.title,
        subtitle: `${a.company} · ${a.status}`,
        href: `/applications`,
      })),
    ];
  }

  try {
    const [jobs, apps] = await Promise.all([
      buildVisibleJobList("date"),
      listApplications(),
    ]);

    return [
      ...jobs.slice(0, 60).map((j) => ({
        kind: "job" as const,
        id: j.id,
        title: j.title,
        subtitle: `${j.company} · ${j.location} · ${j.matchScore}% match`,
        href: jobDetailPath(j.id),
      })),
      ...apps.slice(0, 40).map((a) => ({
        kind: "application" as const,
        id: a.id,
        title: a.title,
        subtitle: `${a.company} · ${a.status}`,
        href: `/applications`,
      })),
    ];
  } catch {
    return [];
  }
}
