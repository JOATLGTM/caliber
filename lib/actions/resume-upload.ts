"use server";

import { revalidatePath } from "next/cache";
import {
  createSignedUrlForResume,
  markOnboardingResumeUploaded,
  uploadBaseResume,
  type UploadedResume,
} from "@/lib/db/resume-uploads";

export async function uploadBaseResumeAction(
  formData: FormData,
): Promise<{ ok: true; resume: UploadedResume } | { ok: false; error: string }> {
  try {
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return { ok: false, error: "No file received" };
    }

    const resume = await uploadBaseResume(file);
    await markOnboardingResumeUploaded();
    revalidatePath("/resumes");
    revalidatePath("/onboarding");
    revalidatePath("/profile");
    revalidatePath("/dashboard");
    return { ok: true, resume };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Failed to upload resume",
    };
  }
}

export async function getResumeDownloadUrlAction(
  resumeId: string,
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  try {
    const url = await createSignedUrlForResume(resumeId);
    return { ok: true, url };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Failed to create download link",
    };
  }
}
