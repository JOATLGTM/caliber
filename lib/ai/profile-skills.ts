import { extractSkillsFromText } from "@/lib/jobs/ingest/skills";
import { normalizeSkill } from "./skill-overlap";

const MAX_SKILLS = 48;

/** Merge manually entered profile skills with skills extracted from resume text. */
export function mergeProfileSkills(
  profileSkills: string[],
  resumeText?: string | null,
): string[] {
  const seen = new Set(profileSkills.map(normalizeSkill));
  const merged = [...profileSkills];

  if (!resumeText?.trim()) return merged;

  const extracted = extractSkillsFromText(resumeText);
  for (const skill of [...extracted.skills, ...extracted.niceToHaves]) {
    const key = normalizeSkill(skill);
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(skill);
    if (merged.length >= MAX_SKILLS) break;
  }

  return merged;
}
