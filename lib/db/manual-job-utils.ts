/** Owner id for user-added jobs (column or raw_payload fallback). */
export function manualJobOwnerId(row: {
  owner_user_id?: string | null;
  raw_payload?: unknown;
}): string | null {
  if (row.owner_user_id) return row.owner_user_id;
  const payload = row.raw_payload as { owner_user_id?: string } | null | undefined;
  return payload?.owner_user_id ?? null;
}

export function isManualJobOwnedBy(
  row: { source?: string | null; owner_user_id?: string | null; raw_payload?: unknown },
  userId: string,
): boolean {
  if (row.source !== "manual") return true;
  return manualJobOwnerId(row) === userId;
}
