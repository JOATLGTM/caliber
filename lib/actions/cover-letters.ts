"use server";

import { revalidatePath } from "next/cache";
import { deleteCoverLetter } from "@/lib/db/cover-letters";

export async function deleteCoverLetterAction(
  coverLetterId: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    await deleteCoverLetter(coverLetterId);
    revalidatePath("/cover-letters");
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Failed to delete cover letter",
    };
  }
}
