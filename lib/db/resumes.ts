import type { Resume } from "@/lib/mock-data";
import { requireUser } from "./auth";

interface ResumeRow {
  id: string;
  title: string;
  is_base: boolean;
  job_title: string | null;
  company: string | null;
  match_score_at_time: number | null;
  updated_at: string;
}

function rowToResume(row: ResumeRow): Resume {
  return {
    id: row.id,
    title: row.title,
    isBase: row.is_base,
    jobTitle: row.job_title ?? undefined,
    company: row.company ?? undefined,
    matchScoreAtTime: row.match_score_at_time ?? undefined,
    updatedAt: row.updated_at.slice(0, 10),
  };
}

export async function listResumes(): Promise<Resume[]> {
  const { supabase, user } = await requireUser();

  const { data, error } = await supabase
    .from("resumes")
    .select("id, title, is_base, job_title, company, match_score_at_time, updated_at")
    .eq("user_id", user.id)
    .order("is_base", { ascending: false })
    .order("updated_at", { ascending: false });

  if (error) throw error;

  return (data as ResumeRow[]).map(rowToResume);
}

export async function deleteResume(resumeId: string): Promise<void> {
  const { supabase, user } = await requireUser();

  const { error } = await supabase
    .from("resumes")
    .delete()
    .eq("id", resumeId)
    .eq("user_id", user.id)
    .eq("is_base", false);

  if (error) throw error;
}
