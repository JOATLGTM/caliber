/**
 * Resume tailoring + cover letter generation.
 * Uses OpenAI when configured; otherwise produces a deterministic, non-empty
 * draft so the UI is exercisable in dev.
 */

import type {
  Job,
  ResumeDiff,
  ResumeDiffBreakdown,
  ResumeDiffBullet,
  UserProfile,
} from "@/lib/mock-data";
import { chatJson, chatText, isAiConfigured } from "./provider";

const FALLBACK_BULLETS: { original: string }[] = [
  { original: "Built and maintained backend services for a production product." },
  { original: "Worked on database performance improvements." },
  { original: "Mentored junior engineers and led code reviews." },
  { original: "Collaborated with product and design partners on roadmap." },
  { original: "Built internal tools." },
  { original: "Helped with hiring." },
];

function shapeBreakdown(
  bullets: ResumeDiffBullet[],
  job: Job,
): { breakdown: ResumeDiffBreakdown[]; quality: number } {
  const tailoredText = bullets.map((b) => b.tailored).join(" ");
  const lower = tailoredText.toLowerCase();
  const keywordHits = job.skills.filter((s) =>
    lower.includes(s.toLowerCase()),
  ).length;
  const totalKw = Math.max(1, job.skills.length);
  const kwScore = Math.round((keywordHits / totalKw) * 10);

  // Quantified impact: count bullets containing digits.
  const quant = bullets.filter((b) => /\d/.test(b.tailored)).length;
  const quantScore = Math.min(10, Math.round((quant / Math.max(1, bullets.length)) * 10));

  const verbs = ["led", "built", "designed", "shipped", "reduced", "owned", "operated", "scaled", "introduced"];
  const verbHits = bullets.filter((b) =>
    verbs.some((v) => b.tailored.toLowerCase().startsWith(v)),
  ).length;
  const verbScore = Math.min(10, Math.round((verbHits / Math.max(1, bullets.length)) * 10) + 1);

  const tailoringDepth = bullets.filter((b) => b.changed).length;
  const tailoringScore = Math.min(10, tailoringDepth + 4);

  const lengthOk = tailoredText.length >= 200 && tailoredText.length <= 4000;

  const breakdown: ResumeDiffBreakdown[] = [
    {
      label: "ATS keyword coverage",
      score: `${kwScore}/10`,
      state: kwScore >= 8 ? "good" : kwScore >= 6 ? "ok" : "warn",
    },
    {
      label: "Quantified impact",
      score: `${quantScore}/10`,
      state: quantScore >= 7 ? "good" : quantScore >= 5 ? "ok" : "warn",
    },
    {
      label: "Length appropriate",
      score: lengthOk ? "Pass" : "Review",
      state: lengthOk ? "good" : "warn",
    },
    {
      label: "Action verbs",
      score: `${verbScore}/10`,
      state: verbScore >= 8 ? "good" : verbScore >= 6 ? "ok" : "warn",
    },
    {
      label: "Tailoring depth",
      score: `${tailoringScore}/10`,
      state: tailoringScore >= 7 ? "good" : tailoringScore >= 5 ? "ok" : "warn",
    },
  ];

  const quality = Math.round(
    (kwScore / 10) * 30 +
      (quantScore / 10) * 25 +
      (lengthOk ? 10 : 5) +
      (verbScore / 10) * 15 +
      (tailoringScore / 10) * 20,
  );

  return { breakdown, quality: Math.max(40, Math.min(100, quality)) };
}

function deterministicTailor(
  profile: UserProfile,
  job: Job,
  baseBullets: { original: string }[],
): ResumeDiffBullet[] {
  const skills = (profile.skills.length ? profile.skills : job.skills).slice(0, 4);
  const k = (i: number) => skills[i % skills.length] ?? "Python";

  const templates: ((b: { original: string }) => Omit<ResumeDiffBullet, "original">)[] = [
    () => ({
      tailored: `Designed and operated production services in ${k(0)} powering core ${job.field === "software" ? "platform" : "product"} workflows at scale.`,
      changed: true,
      reason: `Surfaces ${k(0)} (a JD requirement) and frames work in production terms.`,
    }),
    () => ({
      tailored: `Reduced p99 latency by 84% on a high-traffic ${k(1)} service by introducing partitioned writes on PostgreSQL.`,
      changed: true,
      reason: `Quantified outcome with PostgreSQL keyword.`,
    }),
    () => ({
      tailored: `Mentored 4 engineers; introduced an RFC process now used across 3 teams.`,
      changed: true,
      reason: `Quantified leadership impact with a concrete artifact.`,
    }),
    (b) => ({
      tailored: b.original,
      changed: false,
      reason: null,
    }),
    () => ({
      tailored: `Built internal tooling in ${k(2)} that cut on-call escalations by 42% over two quarters.`,
      changed: true,
      reason: `Surfaces ${k(2)} and quantifies on-call impact.`,
    }),
    () => ({
      tailored: `Conducted 60+ technical interviews; co-authored the team's hiring rubric.`,
      changed: true,
      reason: `Quantified scope and a concrete artifact.`,
    }),
  ];

  return baseBullets.map((b, i) => {
    const tpl = templates[i % templates.length](b);
    return { original: b.original, ...tpl };
  });
}

function deterministicCoverLetter(profile: UserProfile, job: Job): string {
  const name = profile.name || "—";
  const target = profile.skills.slice(0, 3).join(", ") || "backend systems";
  return [
    `Dear ${job.company} hiring team,`,
    "",
    `I'm writing to apply for the ${job.title} role. Over the past few years I've focused on ${target}, shipping production systems that meet the bar your team is hiring against.`,
    "",
    `Three things drew me here. First, ${job.company}'s product is the kind of work I want to be doing more of. Second, the team's stated emphasis on ${job.skills[0] ?? "engineering quality"} matches the way I like to operate. Third, the role specifically mentions ${job.skills[1] ?? "technical depth"}, which is where I've spent the most time.`,
    "",
    `I'd love to talk about how I can contribute.`,
    "",
    `Best,`,
    name,
  ].join("\n");
}

export interface TailorBaseInput {
  profile: UserProfile;
  job: Job;
  /** Bullets from the user's base resume (or fallback set). */
  baseBullets: { original: string }[];
  resumeText?: string;
}

export async function generateTailoredResume(
  input: TailorBaseInput,
): Promise<ResumeDiff> {
  const baseBullets = input.baseBullets.length > 0 ? input.baseBullets : FALLBACK_BULLETS;

  let bullets: ResumeDiffBullet[];

  if (isAiConfigured()) {
    try {
      const data = await chatJson<{ bullets: ResumeDiffBullet[] }>({
        system:
          "You are an expert technical resume writer. Tailor resume bullets for a specific job posting. Keep each tailored bullet to one line, lead with a strong verb, and add quantification where credible. Never invent specific employers, technologies, or metrics that are not present in the original — when uncertain, generalize.",
        user: [
          `Job: ${input.job.title} at ${input.job.company}`,
          `Required skills: ${input.job.skills.join(", ")}`,
          `Nice to haves: ${input.job.niceToHaves.join(", ")}`,
          `JD: ${input.job.description}`,
          `Candidate profile skills: ${input.profile.skills.join(", ")}`,
          input.resumeText ? `Candidate resume text:\n${input.resumeText.slice(0, 4000)}` : "",
          "",
          "Original bullets to rewrite:",
          ...baseBullets.map((b, i) => `${i + 1}. ${b.original}`),
        ]
          .filter(Boolean)
          .join("\n"),
        schemaHint: `{
  "bullets": [
    {
      "original": "<verbatim original>",
      "tailored": "<rewritten bullet>",
      "changed": true | false,
      "reason": "<one-sentence why> | null"
    }
  ]
}`,
        temperature: 0.5,
      });
      bullets = (data.bullets ?? []).map((b, i) => ({
        original: baseBullets[i]?.original ?? b.original ?? "",
        tailored: b.tailored ?? baseBullets[i]?.original ?? "",
        changed: Boolean(b.changed),
        reason: b.reason ?? null,
      }));
      if (bullets.length === 0) {
        bullets = deterministicTailor(input.profile, input.job, baseBullets);
      }
    } catch {
      bullets = deterministicTailor(input.profile, input.job, baseBullets);
    }
  } else {
    bullets = deterministicTailor(input.profile, input.job, baseBullets);
  }

  const { breakdown, quality } = shapeBreakdown(bullets, input.job);

  return {
    jobTitle: input.job.title,
    company: input.job.company,
    qualityScore: quality,
    breakdown,
    bullets,
  };
}

export async function generateCoverLetter(input: {
  profile: UserProfile;
  job: Job;
  resumeText?: string;
}): Promise<string> {
  if (isAiConfigured()) {
    try {
      const text = await chatText({
        system:
          "You are an expert cover letter writer. Write in a calm, specific, first-person voice — no clichés, no buzzwords, no flattery. 220–320 words. Format: 4 short paragraphs followed by 'Best,' and the candidate name.",
        user: [
          `Candidate: ${input.profile.name}`,
          `Skills: ${input.profile.skills.join(", ")}`,
          `Target role: ${input.job.title} at ${input.job.company}`,
          `JD: ${input.job.description}`,
          `Required skills: ${input.job.skills.join(", ")}`,
          input.resumeText ? `Resume excerpt:\n${input.resumeText.slice(0, 3000)}` : "",
          "",
          "Write the cover letter now.",
        ]
          .filter(Boolean)
          .join("\n"),
        temperature: 0.7,
      });
      if (text.trim().length > 80) return text.trim();
    } catch {
      // fall through to deterministic
    }
  }
  return deterministicCoverLetter(input.profile, input.job);
}

export async function generateWhyMatch(input: {
  profile: UserProfile;
  job: Job;
  baseSignal: string[];
}): Promise<string[]> {
  if (!isAiConfigured()) return input.baseSignal;
  try {
    const data = await chatJson<{ bullets: string[] }>({
      system:
        "You are an honest job-fit analyst. Given a candidate profile and a job, produce 3-4 concise bullets explaining the match. Cover one strength, one gap or risk, and one logistical note (salary, mode, location). Each bullet ≤ 18 words. No flattery.",
      user: [
        `Job: ${input.job.title} at ${input.job.company}`,
        `Salary band: ${input.job.salary} (min ${input.job.salaryMin})`,
        `Mode: ${input.job.workMode}, location: ${input.job.location}`,
        `Required skills: ${input.job.skills.join(", ")}`,
        `Candidate skills: ${input.profile.skills.join(", ")}`,
        `Candidate salary floor: ${input.profile.salaryMin}`,
        `Candidate locations: ${input.profile.locations.join(", ")}`,
        `Candidate work modes: ${JSON.stringify(input.profile.workModes)}`,
      ].join("\n"),
      schemaHint: `{ "bullets": ["...", "...", "..."] }`,
      temperature: 0.4,
    });
    const out = (data.bullets ?? []).filter((b) => typeof b === "string" && b.length > 0);
    return out.length > 0 ? out.slice(0, 4) : input.baseSignal;
  } catch {
    return input.baseSignal;
  }
}
