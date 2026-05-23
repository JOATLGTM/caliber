/** Canonical skill groups — any alias in a group matches any other in the group. */
const SYNONYM_GROUPS: string[][] = [
  ["typescript", "ts", "tsx"],
  ["javascript", "js", "jsx", "ecmascript"],
  ["node.js", "nodejs", "node"],
  ["react", "react.js", "reactjs"],
  ["next.js", "nextjs", "next"],
  ["vue", "vue.js", "vuejs"],
  ["angular", "angularjs"],
  ["golang", "go"],
  ["kubernetes", "k8s"],
  ["postgres", "postgresql", "psql"],
  ["mongo", "mongodb"],
  ["amazon web services", "aws"],
  ["google cloud", "gcp", "google cloud platform"],
  ["microsoft azure", "azure"],
  ["ci/cd", "cicd", "continuous integration"],
  ["machine learning", "ml"],
  ["large language model", "llm", "llms"],
  ["pytorch", "torch"],
  ["tensorflow", "tf"],
  ["c++", "cpp", "c plus plus"],
  ["c#", "csharp", "c sharp"],
  ["ruby on rails", "rails", "ror"],
  ["distributed systems", "distributed system"],
  ["microservices", "microservice"],
  ["sql", "structured query language"],
  ["nosql", "no sql"],
  ["ios", "swift", "swiftui"],
  ["android", "kotlin android"],
  ["data engineering", "data engineer"],
  ["product management", "product manager", "pm"],
  ["figma", "figma design"],
  ["redis", "elasticache"],
  ["kafka", "apache kafka"],
  ["spark", "apache spark"],
  ["airflow", "apache airflow"],
  ["terraform", "iac", "infrastructure as code"],
  ["docker", "containers", "containerization"],
];

const ALIAS_TO_CANONICAL = new Map<string, string>();

for (const group of SYNONYM_GROUPS) {
  const canonical = group[0];
  for (const alias of group) {
    ALIAS_TO_CANONICAL.set(normalizeSkill(alias), canonical);
  }
}

export function normalizeSkill(value: string): string {
  return value.toLowerCase().trim().replace(/\s+/g, " ");
}

/** Map a skill string to its canonical token(s) for overlap checks. */
export function skillTokens(value: string): Set<string> {
  const norm = normalizeSkill(value);
  const tokens = new Set<string>([norm]);
  const canonical = ALIAS_TO_CANONICAL.get(norm);
  if (canonical) tokens.add(canonical);
  return tokens;
}

function skillsMatch(profileSkill: string, jobSkill: string): boolean {
  const a = skillTokens(profileSkill);
  const b = skillTokens(jobSkill);
  for (const t of a) {
    if (b.has(t)) return true;
  }
  // Substring fallback for compound phrases (e.g. "react native" ↔ "react")
  const aNorm = normalizeSkill(profileSkill);
  const bNorm = normalizeSkill(jobSkill);
  if (aNorm.length >= 3 && bNorm.includes(aNorm)) return true;
  if (bNorm.length >= 3 && aNorm.includes(bNorm)) return true;
  return false;
}

export function skillOverlap(
  profileSkills: string[],
  jobSkills: string[],
): { matched: string[]; missing: string[] } {
  const matched: string[] = [];
  const missing: string[] = [];

  for (const required of jobSkills) {
    const hit = profileSkills.find((p) => skillsMatch(p, required));
    if (hit) matched.push(required);
    else missing.push(required);
  }

  return { matched, missing };
}
