import type { UserProfile } from "@/lib/mock-data";
import { requireUser } from "./auth";
import {
  profileToRow,
  rowToProfile,
  type ProfileRow,
} from "./mappers";

function emptyProfile(
  email: string,
  name: string,
): UserProfile {
  return {
    name,
    email,
    phone: "",
    location: "",
    targetRoles: [],
    locations: [],
    workModes: { remote: false, hybrid: false, onsite: false },
    salaryMin: 0,
    salaryTarget: 0,
    experienceLevel: "Mid",
    skills: [],
  };
}

export async function getProfile(): Promise<UserProfile> {
  const { supabase, user } = await requireUser();

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (error) throw error;

  const email = user.email ?? "";
  const metaName =
    (user.user_metadata?.full_name as string | undefined) ??
    (user.user_metadata?.name as string | undefined) ??
    "";

  if (!data) {
    return emptyProfile(email, metaName);
  }

  const profile = rowToProfile(data as ProfileRow, email);
  // If the trigger row exists but full_name is blank, fall back to the auth
  // metadata name so the profile page shows the user's real name.
  if (!profile.name && metaName) {
    profile.name = metaName;
  }
  return profile;
}

/** Plain-text resume stored on the profile (extracted on PDF upload). */
export async function getResumeText(): Promise<string | undefined> {
  const { supabase, user } = await requireUser();

  const { data, error } = await supabase
    .from("profiles")
    .select("resume_text")
    .eq("id", user.id)
    .maybeSingle();

  if (error) throw error;
  const text = data?.resume_text as string | null | undefined;
  return text?.trim() ? text : undefined;
}

export async function saveProfile(
  profile: Omit<UserProfile, "email">,
): Promise<UserProfile> {
  const { supabase, user } = await requireUser();
  const row = profileToRow(user.id, profile);

  const { data, error } = await supabase
    .from("profiles")
    .upsert(row, { onConflict: "id" })
    .select("*")
    .single();

  if (error) throw error;

  return rowToProfile(data as ProfileRow, user.email ?? "");
}
