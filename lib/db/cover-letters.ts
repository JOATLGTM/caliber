import type { CoverLetter } from "@/lib/mock-data";
import { requireUser } from "./auth";

interface CoverLetterRow {
  id: string;
  company: string;
  job_title: string;
  body: string;
  created_at: string;
}

function rowToCoverLetter(row: CoverLetterRow): CoverLetter {
  return {
    id: row.id,
    company: row.company,
    jobTitle: row.job_title,
    createdAt: row.created_at.slice(0, 10),
    preview: row.body,
  };
}

export async function listCoverLetters(): Promise<CoverLetter[]> {
  const { supabase, user } = await requireUser();

  const { data, error } = await supabase
    .from("cover_letters")
    .select("id, company, job_title, body, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data as CoverLetterRow[]).map(rowToCoverLetter);
}

export async function deleteCoverLetter(coverLetterId: string): Promise<void> {
  const { supabase, user } = await requireUser();

  const { error } = await supabase
    .from("cover_letters")
    .delete()
    .eq("id", coverLetterId)
    .eq("user_id", user.id);

  if (error) throw error;
}
