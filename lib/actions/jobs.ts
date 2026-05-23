"use server";

import { revalidatePath } from "next/cache";
import { jobDetailPath } from "@/lib/jobs/paths";
import {
  getApplicationByJobId,
  removeApplicationForJob,
  removeApplicationForJobIfSaved,
  upsertApplicationForJob,
} from "@/lib/db/applications";
import { getJobForUser, setJobDismissed, setJobSaved } from "@/lib/db/jobs";

export type SaveJobResult =
  | { ok: true; removedFromPipeline: boolean; pipelineKept: boolean }
  | { ok: false; error: string };

export async function saveJobAction(
  jobId: string,
  saved: boolean,
): Promise<SaveJobResult> {
  try {
    await setJobSaved(jobId, saved);

    let removedFromPipeline = false;
    let pipelineKept = false;

    if (saved) {
      const job = await getJobForUser(jobId);
      if (job) {
        await upsertApplicationForJob(job, "Saved");
      }
    } else {
      removedFromPipeline = await removeApplicationForJobIfSaved(jobId);
      const remaining = await getApplicationByJobId(jobId);
      pipelineKept = remaining != null;
    }

    revalidatePath("/dashboard");
    revalidatePath("/applications");
    revalidatePath(jobDetailPath(jobId));
    return { ok: true, removedFromPipeline, pipelineKept };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Failed to save job",
    };
  }
}

export async function removeFromPipelineAction(
  jobId: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    await removeApplicationForJob(jobId);
    await setJobSaved(jobId, false);

    revalidatePath("/dashboard");
    revalidatePath("/applications");
    revalidatePath(jobDetailPath(jobId));
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Failed to remove from pipeline",
    };
  }
}

export async function markJobAppliedAction(
  jobId: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const job = await getJobForUser(jobId);
    if (!job) {
      return { ok: false, error: "Job not found" };
    }

    await setJobSaved(jobId, true);
    await upsertApplicationForJob(job, "Applied");

    revalidatePath("/dashboard");
    revalidatePath("/applications");
    revalidatePath(jobDetailPath(jobId));
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Failed to mark as applied",
    };
  }
}

export async function dismissJobAction(
  jobId: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    await setJobDismissed(jobId, true);
    revalidatePath("/dashboard");
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Failed to dismiss job",
    };
  }
}
