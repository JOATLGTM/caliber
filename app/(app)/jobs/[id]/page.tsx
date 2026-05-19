import { notFound } from "next/navigation";
import { JobDetailView } from "@/components/caliber/job-detail-view";
import { COVER_LETTER_DRAFT, JOBS, RESUME_DIFF } from "@/lib/mock-data";

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const job = JOBS.find((j) => j.id === id);
  if (!job) notFound();

  return (
    <JobDetailView
      job={job}
      resumeDiff={RESUME_DIFF}
      coverLetterDraft={COVER_LETTER_DRAFT}
    />
  );
}
