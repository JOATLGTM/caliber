import { computeMatch } from "../lib/ai/scoring";
import { jobRelevantToProfile } from "../lib/ai/field-match";
import { MIN_DISPLAY_MATCH_SCORE } from "../lib/ai/match-config";
import type { Job, UserProfile } from "../lib/mock-data";

const profile: Pick<
  UserProfile,
  | "skills"
  | "salaryMin"
  | "experienceLevel"
  | "workModes"
  | "locations"
  | "targetRoles"
> = {
  targetRoles: [
    "Software Engineer",
    "Front End Developer",
    "Full Stack Developer",
  ],
  skills: [
    "Javascript",
    "React",
    "Vue",
    "Node.js",
    "TypeScript",
    "PostgreSQL",
    "AWS",
  ],
  salaryMin: 100_000,
  experienceLevel: "Mid",
  workModes: { remote: true, hybrid: true, onsite: false },
  locations: ["San Francisco"],
};

const samples: Partial<Job>[] = [
  {
    company: "Datadog",
    title: "Software Engineer - Platform",
    field: "software",
    skills: ["Go", "Python", "Kubernetes"],
    niceToHaves: [],
    salaryMin: 0,
    workMode: "Remote",
    seniority: "Senior",
  },
  {
    company: "Figma",
    title: "Software Engineer, Product Engineering",
    field: "software",
    skills: ["TypeScript", "React", "C++"],
    niceToHaves: [],
    salaryMin: 0,
    workMode: "Hybrid",
    seniority: "Mid",
  },
  {
    company: "Cloudflare",
    title: "Senior Software Engineer",
    field: "software",
    skills: ["Rust", "Go"],
    niceToHaves: [],
    salaryMin: 180_000,
    workMode: "Remote",
    seniority: "Senior",
  },
  {
    company: "OpenAI",
    title: "Account Executive, Startups",
    field: "cs",
    skills: ["Sales"],
    niceToHaves: [],
    salaryMin: 0,
    workMode: "Hybrid",
    seniority: "Mid",
  },
  {
    company: "Ramp",
    title: "Senior Software Engineer | GTM Platform, Backend",
    field: "software",
    skills: ["Python", "PostgreSQL"],
    niceToHaves: ["Kafka"],
    salaryMin: 0,
    workMode: "Remote",
    seniority: "Senior",
  },
];

for (const partial of samples) {
  const job = {
    id: "x",
    location: "Remote",
    salary: "",
    matchScore: 0,
    postedAt: "2026-05-01",
    whyMatch: [],
    description: partial.title ?? "",
    saved: false,
    dismissed: false,
    ...partial,
  } as Job;

  const sig = computeMatch(profile, job);
  const relevant = jobRelevantToProfile(profile, job, profile.skills);
  const pass = relevant && sig.score >= MIN_DISPLAY_MATCH_SCORE;
  console.log(
    `${pass ? "PASS" : "FAIL"} ${sig.score}% [rel=${relevant}] — ${job.company}: ${job.title}`,
  );
}
