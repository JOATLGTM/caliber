import type { JobField, UserProfile } from "@/lib/mock-data";
import { TECH_SKILL_HINTS } from "./match-config";

const ALL_FIELDS: JobField[] = [
  "software",
  "design",
  "pm",
  "marketing",
  "healthcare",
  "finance",
  "cs",
];

const FIELD_PATTERNS: { field: JobField; re: RegExp }[] = [
  {
    field: "software",
    re: /\b(engineer|developer|software|backend|frontend|full[\s-]?stack|sre|devops|platform|infra(structure)?|architect)\b/i,
  },
  {
    field: "design",
    re: /\b(designer|design|ux|ui\/ux|product design|visual design|creative)\b/i,
  },
  {
    field: "pm",
    re: /\b(product manager|product management|\bpm\b|product owner)\b/i,
  },
  {
    field: "marketing",
    re: /\b(marketing|growth|brand|content|seo|demand gen)\b/i,
  },
  {
    field: "healthcare",
    re: /\b(nurse|clinical|physician|healthcare|medical|pharmacist)\b/i,
  },
  {
    field: "finance",
    re: /\b(finance|accounting|fp&a|investment|banking|analyst)\b/i,
  },
  {
    field: "cs",
    re: /\b(customer success|support engineer|account executive|sales|solutions consultant)\b/i,
  },
];

function norm(s: string) {
  return s.toLowerCase().trim();
}

/** Normalize common role phrasing before token overlap. */
function normalizeRolePhrase(s: string): string {
  return norm(s)
    .replace(/front[\s-]?end/g, "frontend")
    .replace(/full[\s-]?stack/g, "fullstack")
    .replace(/back[\s-]?end/g, "backend")
    .replace(/software[\s-]?engineer/g, "software engineer")
    .replace(/\bswe\b/g, "software engineer")
    .replace(/\bsde\b/g, "software engineer");
}

function tokenize(s: string): string[] {
  return normalizeRolePhrase(s)
    .split(/[^a-z0-9+#]+/)
    .filter((t) => t.length > 2);
}

const ENGINEERING_ROLE =
  /\b(engineer|developer|programmer|software engineer|swe|sde)\b/i;

/** Infer which job fields the user is targeting from roles + skills. */
export function inferProfileFields(
  profile: Pick<UserProfile, "targetRoles" | "skills">,
): JobField[] {
  const found = new Set<JobField>();
  const blob = profile.targetRoles.join(" ");

  for (const { field, re } of FIELD_PATTERNS) {
    if (re.test(blob)) found.add(field);
  }

  const techSkillCount = profile.skills.filter((s) =>
    TECH_SKILL_HINTS.has(norm(s)),
  ).length;
  if (techSkillCount >= 2) found.add("software");

  return ALL_FIELDS.filter((f) => found.has(f));
}

/** Infer job field from title (more reliable than ingest tag for matching). */
export function inferJobFieldFromTitle(title: string): JobField | null {
  const blob = normalizeRolePhrase(title);
  for (const { field, re } of FIELD_PATTERNS) {
    if (re.test(blob)) return field;
  }
  return null;
}

/** Whether a job is plausibly in the user's lane (field or title). */
export function jobRelevantToProfile(
  profile: Pick<UserProfile, "targetRoles" | "skills">,
  job: Pick<{ title: string; field: JobField }, "title" | "field">,
  effectiveSkills?: string[],
): boolean {
  const skills = effectiveSkills ?? profile.skills;
  const profileFields = inferProfileFields({ ...profile, skills });
  const roleFit = roleTitleFit(profile.targetRoles, job.title);
  const jobField = inferJobFieldFromTitle(job.title) ?? job.field;
  const ff = fieldFit(profileFields, jobField);
  return ff >= 0.5 || roleFit >= 0.35;
}

/** 0–1 overlap between job title and the user's target role strings. */
export function roleTitleFit(
  targetRoles: string[],
  jobTitle: string,
): number {
  if (targetRoles.length === 0) return 0.55;

  const titleNorm = normalizeRolePhrase(jobTitle);
  const titleTokens = new Set(tokenize(jobTitle));
  let best = 0;

  const targetEng = targetRoles.some((r) => ENGINEERING_ROLE.test(r));
  const titleEng = ENGINEERING_ROLE.test(jobTitle);
  if (targetEng && titleEng) best = 0.55;

  for (const role of targetRoles) {
    const roleTokens = tokenize(role);
    if (roleTokens.length === 0) continue;

    const tokenHits = roleTokens.filter((t) => titleTokens.has(t)).length;
    const substringHits = roleTokens.filter((t) => titleNorm.includes(t)).length;
    const hits = Math.max(tokenHits, substringHits);
    best = Math.max(best, hits / roleTokens.length);
  }

  return best;
}

/** 0–1 whether the job's catalog field aligns with inferred profile fields. */
export function fieldFit(
  profileFields: JobField[],
  jobField: JobField,
): number {
  if (profileFields.length === 0) return 0.7;
  return profileFields.includes(jobField) ? 1 : 0.12;
}

export function profileHasMatchingSignal(
  profile: Pick<
    UserProfile,
    "skills" | "salaryMin" | "locations" | "targetRoles"
  >,
): boolean {
  return (
    profile.skills.length > 0 ||
    profile.salaryMin > 0 ||
    profile.locations.length > 0 ||
    profile.targetRoles.length > 0
  );
}

export const FIELD_LABELS: Record<JobField, string> = {
  software: "Software Engineering",
  design: "Design",
  pm: "Product Management",
  marketing: "Marketing",
  healthcare: "Healthcare",
  finance: "Finance",
  cs: "Customer Success / Sales",
};
