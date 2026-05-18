// Caliber — mock data for the UI scaffold.
// Ported 1:1 from the design handoff prototype (project/data.jsx).

export type WorkMode = "Remote" | "Hybrid" | "Onsite";
export type Seniority = "Entry" | "Mid" | "Senior" | "Staff+";
export type JobField =
  | "software"
  | "design"
  | "pm"
  | "marketing"
  | "healthcare"
  | "finance"
  | "cs";

export interface Job {
  id: string;
  company: string;
  title: string;
  location: string;
  workMode: WorkMode;
  salary: string;
  salaryMin: number;
  matchScore: number;
  postedAt: string;
  seniority: Seniority;
  field: JobField;
  skills: string[];
  niceToHaves: string[];
  whyMatch: string[];
  description: string;
  saved: boolean;
  dismissed: boolean;
}

export type ApplicationStatus =
  | "Saved"
  | "Applied"
  | "Phone Screen"
  | "Interview"
  | "Offer"
  | "Closed";

export interface Application {
  id: string;
  company: string;
  title: string;
  status: ApplicationStatus;
  outcome: "Won" | "Lost" | null;
  matchScore: number;
  appliedAt: string;
  salary: string;
}

export interface Resume {
  id: string;
  title: string;
  updatedAt: string;
  isBase: boolean;
  jobTitle?: string;
  company?: string;
  matchScoreAtTime?: number;
}

export interface CoverLetter {
  id: string;
  company: string;
  jobTitle: string;
  createdAt: string;
  preview: string;
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  location: string;
  targetRoles: string[];
  locations: string[];
  workModes: { remote: boolean; hybrid: boolean; onsite: boolean };
  salaryMin: number;
  salaryTarget: number;
  experienceLevel: Seniority;
  skills: string[];
}

export interface DashboardStats {
  matchesThisWeek: number;
  savedJobs: number;
  activeApplications: number;
  avgMatchScore: number;
}

export interface ResumeDiffBullet {
  original: string;
  tailored: string;
  changed: boolean;
  reason: string | null;
}

export interface ResumeDiffBreakdown {
  label: string;
  score: string;
  state: "good" | "ok" | "warn" | "bad";
}

export interface ResumeDiff {
  jobTitle: string;
  company: string;
  qualityScore: number;
  breakdown: ResumeDiffBreakdown[];
  bullets: ResumeDiffBullet[];
}

export const JOBS: Job[] = [
  {
    id: "j-stripe-be",
    company: "Stripe",
    title: "Senior Backend Engineer, Payments",
    location: "San Francisco, CA",
    workMode: "Hybrid",
    salary: "$210k – $260k",
    salaryMin: 210000,
    matchScore: 94,
    postedAt: "2026-05-01",
    seniority: "Senior",
    field: "software",
    skills: ["Python", "Go", "Distributed Systems", "AWS", "PostgreSQL"],
    niceToHaves: ["Ruby", "Kafka", "Payments domain"],
    whyMatch: [
      "Strong on Python, AWS — 5y backend matches their stack",
      "Salary aligns with your $200k floor",
      "Light on Go — they list it as primary, you've shipped one service",
    ],
    description:
      "We're building the financial infrastructure of the internet. As a Senior Backend Engineer on Payments, you'll design and operate systems that move trillions of dollars annually. You'll work on idempotent APIs, ledger correctness, and the hard distributed-systems problems that make payments work.\n\nYou'll partner with product and infrastructure teams to ship core primitives used by every Stripe user. You'll write production Python and Go, own services end to end, and contribute to architecture decisions that compound for years.\n\nWe care deeply about correctness, careful incremental change, and writing things down. Our codebase is large but well-tended; reviewers are kind and exacting.",
    saved: false,
    dismissed: false,
  },
  {
    id: "j-linear-fe",
    company: "Linear",
    title: "Senior Product Engineer",
    location: "Remote (Americas)",
    workMode: "Remote",
    salary: "$190k – $230k",
    salaryMin: 190000,
    matchScore: 91,
    postedAt: "2026-04-30",
    seniority: "Senior",
    field: "software",
    skills: ["TypeScript", "React", "GraphQL", "Postgres"],
    niceToHaves: ["Rust", "WebAssembly", "Performance work"],
    whyMatch: [
      "TypeScript + React directly matches 4y of your work",
      "Remote with a strong async culture — fits your stated preference",
      "GraphQL listed as primary; you've used it briefly",
    ],
    description:
      "Linear is a software project management tool built for high-performance teams. We're looking for a Senior Product Engineer who can own features end-to-end, from design partnership through performant production code.\n\nOur frontend is a real-time, offline-first React app with a custom sync engine. You'll work on parts of the product millions of people use every day and feel responsible for how it feels — speed, polish, the small things.",
    saved: true,
    dismissed: false,
  },
  {
    id: "j-figma-design",
    company: "Figma",
    title: "Senior Product Designer, Editor",
    location: "New York, NY",
    workMode: "Hybrid",
    salary: "$180k – $215k",
    salaryMin: 180000,
    matchScore: 88,
    postedAt: "2026-04-29",
    seniority: "Senior",
    field: "design",
    skills: ["Product Design", "Prototyping", "Design Systems", "Figma"],
    niceToHaves: ["Motion", "Code literacy"],
    whyMatch: [
      "Editor-tooling experience from your Notion work transfers directly",
      "Hybrid NY matches your location preference",
      "Portfolio depth on systems work is a strong signal",
    ],
    description:
      "We're hiring a Senior Product Designer to work on the Figma editor — the canvas where millions of designers live each day. You'll partner with engineers and PMs to shape interactions, polish craft, and push the boundaries of what design tooling can be.",
    saved: false,
    dismissed: false,
  },
  {
    id: "j-notion-pm",
    company: "Notion",
    title: "Staff Product Manager, AI",
    location: "San Francisco, CA",
    workMode: "Hybrid",
    salary: "$240k – $290k",
    salaryMin: 240000,
    matchScore: 86,
    postedAt: "2026-04-28",
    seniority: "Staff+",
    field: "pm",
    skills: ["Product Strategy", "AI/ML literacy", "0→1", "Roadmapping"],
    niceToHaves: ["Productivity software", "Enterprise"],
    whyMatch: [
      "0→1 background and AI literacy match the role brief",
      "Salary band exceeds your floor by ~20%",
      "Onsite expectation 3 days/week — confirm before applying",
    ],
    description:
      "Notion is hiring a Staff PM to lead our AI product surface. You'll own roadmap and outcomes for a workstream that touches every Notion user.",
    saved: false,
    dismissed: false,
  },
  {
    id: "j-vercel-devrel",
    company: "Vercel",
    title: "Developer Advocate",
    location: "Remote (Global)",
    workMode: "Remote",
    salary: "$160k – $200k",
    salaryMin: 160000,
    matchScore: 79,
    postedAt: "2026-04-28",
    seniority: "Senior",
    field: "software",
    skills: ["Next.js", "Public speaking", "Technical writing"],
    niceToHaves: ["Video production", "Conference circuit"],
    whyMatch: [
      "Strong Next.js background and public writing samples",
      "Travel expectation ~30% — flag if that's a constraint",
      "Comp band slightly below your target",
    ],
    description:
      "Vercel is looking for a Developer Advocate to help millions of developers ship faster.",
    saved: false,
    dismissed: false,
  },
  {
    id: "j-ramp-growth",
    company: "Ramp",
    title: "Growth Marketing Manager",
    location: "New York, NY",
    workMode: "Hybrid",
    salary: "$140k – $175k",
    salaryMin: 140000,
    matchScore: 82,
    postedAt: "2026-04-27",
    seniority: "Mid",
    field: "marketing",
    skills: ["Performance marketing", "SQL", "Lifecycle", "B2B"],
    niceToHaves: ["Fintech", "SEO"],
    whyMatch: [
      "B2B fintech context matches your last two roles",
      "SQL fluency rare in marketing — a clear edge here",
      "Comp aligned with your stated range",
    ],
    description:
      "Ramp is hiring a Growth Marketing Manager to own paid + lifecycle for our SMB segment.",
    saved: false,
    dismissed: false,
  },
  {
    id: "j-anthropic-research",
    company: "Anthropic",
    title: "Research Engineer, Alignment",
    location: "San Francisco, CA",
    workMode: "Onsite",
    salary: "$280k – $360k",
    salaryMin: 280000,
    matchScore: 71,
    postedAt: "2026-04-26",
    seniority: "Senior",
    field: "software",
    skills: ["PyTorch", "ML systems", "Distributed training"],
    niceToHaves: ["Published research", "Interpretability"],
    whyMatch: [
      "ML systems work is adjacent — gap on published research",
      "Onsite SF — confirm relocation appetite",
      "Comp ceiling is best-in-class",
    ],
    description:
      "Anthropic is hiring research engineers focused on alignment and interpretability.",
    saved: false,
    dismissed: false,
  },
  {
    id: "j-onepeloton-nurse",
    company: "Mount Sinai Health System",
    title: "Registered Nurse, Cardiology",
    location: "New York, NY",
    workMode: "Onsite",
    salary: "$95k – $128k",
    salaryMin: 95000,
    matchScore: 90,
    postedAt: "2026-04-26",
    seniority: "Mid",
    field: "healthcare",
    skills: ["BSN", "BLS/ACLS", "Telemetry", "EPIC"],
    niceToHaves: ["CCRN", "Bilingual"],
    whyMatch: [
      "Telemetry experience and ACLS current — strong match",
      "Day shift availability matches posting",
      "Salary at the upper end of your stated range",
    ],
    description:
      "Mount Sinai is seeking a Registered Nurse for our cardiac telemetry unit. 12-hour day shifts, 3 days/week.",
    saved: false,
    dismissed: false,
  },
  {
    id: "j-blackrock-fa",
    company: "BlackRock",
    title: "Senior Financial Analyst, FP&A",
    location: "New York, NY",
    workMode: "Hybrid",
    salary: "$120k – $150k",
    salaryMin: 120000,
    matchScore: 84,
    postedAt: "2026-04-25",
    seniority: "Senior",
    field: "finance",
    skills: ["FP&A", "Excel modeling", "SQL", "Tableau"],
    niceToHaves: ["Python", "Asset management"],
    whyMatch: [
      "FP&A + SQL combination is the core of the JD",
      "Hybrid 3-day in office — confirm it fits",
      "Comp aligned with your floor",
    ],
    description: "BlackRock's FP&A team is hiring a Senior Financial Analyst.",
    saved: false,
    dismissed: false,
  },
  {
    id: "j-intercom-cs",
    company: "Intercom",
    title: "Customer Success Manager, Mid-Market",
    location: "Austin, TX",
    workMode: "Hybrid",
    salary: "$110k – $140k OTE",
    salaryMin: 110000,
    matchScore: 76,
    postedAt: "2026-04-24",
    seniority: "Mid",
    field: "cs",
    skills: ["SaaS CS", "Renewals", "Account expansion", "Gainsight"],
    niceToHaves: ["Technical aptitude", "Onboarding"],
    whyMatch: [
      "Mid-market SaaS book size matches your last role",
      "OTE structure depends on quota — review carefully",
      "Austin hybrid — confirm relocation",
    ],
    description: "Intercom is hiring a CSM for our mid-market segment in Austin.",
    saved: false,
    dismissed: false,
  },
  {
    id: "j-canva-design",
    company: "Canva",
    title: "Product Designer, Mobile",
    location: "Remote (US)",
    workMode: "Remote",
    salary: "$155k – $190k",
    salaryMin: 155000,
    matchScore: 81,
    postedAt: "2026-04-24",
    seniority: "Mid",
    field: "design",
    skills: ["Mobile design", "iOS HIG", "Prototyping"],
    niceToHaves: ["Animation", "Cross-functional leadership"],
    whyMatch: [
      "Mobile-native portfolio is the explicit ask",
      "Remote US — fits preference",
      "Mid level — slightly below your seniority target",
    ],
    description:
      "Canva is hiring a Product Designer focused on the mobile app experience.",
    saved: false,
    dismissed: false,
  },
  {
    id: "j-shopify-pm",
    company: "Shopify",
    title: "Product Manager, Merchant Identity",
    location: "Remote (Canada/US)",
    workMode: "Remote",
    salary: "$170k – $210k",
    salaryMin: 170000,
    matchScore: 68,
    postedAt: "2026-04-22",
    seniority: "Senior",
    field: "pm",
    skills: ["Product management", "Identity/auth", "Platform"],
    niceToHaves: ["E-commerce", "Compliance"],
    whyMatch: [
      "Platform PM background is relevant",
      "Identity/auth is adjacent — gap on direct experience",
      "Comp slightly below your floor",
    ],
    description: "Shopify is hiring a PM for the Merchant Identity team.",
    saved: false,
    dismissed: false,
  },
];

export const APPLICATIONS: Application[] = [
  { id: "a1", company: "Linear", title: "Senior Product Engineer", status: "Interview", outcome: null, matchScore: 91, appliedAt: "2026-04-18", salary: "$190k–$230k" },
  { id: "a2", company: "Stripe", title: "Senior Backend Engineer", status: "Phone Screen", outcome: null, matchScore: 94, appliedAt: "2026-04-22", salary: "$210k–$260k" },
  { id: "a3", company: "Figma", title: "Senior Product Designer", status: "Applied", outcome: null, matchScore: 88, appliedAt: "2026-04-25", salary: "$180k–$215k" },
  { id: "a4", company: "Notion", title: "Staff PM, AI", status: "Saved", outcome: null, matchScore: 86, appliedAt: "—", salary: "$240k–$290k" },
  { id: "a5", company: "Ramp", title: "Growth Marketing Manager", status: "Applied", outcome: null, matchScore: 82, appliedAt: "2026-04-26", salary: "$140k–$175k" },
  { id: "a6", company: "Vercel", title: "Developer Advocate", status: "Saved", outcome: null, matchScore: 79, appliedAt: "—", salary: "$160k–$200k" },
  { id: "a7", company: "Anthropic", title: "Research Engineer", status: "Saved", outcome: null, matchScore: 71, appliedAt: "—", salary: "$280k–$360k" },
  { id: "a8", company: "Mount Sinai", title: "RN, Cardiology", status: "Phone Screen", outcome: null, matchScore: 90, appliedAt: "2026-04-19", salary: "$95k–$128k" },
  { id: "a9", company: "BlackRock", title: "Senior Financial Analyst", status: "Interview", outcome: null, matchScore: 84, appliedAt: "2026-04-15", salary: "$120k–$150k" },
  { id: "a10", company: "Datadog", title: "Senior Backend Engineer", status: "Closed", outcome: "Lost", matchScore: 82, appliedAt: "2026-03-28", salary: "$200k–$250k" },
  { id: "a11", company: "Plaid", title: "Senior Backend Engineer", status: "Offer", outcome: "Won", matchScore: 89, appliedAt: "2026-03-20", salary: "$220k–$255k" },
  { id: "a12", company: "Airtable", title: "Product Engineer", status: "Closed", outcome: "Lost", matchScore: 75, appliedAt: "2026-03-10", salary: "$180k–$220k" },
  { id: "a13", company: "Discord", title: "Senior Backend Engineer", status: "Applied", outcome: null, matchScore: 87, appliedAt: "2026-04-27", salary: "$200k–$245k" },
  { id: "a14", company: "Retool", title: "Founding Engineer, AI", status: "Phone Screen", outcome: null, matchScore: 88, appliedAt: "2026-04-24", salary: "$220k–$280k" },
  { id: "a15", company: "Brex", title: "Senior Software Engineer", status: "Interview", outcome: null, matchScore: 85, appliedAt: "2026-04-12", salary: "$200k–$245k" },
];

export const RESUMES: Resume[] = [
  { id: "r-base", title: "Base Resume — Backend Engineer", updatedAt: "2026-04-12", isBase: true },
  { id: "r1", title: "Stripe — Senior Backend Engineer", updatedAt: "2026-04-22", isBase: false, jobTitle: "Senior Backend Engineer", company: "Stripe", matchScoreAtTime: 94 },
  { id: "r2", title: "Linear — Senior Product Engineer", updatedAt: "2026-04-18", isBase: false, jobTitle: "Senior Product Engineer", company: "Linear", matchScoreAtTime: 91 },
  { id: "r3", title: "Figma — Senior Product Designer", updatedAt: "2026-04-25", isBase: false, jobTitle: "Senior Product Designer", company: "Figma", matchScoreAtTime: 88 },
  { id: "r4", title: "Notion — Staff PM, AI", updatedAt: "2026-04-24", isBase: false, jobTitle: "Staff PM, AI", company: "Notion", matchScoreAtTime: 86 },
  { id: "r5", title: "Plaid — Senior Backend Engineer", updatedAt: "2026-03-20", isBase: false, jobTitle: "Senior Backend Engineer", company: "Plaid", matchScoreAtTime: 89 },
  { id: "r6", title: "Discord — Senior Backend Engineer", updatedAt: "2026-04-27", isBase: false, jobTitle: "Senior Backend Engineer", company: "Discord", matchScoreAtTime: 87 },
  { id: "r7", title: "Retool — Founding Engineer", updatedAt: "2026-04-24", isBase: false, jobTitle: "Founding Engineer, AI", company: "Retool", matchScoreAtTime: 88 },
  { id: "r8", title: "Brex — Senior Software Engineer", updatedAt: "2026-04-12", isBase: false, jobTitle: "Senior Software Engineer", company: "Brex", matchScoreAtTime: 85 },
];

export const COVER_LETTERS: CoverLetter[] = [
  { id: "c1", company: "Stripe", jobTitle: "Senior Backend Engineer, Payments", createdAt: "2026-04-22", preview: "When I rebuilt our ledger service last year, I learned what it costs to be even one cent off across millions of transactions. That's the kind of correctness Stripe cares about, and it's the work I want to keep doing…" },
  { id: "c2", company: "Linear", jobTitle: "Senior Product Engineer", createdAt: "2026-04-18", preview: "Linear is the rare tool I open and immediately notice how it feels — the speed, the keyboard fluency, the way nothing gets in the way. I'd like to help build that." },
  { id: "c3", company: "Plaid", jobTitle: "Senior Backend Engineer", createdAt: "2026-03-20", preview: "I've spent the last four years building payment and identity infrastructure at scale. Plaid's mission to make financial life easier through better APIs is the exact problem space I'd choose if I were starting over." },
  { id: "c4", company: "Discord", jobTitle: "Senior Backend Engineer", createdAt: "2026-04-27", preview: "Real-time systems at the scale of Discord's voice infrastructure are an engineering problem I find genuinely beautiful. I've spent two years on lower-stakes versions of the same problem at my current role…" },
  { id: "c5", company: "Retool", jobTitle: "Founding Engineer, AI", createdAt: "2026-04-24", preview: "The interesting thing about internal tools is that they reveal exactly what a company values. Retool sits at that intersection, and now you're applying AI to it — I want in on this." },
  { id: "c6", company: "Brex", jobTitle: "Senior Software Engineer", createdAt: "2026-04-12", preview: "Brex's pace and product quality stand out in a category that often optimizes for neither. I want to ship things that real businesses depend on…" },
];

export const USER_PROFILE: UserProfile = {
  name: "Alex Morgan",
  email: "alex.morgan@gmail.com",
  phone: "+1 (415) 555 0192",
  location: "San Francisco, CA",
  targetRoles: ["Senior Backend Engineer", "Staff Software Engineer", "Senior Product Engineer"],
  locations: ["San Francisco", "New York", "Remote (US)"],
  workModes: { remote: true, hybrid: true, onsite: false },
  salaryMin: 200000,
  salaryTarget: 240000,
  experienceLevel: "Senior",
  skills: ["Python", "Go", "TypeScript", "React", "PostgreSQL", "AWS", "Kafka", "Distributed Systems", "GraphQL", "Docker", "Kubernetes", "Stripe API"],
};

export const STATS: DashboardStats = {
  matchesThisWeek: 23,
  savedJobs: 4,
  activeApplications: 9,
  avgMatchScore: 84,
};

export const RESUME_DIFF: ResumeDiff = {
  jobTitle: "Senior Backend Engineer, Payments",
  company: "Stripe",
  qualityScore: 87,
  breakdown: [
    { label: "ATS keyword coverage", score: "9/10", state: "good" },
    { label: "Quantified impact", score: "7/10", state: "ok" },
    { label: "Length appropriate", score: "Pass", state: "good" },
    { label: "Action verbs", score: "9/10", state: "good" },
    { label: "Tailoring depth", score: "8/10", state: "good" },
  ],
  bullets: [
    {
      original: "Built and maintained backend services for the payments platform.",
      tailored: "Designed and operated idempotent payment APIs in Python processing $1.4B annual GMV with 99.99% availability.",
      changed: true,
      reason: "Added quantified scale and the keyword 'idempotent' from the JD.",
    },
    {
      original: "Worked on database performance improvements.",
      tailored: "Reduced p99 latency on the ledger service from 240ms to 38ms by introducing a partitioned write-ahead log on PostgreSQL.",
      changed: true,
      reason: "Replaced vague verb with specific outcome and PostgreSQL keyword.",
    },
    {
      original: "Mentored junior engineers and led code reviews.",
      tailored: "Mentored 4 junior engineers; introduced an RFC process now used by 30+ engineers across 3 teams.",
      changed: true,
      reason: "Quantified impact; surfaced leadership signal Stripe values.",
    },
    {
      original: "Collaborated with product and design partners on roadmap.",
      tailored: "Collaborated with product and design partners on roadmap.",
      changed: false,
      reason: null,
    },
    {
      original: "Built internal tools.",
      tailored: "Built internal tooling in Go that cut on-call escalations by 42% over two quarters.",
      changed: true,
      reason: "Surfaced Go (JD nice-to-have) and quantified outcome.",
    },
    {
      original: "Helped with hiring.",
      tailored: "Conducted 60+ technical interviews; co-authored the team's hiring rubric.",
      changed: true,
      reason: "Quantified scope; concrete artifact (rubric).",
    },
  ],
};

export const COVER_LETTER_DRAFT = `Dear Stripe hiring team,

When I rebuilt our ledger service last year, I learned what it costs to be even one cent off across millions of transactions. That's the kind of correctness Stripe cares about, and it's the work I want to keep doing.

I've spent the last five years building backend systems in Python — most recently leading the ledger and payouts platform at Mercury, where I owned a service that processes $1.4B in annual GMV at 99.99% availability. Reducing p99 latency on that service from 240ms to 38ms taught me how much careful design and incremental change matter at scale. The Payments team at Stripe is the natural next room.

A few things drew me here specifically. First, Stripe's culture of writing things down — your engineering blog and public RFCs read like the kind of place I'd grow. Second, the depth of the problem space: idempotency, ledger correctness, distributed transactions are the problems I find genuinely interesting. Third, the people; I've talked with three current Stripes and each one made me want to be in the room.

I'd love to talk about how I can contribute to the Payments team.

Best,
Alex Morgan`;

// ─── helpers ───────────────────────────────────────────────────────────────

export function daysAgo(iso: string, today = new Date()): string {
  if (!iso || iso === "—") return "—";
  const d = new Date(iso);
  const ms = today.getTime() - d.getTime();
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export function shortDate(iso: string): string {
  if (!iso || iso === "—") return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function scoreClass(score: number): "high" | "mid" | "low" {
  if (score >= 85) return "high";
  if (score >= 75) return "mid";
  return "low";
}
