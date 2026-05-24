import type { CanonicalIngestJob } from "./types";
import { isJobPostingFresh } from "./config";
import { htmlToPlainText } from "./text";
import {
  inferField,
  inferSeniority,
  inferWorkMode,
  parseSalaryFromText,
  stableJobId,
  toPostedDate,
} from "./infer";
import { extractSkillsFromText } from "./skills";

const BASE = "https://boards-api.greenhouse.io/v1/boards";

function parseGreenhouseComp(
  value: unknown,
  descriptionFallback: string,
): { salary: string; salaryMin: number } {
  if (value && typeof value === "object") {
    const v = value as {
      min_value?: string | number;
      max_value?: string | number;
      unit?: string;
    };
    const minRaw = Number(v.min_value);
    const maxRaw = Number(v.max_value);
    if (Number.isFinite(minRaw) && minRaw > 0) {
      const low = Math.round(minRaw);
      const high = Number.isFinite(maxRaw) && maxRaw > 0 ? Math.round(maxRaw) : low;
      const salaryMin = Math.min(low, high);
      const salaryMax = Math.max(low, high);
      const unit = v.unit ?? "USD";
      const salary =
        salaryMax > salaryMin
          ? `${unit} ${salaryMin.toLocaleString()}–${salaryMax.toLocaleString()}`
          : `${unit} ${salaryMin.toLocaleString()}`;
      return { salary, salaryMin };
    }
  }

  const text = greenhouseCompText(value);
  return parseSalaryFromText(text || descriptionFallback.slice(0, 500));
}

function greenhouseCompText(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  if (value && typeof value === "object") {
    const v = value as {
      min_value?: string | number;
      max_value?: string | number;
      unit?: string;
    };
    const unit = v.unit ?? "USD";
    const min = v.min_value != null ? String(v.min_value) : "";
    const max = v.max_value != null ? String(v.max_value) : "";
    if (min && max && min !== max) return `${unit} ${min}–${max}`;
    if (min) return `${unit} ${min}`;
    if (max) return `${unit} ${max}`;
  }
  return "";
}

interface GreenhouseJob {
  id: number;
  title: string;
  absolute_url: string;
  updated_at: string;
  first_published?: string;
  company_name?: string;
  location?: { name?: string };
  content?: string;
  departments?: { name?: string }[];
  metadata?: { name?: string; value?: string }[] | null;
}

interface GreenhouseResponse {
  jobs: GreenhouseJob[];
}

export async function fetchGreenhouseJobs(
  boardToken: string,
  company: string,
): Promise<CanonicalIngestJob[]> {
  const url = `${BASE}/${encodeURIComponent(boardToken)}/jobs?content=true`;
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    throw new Error(`Greenhouse ${boardToken}: HTTP ${res.status}`);
  }

  const data = (await res.json()) as GreenhouseResponse;
  const jobs = data.jobs ?? [];

  return jobs
    .map((job) => {
    const location = job.location?.name ?? "Remote";
    const description = htmlToPlainText(job.content ?? "");
    const department =
      job.departments?.map((d) => d.name).filter(Boolean).join(", ") ?? "";
    const metaComp = job.metadata?.find((m) =>
      /salary|compensation/i.test(m.name ?? ""),
    )?.value;
    const { salary, salaryMin } = parseGreenhouseComp(
      metaComp,
      description,
    );
    const { skills, niceToHaves } = extractSkillsFromText(
      `${job.title} ${description}`,
    );

    const externalId = String(job.id);

    return {
      id: stableJobId("greenhouse", externalId),
      source: "greenhouse",
      externalId,
      applyUrl: job.absolute_url,
      company: job.company_name || company,
      title: job.title,
      location,
      workMode: inferWorkMode(location, description),
      salary,
      salaryMin,
      seniority: inferSeniority(job.title, description),
      field: inferField(job.title, department, description),
      skills,
      niceToHaves,
      description,
      postedAt: toPostedDate(job.first_published ?? job.updated_at),
      rawPayload: job as unknown as Record<string, unknown>,
    } satisfies CanonicalIngestJob;
  })
    .filter((job) => isJobPostingFresh(job.postedAt));
}
