import type { CanonicalIngestJob } from "./types";
import { isJobPostingFresh } from "./config";
import { buildLeverDescription } from "./lever-description";
import {
  inferField,
  inferSeniority,
  inferWorkMode,
  parseSalaryFromText,
  stableJobId,
  toPostedDate,
} from "./infer";
import { extractSkillsFromText } from "./skills";

const BASE = "https://api.lever.co/v0/postings";

interface LeverPosting {
  id: string;
  text: string;
  hostedUrl: string;
  createdAt: number;
  workplaceType?: string;
  categories?: {
    location?: string;
    department?: string;
    team?: string;
    allLocations?: string[];
    commitment?: string;
  };
  descriptionPlain?: string;
  description?: string;
  openingPlain?: string;
  descriptionBody?: string;
  descriptionBodyPlain?: string;
  additional?: string;
  additionalPlain?: string;
  salaryRange?: { min?: number; max?: number; currency?: string };
  lists?: { text?: string; content?: string }[];
}

export async function fetchLeverJobs(
  site: string,
  company: string,
): Promise<CanonicalIngestJob[]> {
  const url = `${BASE}/${encodeURIComponent(site)}?mode=json`;
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    throw new Error(`Lever ${site}: HTTP ${res.status}`);
  }

  const postings = (await res.json()) as LeverPosting[];
  if (!Array.isArray(postings)) {
    throw new Error(`Lever ${site}: unexpected response`);
  }

  return postings
    .map((job) => {
    const location =
      job.categories?.location ??
      job.categories?.allLocations?.[0] ??
      "Remote";
    const description = buildLeverDescription(job);
    const department = job.categories?.department ?? "";
    const salaryText = job.salaryRange
      ? `$${job.salaryRange.min ?? 0}–$${job.salaryRange.max ?? 0}`
      : description.slice(0, 400);
    const { salary, salaryMin } = parseSalaryFromText(salaryText);
    const { skills, niceToHaves } = extractSkillsFromText(
      `${job.text} ${description}`,
    );

    const postedAt = toPostedDate(
      job.createdAt ? new Date(job.createdAt).toISOString() : null,
    );

    return {
      id: stableJobId("lever", job.id),
      source: "lever",
      externalId: job.id,
      applyUrl: job.hostedUrl,
      company,
      title: job.text,
      location,
      workMode: inferWorkMode(
        location,
        description,
        job.workplaceType ?? null,
      ),
      salary,
      salaryMin,
      seniority: inferSeniority(job.text, description),
      field: inferField(job.text, department, description),
      skills,
      niceToHaves,
      description,
      postedAt,
      rawPayload: job as unknown as Record<string, unknown>,
    } satisfies CanonicalIngestJob;
  })
    .filter((job) => isJobPostingFresh(job.postedAt));
}
