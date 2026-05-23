import type { Application, ApplicationStatus, Job } from "@/lib/mock-data";
import { formatJobSalaryDisplay } from "@/lib/jobs/salary-display";
import { requireUser } from "./auth";
import { rowToApplication, type ApplicationRow } from "./mappers";

const APPLICATION_SELECT =
  "id, job_id, company, title, status, outcome, match_score, applied_at, salary";

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function jobSalaryLabel(job: Pick<Job, "salary" | "salaryMin">): string {
  return formatJobSalaryDisplay(job.salary, job.salaryMin).text;
}

export async function listApplications(): Promise<Application[]> {
  const { supabase, user } = await requireUser();

  const { data, error } = await supabase
    .from("applications")
    .select(APPLICATION_SELECT)
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (error) throw error;

  return (data as ApplicationRow[]).map(rowToApplication);
}

export async function getApplicationByJobId(
  jobId: string,
): Promise<Application | null> {
  const { supabase, user } = await requireUser();

  const { data, error } = await supabase
    .from("applications")
    .select(APPLICATION_SELECT)
    .eq("user_id", user.id)
    .eq("job_id", jobId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return rowToApplication(data as ApplicationRow);
}

/** Create or update a kanban row tied to a catalog job. */
export async function upsertApplicationForJob(
  job: Pick<Job, "id" | "company" | "title" | "matchScore" | "salary" | "salaryMin">,
  targetStatus: Extract<ApplicationStatus, "Saved" | "Applied">,
  options?: { appliedAt?: string },
): Promise<Application> {
  const { supabase, user } = await requireUser();
  const existing = await getApplicationByJobId(job.id);
  const salary = jobSalaryLabel(job);
  const appliedAt =
    targetStatus === "Applied" ? (options?.appliedAt ?? todayIsoDate()) : null;

  if (existing) {
    const keepAdvancedStatus =
      existing.status !== "Saved" && targetStatus === "Saved";
    const status = keepAdvancedStatus ? existing.status : targetStatus;
    const nextAppliedAt =
      targetStatus === "Applied"
        ? existing.appliedAt !== "—"
          ? existing.appliedAt
          : appliedAt!
        : existing.appliedAt !== "—"
          ? existing.appliedAt
          : null;

    const { data, error } = await supabase
      .from("applications")
      .update({
        company: job.company,
        title: job.title,
        status,
        match_score: job.matchScore,
        salary,
        applied_at: nextAppliedAt,
      })
      .eq("id", existing.id)
      .eq("user_id", user.id)
      .select(APPLICATION_SELECT)
      .single();

    if (error) throw error;
    return rowToApplication(data as ApplicationRow);
  }

  const { data, error } = await supabase
    .from("applications")
    .insert({
      user_id: user.id,
      job_id: job.id,
      company: job.company,
      title: job.title,
      status: targetStatus,
      match_score: job.matchScore,
      salary,
      applied_at: appliedAt,
    })
    .select(APPLICATION_SELECT)
    .single();

  if (error) throw error;
  return rowToApplication(data as ApplicationRow);
}

/** Remove kanban row when user unsaves — only while still in Saved column. */
export async function removeApplicationForJobIfSaved(
  jobId: string,
): Promise<boolean> {
  const { supabase, user } = await requireUser();

  const { data, error } = await supabase
    .from("applications")
    .delete()
    .eq("user_id", user.id)
    .eq("job_id", jobId)
    .eq("status", "Saved")
    .select("id");

  if (error) throw error;
  return (data?.length ?? 0) > 0;
}

/** Explicitly remove a job from the pipeline (any column). */
export async function removeApplicationForJob(jobId: string): Promise<void> {
  const { supabase, user } = await requireUser();

  const { error } = await supabase
    .from("applications")
    .delete()
    .eq("user_id", user.id)
    .eq("job_id", jobId);

  if (error) throw error;
}

export async function updateApplicationStatus(
  applicationId: string,
  status: ApplicationStatus,
): Promise<void> {
  const { supabase, user } = await requireUser();

  const patch: {
    status: ApplicationStatus;
    applied_at?: string;
  } = { status };

  if (status === "Applied") {
    const { data: row } = await supabase
      .from("applications")
      .select("applied_at")
      .eq("id", applicationId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!row?.applied_at) {
      patch.applied_at = todayIsoDate();
    }
  }

  const { error } = await supabase
    .from("applications")
    .update(patch)
    .eq("id", applicationId)
    .eq("user_id", user.id);

  if (error) throw error;
}
