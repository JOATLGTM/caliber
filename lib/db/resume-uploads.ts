import { requireUser } from "./auth";
import { mergeProfileSkills } from "@/lib/ai/profile-skills";
import { extractTextFromResume } from "@/lib/resume/extract-text";

const BUCKET = "resumes";
const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED_MIME = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

export interface UploadedResume {
  id: string;
  title: string;
  storagePath: string;
  originalFilename: string;
  mimeType: string;
  sizeBytes: number;
  updatedAt: string;
}

function safeFilename(name: string): string {
  return name.replace(/[^\w.\-]+/g, "_").slice(0, 80) || "resume";
}

function titleFromFilename(name: string): string {
  const base = name.replace(/\.(pdf|docx)$/i, "");
  return base.replace(/[_-]+/g, " ").trim() || "Resume";
}

/**
 * Upload a resume file as the user's new base resume.
 * - Replaces any existing base resume (DB + storage).
 * - Uploads to `<userId>/base/<timestamp>-<filename>` so RLS can authorize.
 */
export async function uploadBaseResume(file: File): Promise<UploadedResume> {
  if (file.size === 0) throw new Error("File is empty");
  if (file.size > MAX_BYTES) throw new Error("File exceeds 10 MB");
  if (file.type && !ALLOWED_MIME.has(file.type)) {
    throw new Error("Only PDF or DOCX is supported");
  }

  const { supabase, user } = await requireUser();

  const filename = safeFilename(file.name);
  const path = `${user.id}/base/${Date.now()}-${filename}`;

  // Read into buffer so we can pass a Node-friendly upload body.
  const arrayBuffer = await file.arrayBuffer();
  const body = new Uint8Array(arrayBuffer);

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, body, {
      contentType: file.type || "application/octet-stream",
      upsert: true,
    });

  if (uploadError) throw uploadError;

  // Remove old base resume rows + their storage objects.
  const { data: oldBases } = await supabase
    .from("resumes")
    .select("id, storage_path")
    .eq("user_id", user.id)
    .eq("is_base", true);

  if (oldBases && oldBases.length > 0) {
    const oldPaths = oldBases
      .map((r) => r.storage_path as string | null)
      .filter((p): p is string => Boolean(p) && p !== path);

    if (oldPaths.length > 0) {
      await supabase.storage.from(BUCKET).remove(oldPaths);
    }
    await supabase
      .from("resumes")
      .delete()
      .eq("user_id", user.id)
      .eq("is_base", true);
  }

  const title = `Base Resume — ${titleFromFilename(file.name)}`;

  const { data, error } = await supabase
    .from("resumes")
    .insert({
      user_id: user.id,
      title,
      is_base: true,
      storage_path: path,
      original_filename: file.name,
      mime_type: file.type || "application/octet-stream",
      size_bytes: file.size,
    })
    .select(
      "id, title, storage_path, original_filename, mime_type, size_bytes, updated_at",
    )
    .single();

  if (error) throw error;

  await persistResumeParse(user.id, supabase, file);

  return {
    id: data.id as string,
    title: data.title as string,
    storagePath: data.storage_path as string,
    originalFilename: (data.original_filename as string) ?? file.name,
    mimeType: (data.mime_type as string) ?? file.type,
    sizeBytes: (data.size_bytes as number) ?? file.size,
    updatedAt: data.updated_at as string,
  };
}

async function persistResumeParse(
  userId: string,
  supabase: Awaited<ReturnType<typeof requireUser>>["supabase"],
  file: File,
): Promise<void> {
  const text = await extractTextFromResume(file);
  if (!text) return;

  const { data: profile } = await supabase
    .from("profiles")
    .select("skills")
    .eq("id", userId)
    .maybeSingle();

  const existingSkills = (profile?.skills as string[] | null) ?? [];
  const mergedSkills = mergeProfileSkills(existingSkills, text);

  const { error } = await supabase
    .from("profiles")
    .update({
      resume_text: text,
      skills: mergedSkills,
    })
    .eq("id", userId);

  if (error) throw error;
}

export async function createSignedUrlForResume(
  resumeId: string,
): Promise<string> {
  const { supabase, user } = await requireUser();

  const { data: resume, error } = await supabase
    .from("resumes")
    .select("storage_path, original_filename")
    .eq("id", resumeId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) throw error;
  if (!resume?.storage_path) throw new Error("Resume has no file");

  const { data, error: signError } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(resume.storage_path as string, 300, {
      download: (resume.original_filename as string) ?? undefined,
    });

  if (signError) throw signError;
  if (!data?.signedUrl) throw new Error("Failed to sign URL");

  return data.signedUrl;
}

export async function markOnboardingResumeUploaded(): Promise<void> {
  const { supabase, user } = await requireUser();
  const now = new Date().toISOString();

  const { error } = await supabase.from("onboarding_state").upsert(
    {
      user_id: user.id,
      step: 2,
      resume_uploaded_at: now,
      updated_at: now,
    },
    { onConflict: "user_id" },
  );
  if (error) throw error;
}
