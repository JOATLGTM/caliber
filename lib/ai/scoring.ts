/**
 * Deterministic match scoring — computes a 0-100 score and "why match" bullets
 * from a profile + job. Used both as a stand-alone (when no LLM key) and as a
 * grounding signal we can show to the LLM.
 */

import type { Job, UserProfile } from "@/lib/mock-data";
import { extractSkillsFromText } from "@/lib/jobs/ingest/skills";
import { mergeProfileSkills } from "./profile-skills";
import { skillOverlap } from "./skill-overlap";
import {
  FIELD_LABELS,
  fieldFit,
  inferJobFieldFromTitle,
  inferProfileFields,
  roleTitleFit,
} from "./field-match";

export interface MatchOptions {
  /** Plain-text resume body — merged with profile skills for overlap. */
  resumeText?: string | null;
}

interface ScoreWeights {
  skill: number;
  role: number;
  field: number;
  salary: number;
  mode: number;
  seniority: number;
  location: number;
}

const DEFAULT_WEIGHTS: ScoreWeights = {
  skill: 0.3,
  role: 0.25,
  field: 0.15,
  salary: 0.1,
  mode: 0.08,
  seniority: 0.07,
  location: 0.05,
};

const SPARSE_JD_WEIGHTS: ScoreWeights = {
  skill: 0.15,
  role: 0.35,
  field: 0.18,
  salary: 0.1,
  mode: 0.08,
  seniority: 0.08,
  location: 0.06,
};

export interface MatchSignal {
  score: number;
  whyMatch: string[];
  matchedSkills: string[];
  missingSkills: string[];
}

function effectiveJobSkills(job: Job): {
  required: string[];
  niceToHaves: string[];
  sparse: boolean;
} {
  if (job.skills.length >= 3) {
    return {
      required: job.skills,
      niceToHaves: job.niceToHaves,
      sparse: false,
    };
  }

  const fromText = extractSkillsFromText(`${job.title} ${job.description}`);
  const required =
    job.skills.length > 0
      ? job.skills
      : fromText.skills.length > 0
        ? fromText.skills
        : fromText.niceToHaves.slice(0, 6);

  const niceToHaves =
    job.niceToHaves.length > 0
      ? job.niceToHaves
      : job.skills.length > 0
        ? fromText.niceToHaves
        : fromText.niceToHaves.slice(6);

  return {
    required,
    niceToHaves,
    sparse: job.skills.length < 3,
  };
}

export function computeMatch(
  profile: Pick<
    UserProfile,
    | "skills"
    | "salaryMin"
    | "experienceLevel"
    | "workModes"
    | "locations"
    | "targetRoles"
  >,
  job: Job,
  options: MatchOptions = {},
): MatchSignal {
  const effectiveSkills = mergeProfileSkills(
    profile.skills,
    options.resumeText,
  );
  const profileForFields = { ...profile, skills: effectiveSkills };
  const profileFields = inferProfileFields(profileForFields);

  const { required: jdSkills, niceToHaves: jdNice, sparse } =
    effectiveJobSkills(job);
  const { matched, missing } = skillOverlap(effectiveSkills, jdSkills);
  const niceOverlap = skillOverlap(effectiveSkills, jdNice);

  const roleFit = roleTitleFit(profile.targetRoles, job.title);
  const effectiveJobField =
    inferJobFieldFromTitle(job.title) ?? job.field;
  const jobFieldFit = fieldFit(profileFields, effectiveJobField);

  let skillCoverage: number;
  const skillDenominator = Math.min(jdSkills.length, 6);
  if (effectiveSkills.length === 0) {
    skillCoverage = sparse ? 0.4 : 0.45;
  } else if (jdSkills.length === 0) {
    skillCoverage =
      roleFit >= 0.5 ? 0.5 : roleFit >= 0.35 ? 0.35 : 0.2;
  } else {
    skillCoverage = matched.length / skillDenominator;
    if (sparse && roleFit >= 0.5) {
      skillCoverage = Math.max(skillCoverage, 0.45);
    }
    if (roleFit >= 0.5 && jobFieldFit >= 0.5) {
      skillCoverage = Math.max(skillCoverage, 0.35);
    }
  }

  const salaryFit =
    profile.salaryMin === 0
      ? 0.85
      : job.salaryMin === 0
        ? 0.78
        : Math.min(1, job.salaryMin / profile.salaryMin);

  const modeKey =
    job.workMode === "Remote"
      ? "remote"
      : job.workMode === "Hybrid"
        ? "hybrid"
        : "onsite";
  const modeFit = profile.workModes[modeKey] ? 1 : 0.6;

  const order: Record<string, number> = {
    Entry: 1,
    Mid: 2,
    Senior: 3,
    "Staff+": 4,
  };
  const profileLevel = order[profile.experienceLevel] ?? 2;
  const jobLevel = order[job.seniority] ?? 2;
  const seniorityFit = 1 - Math.min(1, Math.abs(profileLevel - jobLevel) / 3);

  let locationFit = 0.7;
  if (job.workMode === "Remote" && profile.workModes.remote) {
    locationFit = 1;
  } else {
    const locTokens = profile.locations.map((l) =>
      l.toLowerCase().trim().split(",")[0] ?? l,
    );
    if (locTokens.some((t) => job.location.toLowerCase().includes(t))) {
      locationFit = 1;
    }
  }

  const w = sparse ? SPARSE_JD_WEIGHTS : DEFAULT_WEIGHTS;

  const score = Math.round(
    100 *
      (w.skill * skillCoverage +
        w.role * roleFit +
        w.field * jobFieldFit +
        w.salary * salaryFit +
        w.mode * modeFit +
        w.seniority * seniorityFit +
        w.location * locationFit),
  );
  const clamped = Math.max(0, Math.min(100, score));

  const whyMatch: string[] = [];
  if (roleFit >= 0.5 && profile.targetRoles.length > 0) {
    whyMatch.push(
      `Title aligns with your target role focus (${Math.round(roleFit * 100)}% overlap).`,
    );
  } else if (profile.targetRoles.length > 0 && roleFit < 0.35) {
    whyMatch.push(
      `Title diverges from your targets (${profile.targetRoles.slice(0, 2).join(", ")}).`,
    );
  }
  if (jobFieldFit < 0.5 && profileFields.length > 0) {
    whyMatch.push(
      `Role is in ${FIELD_LABELS[effectiveJobField]} — outside your ${profileFields.map((f) => FIELD_LABELS[f]).join(" / ")} focus.`,
    );
  }
  if (matched.length > 0) {
    whyMatch.push(
      `Strong on ${matched.slice(0, 3).join(", ")} — matches JD requirements.`,
    );
  }
  if (niceOverlap.matched.length > 0) {
    whyMatch.push(
      `Bonus signal on ${niceOverlap.matched.slice(0, 2).join(", ")} (nice-to-have).`,
    );
  }
  if (sparse && jdSkills.length > 0 && job.skills.length < 3) {
    whyMatch.push(
      `Skills inferred from posting text — verify the full description.`,
    );
  }
  if (job.salaryMin >= profile.salaryMin && profile.salaryMin > 0) {
    whyMatch.push(
      `Salary clears your $${Math.round(profile.salaryMin / 1000)}k floor.`,
    );
  } else if (
    profile.salaryMin > 0 &&
    job.salaryMin > 0 &&
    job.salaryMin < profile.salaryMin
  ) {
    whyMatch.push(
      `Salary band is below your $${Math.round(profile.salaryMin / 1000)}k floor — verify before applying.`,
    );
  } else if (profile.salaryMin > 0 && job.salaryMin === 0) {
    whyMatch.push(`Compensation not listed — check the posting before applying.`);
  }
  if (modeFit < 1) {
    whyMatch.push(
      `Work mode is ${job.workMode} — confirm it fits your preference.`,
    );
  }
  if (missing.length > 0 && jdSkills.length > 0) {
    whyMatch.push(
      `Light on ${missing.slice(0, 2).join(", ")} — surface adjacent experience.`,
    );
  }

  return {
    score: clamped,
    whyMatch: whyMatch.slice(0, 4),
    matchedSkills: matched,
    missingSkills: missing,
  };
}
