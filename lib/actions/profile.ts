"use server";

import { after } from "next/server";
import { revalidatePath } from "next/cache";
import { saveProfile } from "@/lib/db/profile";
import { recomputeMatchesForUser } from "@/lib/db/match-sync";
import type { UserProfile } from "@/lib/mock-data";

export async function saveProfileAction(
  profile: Omit<UserProfile, "email">,
): Promise<{ ok: boolean; error?: string }> {
  try {
    await saveProfile(profile);
    revalidatePath("/profile");
    after(async () => {
      try {
        await recomputeMatchesForUser();
        revalidatePath("/dashboard");
      } catch (e) {
        console.error("[saveProfileAction] match recompute failed", e);
      }
    });
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Failed to save profile",
    };
  }
}
