"use server";

import { revalidatePath } from "next/cache";
import { saveProfile } from "@/lib/db/profile";
import type { UserProfile } from "@/lib/mock-data";

export async function saveProfileAction(
  profile: Omit<UserProfile, "email">,
): Promise<{ ok: boolean; error?: string }> {
  try {
    await saveProfile(profile);
    revalidatePath("/profile");
    revalidatePath("/dashboard");
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Failed to save profile",
    };
  }
}
