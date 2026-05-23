/** Minimum match score to appear on the dashboard (saved jobs always shown). */
export const MIN_DISPLAY_MATCH_SCORE = 65;

/** Jobs per dashboard page. */
export const DASHBOARD_PAGE_SIZE = 100;

/** Max jobs surfaced across all pages (4 pages × 100). */
export const MAX_DASHBOARD_JOBS = 400;

export type JobSortKey = "date" | "match" | "salary";

/** Skills that imply a software-engineering profile when target roles are empty. */
export const TECH_SKILL_HINTS = new Set(
  [
    "typescript",
    "javascript",
    "python",
    "go",
    "golang",
    "rust",
    "java",
    "kotlin",
    "react",
    "next.js",
    "node.js",
    "postgresql",
    "aws",
    "kubernetes",
    "docker",
    "graphql",
    "distributed systems",
  ].map((s) => s.toLowerCase()),
);
