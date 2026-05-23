/** Common skills for lightweight extraction from job descriptions (v1, no LLM). */
const SKILL_DICTIONARY = [
  "TypeScript",
  "JavaScript",
  "Python",
  "Go",
  "Golang",
  "Rust",
  "Java",
  "Kotlin",
  "Swift",
  "Ruby",
  "PHP",
  "C++",
  "C#",
  "React",
  "Next.js",
  "Vue",
  "Angular",
  "Node.js",
  "GraphQL",
  "REST",
  "PostgreSQL",
  "MySQL",
  "MongoDB",
  "Redis",
  "Kafka",
  "AWS",
  "GCP",
  "Azure",
  "Kubernetes",
  "Docker",
  "Terraform",
  "CI/CD",
  "Machine Learning",
  "LLM",
  "PyTorch",
  "TensorFlow",
  "Figma",
  "SQL",
  "NoSQL",
  "Microservices",
  "Distributed Systems",
  "Product Management",
  "Agile",
  "Scrum",
  "Sales",
  "Account Executive",
  "Customer Success",
  "Data Engineering",
  "Spark",
  "Airflow",
  "dbt",
  "Snowflake",
  "BigQuery",
  "iOS",
  "Android",
  "Mobile",
  "Security",
  "Compliance",
  "Payments",
  "FinTech",
];

const NICE_MARKERS = [
  "nice to have",
  "nice-to-have",
  "preferred",
  "bonus",
  "plus if",
];

function norm(s: string) {
  return s.toLowerCase();
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function extractSkillsFromText(text: string): {
  skills: string[];
  niceToHaves: string[];
} {
  const lower = norm(text);
  const found: string[] = [];

  for (const skill of SKILL_DICTIONARY) {
    const pattern = escapeRegExp(norm(skill));
    const re = new RegExp(`\\b${pattern}\\b`, "i");
    if (re.test(lower)) found.push(skill);
  }

  const skills: string[] = [];
  const niceToHaves: string[] = [];
  const seen = new Set<string>();

  for (const skill of found) {
    const key = norm(skill);
    if (seen.has(key)) continue;
    seen.add(key);

    const idx = lower.indexOf(key);
    const window = lower.slice(Math.max(0, idx - 80), idx + 80);
    const isNice = NICE_MARKERS.some((m) => window.includes(m));
    if (isNice) niceToHaves.push(skill);
    else skills.push(skill);
  }

  if (skills.length === 0 && niceToHaves.length > 0) {
    return { skills: niceToHaves.slice(0, 6), niceToHaves: niceToHaves.slice(6) };
  }

  return {
    skills: skills.slice(0, 12),
    niceToHaves: niceToHaves.slice(0, 8),
  };
}
