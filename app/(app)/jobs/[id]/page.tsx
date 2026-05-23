import { notFound, redirect } from "next/navigation";
import { jobIdFromParam } from "@/lib/jobs/paths";
import { JobDetailView } from "@/components/caliber/job-detail-view";
import { isAiConfigured } from "@/lib/ai/provider";
import { computeMatch } from "@/lib/ai/scoring";
import {
  getCoverLetterForJob,
  getTailoredResumeForJob,
} from "@/lib/db/ai-artifacts";
import { getApplicationByJobId } from "@/lib/db/applications";
import { getJobForUser } from "@/lib/db/jobs";
import { getProfile } from "@/lib/db/profile";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import {
  COVER_LETTER_DRAFT,
  JOBS,
  RESUME_DIFF,
  type ResumeDiff,
} from "@/lib/mock-data";

const EMPTY_DIFF = (jobTitle: string, company: string): ResumeDiff => ({
  jobTitle,
  company,
  qualityScore: 0,
  breakdown: [],
  bullets: [],
});

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: rawId } = await params;
  const id = jobIdFromParam(rawId);

  if (!isSupabaseConfigured()) {
    const job = JOBS.find((j) => j.id === id);
    if (!job) notFound();
    return (
      <JobDetailView
        job={job}
        resumeDiff={RESUME_DIFF}
        coverLetterDraft={COVER_LETTER_DRAFT}
        aiEnabled={false}
      />
    );
  }

  let job;
  try {
    job = await getJobForUser(id);
  } catch {
    redirect("/login");
  }

  if (!job) notFound();

  const [profile, tailored, cover, application] = await Promise.all([
    getProfile(),
    getTailoredResumeForJob(id),
    getCoverLetterForJob(id),
    getApplicationByJobId(id),
  ]);

  let job2 = job;
  if (job.matchScore == null || job.whyMatch.length === 0) {
    const sig = computeMatch(profile, job);
    job2 = {
      ...job,
      matchScore: job.matchScore ?? sig.score,
      whyMatch: job.whyMatch.length > 0 ? job.whyMatch : sig.whyMatch,
    };
  }

  const resumeDiff: ResumeDiff =
    (tailored?.diff as ResumeDiff | null) ?? EMPTY_DIFF(job2.title, job2.company);

  const coverDraft = cover?.body ?? "";

  return (
    <JobDetailView
      job={job2}
      resumeDiff={resumeDiff}
      coverLetterDraft={coverDraft}
      aiEnabled={isAiConfigured()}
      applicationStatus={application?.status ?? null}
    />
  );
}
