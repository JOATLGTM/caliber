/** Drop ATS postings older than this at ingest; also hide on dashboard. */
export const MAX_JOB_AGE_DAYS = 90;

export function isJobPostingFresh(postedAt: string): boolean {
  const posted = new Date(postedAt);
  if (Number.isNaN(posted.getTime())) return false;
  const ageMs = Date.now() - posted.getTime();
  return ageMs <= MAX_JOB_AGE_DAYS * 24 * 60 * 60 * 1000;
}

export function postedAtCutoffDate(): string {
  const d = new Date();
  d.setDate(d.getDate() - MAX_JOB_AGE_DAYS);
  return d.toISOString().slice(0, 10);
}
