"use server";

import { revalidatePath } from "next/cache";
import { deleteResume } from "@/lib/db/resumes";

export async function deleteResumeAction(
  resumeId: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    await deleteResume(resumeId);
    revalidatePath("/resumes");
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Failed to delete resume",
    };
  }
}
