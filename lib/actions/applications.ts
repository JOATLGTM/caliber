"use server";

import { revalidatePath } from "next/cache";
import { updateApplicationStatus } from "@/lib/db/applications";
import type { ApplicationStatus } from "@/lib/mock-data";

export async function updateApplicationStatusAction(
  applicationId: string,
  status: ApplicationStatus,
): Promise<{ ok: boolean; error?: string }> {
  try {
    await updateApplicationStatus(applicationId, status);
    revalidatePath("/applications");
    revalidatePath("/dashboard");
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Failed to update application",
    };
  }
}
