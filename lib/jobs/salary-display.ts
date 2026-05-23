/** User-facing label when ATS ingest has no compensation data. */
export const JOB_SALARY_NOT_LISTED = "Not listed";

export function hasJobSalary(salary: string, salaryMin = 0): boolean {
  return Boolean(salary.trim()) || salaryMin > 0;
}

/** Display string + whether comp came from the posting (vs placeholder). */
export function formatJobSalaryDisplay(
  salary: string,
  salaryMin = 0,
): { text: string; isKnown: boolean } {
  const trimmed = salary.trim();
  if (trimmed) return { text: trimmed, isKnown: true };
  if (salaryMin > 0) {
    return { text: `$${Math.round(salaryMin / 1000)}k+`, isKnown: true };
  }
  return { text: JOB_SALARY_NOT_LISTED, isKnown: false };
}
