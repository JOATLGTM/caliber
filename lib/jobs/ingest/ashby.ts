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

const BASE = "https://api.ashbyhq.com/posting-api/job-board";

interface AshbyJob {
  id: string;
  title: string;
  location: string;
  department?: string;
  team?: string;
  employmentType?: string;
  workplaceType?: string;
  isRemote?: boolean;
  publishedAt?: string;
  jobUrl?: string;
  applyUrl?: string;
  descriptionPlain?: string;
  descriptionHtml?: string;
  compensation?: {
    compensationTierSummary?: string;
    summary?: string;
  };
}

interface AshbyResponse {
  jobs: AshbyJob[];
}

export async function fetchAshbyJobs(
  jobBoardName: string,
  company: string,
): Promise<CanonicalIngestJob[]> {
  const url = `${BASE}/${encodeURIComponent(jobBoardName)}?includeCompensation=true`;
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    throw new Error(`Ashby ${jobBoardName}: HTTP ${res.status}`);
  }

  const data = (await res.json()) as AshbyResponse;
  const jobs = (data.jobs ?? []).filter((j) => j.title);

  return jobs
    .map((job) => {
    const location = job.location || (job.isRemote ? "Remote" : "—");
    const description =
      job.descriptionPlain ??
      htmlToPlainText(job.descriptionHtml ?? "");
    const department = [job.department, job.team].filter(Boolean).join(" · ");
    const comp =
      job.compensation?.compensationTierSummary ??
      job.compensation?.summary ??
      "";
    const { salary, salaryMin } = parseSalaryFromText(comp || description.slice(0, 500));
    const { skills, niceToHaves } = extractSkillsFromText(
      `${job.title} ${description}`,
    );
    const workplace = job.isRemote
      ? "remote"
      : (job.workplaceType ?? "");

    return {
      id: stableJobId("ashby", job.id),
      source: "ashby",
      externalId: job.id,
      applyUrl: job.applyUrl ?? job.jobUrl ?? "",
      company,
      title: job.title,
      location,
      workMode: inferWorkMode(location, description, workplace),
      salary,
      salaryMin,
      seniority: inferSeniority(job.title, description),
      field: inferField(job.title, department, description),
      skills,
      niceToHaves,
      description,
      postedAt: toPostedDate(job.publishedAt),
      rawPayload: job as unknown as Record<string, unknown>,
    } satisfies CanonicalIngestJob;
  })
    .filter((job) => isJobPostingFresh(job.postedAt));
}
