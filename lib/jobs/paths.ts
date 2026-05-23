/** Build a safe App Router path for a job id (may contain `:` e.g. greenhouse:123). */
export function jobDetailPath(jobId: string): string {
  return `/jobs/${encodeURIComponent(jobId)}`;
}

/** Decode `[id]` route param back to the canonical jobs.id value. */
export function jobIdFromParam(param: string): string {
  try {
    return decodeURIComponent(param);
  } catch {
    return param;
  }
}
